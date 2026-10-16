from __future__ import annotations

import asyncio
import logging
from uuid import UUID

from app.core.config import get_settings
from app.models.verification import Claim, VerificationReport, VerifyRequest
from app.services.chunking import chunk_text
from app.services.llm_service import LLMService
from app.services.search_service import SearchService

logger = logging.getLogger(__name__)


class VerificationService:
    def __init__(self, llm_service: LLMService | None = None, search_service: SearchService | None = None):
        settings = get_settings()
        self._chunk_size = settings.chunk_size_chars
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

        claims = await asyncio.gather(*(self._verify_single_claim(text) for text in deduped))

        return VerificationReport(
            user_id=user_id,
            original_text=request.text,
            source_url=request.source_url,
            claims=list(claims),
        )

    async def _verify_single_claim(self, claim_text: str) -> Claim:
        evidence = await self._search.search_claim(claim_text)
        status, confidence, reasoning = await self._llm.analyze_evidence(claim_text, evidence)
        return Claim(
            claim_text=claim_text,
            status=status,
            evidence=evidence,
            confidence_score=confidence,
            reasoning=reasoning,
        )
