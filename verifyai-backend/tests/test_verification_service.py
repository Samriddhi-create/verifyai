from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.core.errors import UpstreamServiceError
from app.models.verification import ClaimStatus, EvidenceSnippet
from app.services.verification_service import MAX_ATTEMPTS, VerificationService

CLAIM = "The Eiffel Tower was completed in 1889."


def _evidence(title: str) -> list[EvidenceSnippet]:
    return [EvidenceSnippet(url=f"https://example.com/{title}", title=title, snippet="...")]


def _service(analyses, searches=None, rewrites=None) -> tuple[VerificationService, SimpleNamespace, SimpleNamespace]:
    llm = SimpleNamespace(
        analyze_evidence=AsyncMock(side_effect=analyses),
        rewrite_query=AsyncMock(side_effect=rewrites or [f"query {n}" for n in range(2, MAX_ATTEMPTS + 1)]),
    )
    search = SimpleNamespace(
        search_claim=AsyncMock(side_effect=searches or [_evidence(f"result {n}") for n in range(1, MAX_ATTEMPTS + 1)])
    )
    return VerificationService(llm_service=llm, search_service=search), llm, search


@pytest.mark.asyncio
async def test_no_retry_when_first_attempt_is_confident():
    service, llm, search = _service([(ClaimStatus.SUPPORTED, 0.9, "Confirmed.")])

    claim = await service._verify_single_claim(CLAIM)

    assert claim.status is ClaimStatus.SUPPORTED
    assert claim.confidence_score == 0.9
    assert len(claim.trace) == 1
    assert claim.trace[0].query == CLAIM
    assert claim.trace[0].sources_found == 1
    search.search_claim.assert_awaited_once_with(CLAIM)
    llm.rewrite_query.assert_not_awaited()


@pytest.mark.asyncio
async def test_retry_improves_result():
    service, llm, search = _service(
        [(ClaimStatus.UNVERIFIED, 0.2, "Nothing relevant."), (ClaimStatus.SUPPORTED, 0.85, "Confirmed.")]
    )

    claim = await service._verify_single_claim(CLAIM)

    assert claim.status is ClaimStatus.SUPPORTED
    assert claim.reasoning == "Confirmed."
    assert claim.evidence[0].title == "result 2"
    assert [a.query for a in claim.trace] == [CLAIM, "query 2"]
    llm.rewrite_query.assert_awaited_once_with(CLAIM, [CLAIM], _evidence("result 1"))
    # The rewritten query drives the search, but the original claim is still what gets judged.
    search.search_claim.assert_awaited_with("query 2")
    assert llm.analyze_evidence.await_args_list[1].args[0] == CLAIM


@pytest.mark.asyncio
async def test_stops_after_max_attempts():
    service, llm, search = _service([(ClaimStatus.UNVERIFIED, 0.1, "Nothing.")] * MAX_ATTEMPTS)

    claim = await service._verify_single_claim(CLAIM)

    assert [a.attempt for a in claim.trace] == [1, 2, 3]
    assert search.search_claim.await_count == MAX_ATTEMPTS
    assert llm.rewrite_query.await_count == MAX_ATTEMPTS - 1
    assert claim.status is ClaimStatus.UNVERIFIED


@pytest.mark.asyncio
async def test_keeps_best_attempt_when_retry_is_worse():
    service, _, _ = _service(
        [
            (ClaimStatus.PARTIAL, 0.6, "Partly confirmed."),
            (ClaimStatus.UNVERIFIED, 0.0, "Nothing relevant."),
            (ClaimStatus.PARTIAL, 0.4, "Weaker partial."),
        ]
    )

    claim = await service._verify_single_claim(CLAIM)

    assert claim.status is ClaimStatus.PARTIAL
    assert claim.confidence_score == 0.6
    assert claim.reasoning == "Partly confirmed."
    assert claim.evidence[0].title == "result 1"
    assert len(claim.trace) == 3


@pytest.mark.asyncio
async def test_failed_retry_returns_best_so_far():
    service, _, _ = _service(
        [(ClaimStatus.PARTIAL, 0.5, "Partly confirmed.")],
        searches=[_evidence("result 1"), UpstreamServiceError("Web search failed.")],
    )

    claim = await service._verify_single_claim(CLAIM)

    assert claim.status is ClaimStatus.PARTIAL
    assert claim.reasoning == "Partly confirmed."
    assert len(claim.trace) == 1


@pytest.mark.asyncio
async def test_failed_rewrite_returns_best_so_far():
    service, _, search = _service(
        [(ClaimStatus.UNVERIFIED, 0.0, "Nothing.")],
        rewrites=[UpstreamServiceError("Query rewrite failed.")],
    )

    claim = await service._verify_single_claim(CLAIM)

    assert claim.status is ClaimStatus.UNVERIFIED
    assert len(claim.trace) == 1
    search.search_claim.assert_awaited_once()


@pytest.mark.asyncio
async def test_first_attempt_failure_propagates():
    service, _, _ = _service([], searches=[UpstreamServiceError("Web search failed.")])

    with pytest.raises(UpstreamServiceError):
        await service._verify_single_claim(CLAIM)
