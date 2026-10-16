from __future__ import annotations

import asyncio
import logging
from uuid import UUID

from app.core.config import get_settings
from app.core.errors import UpstreamServiceError
from app.models.verification import (
    AgentAttempt,
    Claim,
    ClaimStatus,
    EvidenceSnippet,
    VerificationReport,
    VerifyRequest,
)
from app.services.chunking import chunk_text
from app.services.llm_service import LLMService
from app.services.search_service import SearchService

logger = logging.getLogger(__name__)

# A claim is retried with a rewritten search query while its result is
# unverified or less confident than this.
CONFIDENCE_THRESHOLD = 0.7
# Total search-and-judge rounds per claim, including the first.
MAX_ATTEMPTS = 3


def _is_better(candidate: Claim, best: Claim) -> bool:
    """A real verdict beats "unverified"; among equals, higher confidence wins."""
    candidate_rank = (candidate.status is not ClaimStatus.UNVERIFIED, candidate.confidence_score)
    best_rank = (best.status is not ClaimStatus.UNVERIFIED, best.confidence_score)
    return candidate_rank > best_rank


class VerificationService:
    def __init__(self, llm_service: LLMService | None = None, search_service: SearchService | None = None):
        settings = get_settings()
        self._chunk_size = settings.chunk_size_chars
        self._max_claims_per_request = settings.max_claims_per_request
        self._llm = llm_service or LLMService()
        self._search = search_service or SearchService()

    async def verify(self, request: VerifyRequest, user_id: UUID | None) -> VerificationReport:
        chunks = chunk_text(request.text, self._chunk_size)
        logger.info("Verifying text of %d chars across %d chunk(s)", len(request.text), len(chunks))

        claim_lists = await asyncio.gather(*(self._llm.extract_claims(chunk) for chunk in chunks))
        claim_texts = [claim for sublist in claim_lists for claim in sublist]

        # De-duplicate near-identical claims across chunk boundaries while
        # preserving first-seen order.
        seen: set[str] = set()
        deduped: list[str] = []
        for claim_text in claim_texts:
            key = claim_text.lower().strip()
            if key not in seen:
                seen.add(key)
                deduped.append(claim_text)

        # Each claim can cost several searches and model calls, so cap how many
        # one request verifies.
        dropped = len(deduped) - self._max_claims_per_request
        if dropped > 0:
            logger.info("Dropping %d claim(s) over the per-request limit of %d", dropped, self._max_claims_per_request)
            deduped = deduped[: self._max_claims_per_request]

        claims =await asyncio.gather(*(self._verify_single_claim(text) for text in deduped))

        return VerificationReport(
            user_id=user_id,
            original_text=request.text,
            source_url=request.source_url,
            claims=list(claims),
        )

    async def _run_attempt(self, claim_text: str, query: str) -> Claim:
        evidence = await self._search.search_claim(query)
        status, confidence, reasoning = await self._llm.analyze_evidence(claim_text, evidence)
        return Claim(
            claim_text=claim_text,
            status=status,
            evidence=evidence,
            confidence_score=confidence,
            reasoning=reasoning,
        )

    async def _verify_single_claim(self, claim_text: str) -> Claim:
        trace: list[AgentAttempt] = []
        queries: list[str] = []
        weak_evidence: list[EvidenceSnippet] = []
        best: Claim | None = None

        for attempt in range(1, MAX_ATTEMPTS + 1):
            if attempt == 1:
                # Errors on the first attempt propagate: there is no result to fall back on.
                query = claim_text
                result = await self._run_attempt(claim_text, query)
            else:
                try:
                    query = await self._llm.rewrite_query(claim_text, list(queries), list(weak_evidence))
                    result = await self._run_attempt(claim_text, query)
                except UpstreamServiceError:
                    logger.warning("Retry %d failed for claim; keeping best result so far", attempt, exc_info=True)
                    break

            queries.append(query)
            weak_evidence.extend(result.evidence)
            trace.append(
                AgentAttempt(
                    attempt=attempt,
                    query=query,
                    sources_found=len(result.evidence),
                    status=result.status,
                    confidence_score=result.confidence_score,
                )
            )
            if best is None or _is_better(result, best):
                best = result
            if result.status is not ClaimStatus.UNVERIFIED and result.confidence_score >= CONFIDENCE_THRESHOLD:
                break

        assert best is not None
        return best.model_copy(update={"trace": trace})
