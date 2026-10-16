import json
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from openai import APIConnectionError

from app.core.errors import UpstreamServiceError
from app.models.verification import ClaimStatus, EvidenceSnippet
from app.services.llm_service import LLMService


def _chat_completion(payload: dict) -> SimpleNamespace:
    return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=json.dumps(payload)))])


@pytest.mark.asyncio
async def test_extract_claims_parses_and_caps_results():
    service = LLMService()
    service._max_claims_per_chunk = 2
    service._client = SimpleNamespace(
        chat=SimpleNamespace(
            completions=SimpleNamespace(
                create=AsyncMock(return_value=_chat_completion({"claims": ["Claim one.", "Claim two.", "Claim three."]}))
            )
        )
    )

    claims = await service.extract_claims("Some AI-generated text with several facts.")

    assert claims == ["Claim one.", "Claim two."]


@pytest.mark.asyncio
async def test_extract_claims_raises_upstream_error_on_api_failure():
    service = LLMService()
    service._client = SimpleNamespace(
        chat=SimpleNamespace(
            completions=SimpleNamespace(
                create=AsyncMock(side_effect=APIConnectionError(request=SimpleNamespace()))
            )
        )
    )

    with pytest.raises(UpstreamServiceError):
        await service.extract_claims("text")


@pytest.mark.asyncio
async def test_extract_claims_strips_markdown_code_fences():
    service = LLMService()
    fenced_content = "```json\n" + json.dumps({"claims": ["Claim one."]}) + "\n```"
    service._client = SimpleNamespace(
        chat=SimpleNamespace(
            completions=SimpleNamespace(
                create=AsyncMock(
                    return_value=SimpleNamespace(
                        choices=[SimpleNamespace(message=SimpleNamespace(content=fenced_content))]
                    )
                )
            )
        )
    )

    claims = await service.extract_claims("Some text.")

    assert claims == ["Claim one."]


@pytest.mark.asyncio
async def test_extract_claims_raises_upstream_error_on_malformed_json():
    service = LLMService()
    service._client = SimpleNamespace(
        chat=SimpleNamespace(
            completions=SimpleNamespace(
                create=AsyncMock(
                    return_value=SimpleNamespace(
                        choices=[SimpleNamespace(message=SimpleNamespace(content="not json at all"))]
                    )
                )
            )
        )
    )

    with pytest.raises(UpstreamServiceError):
        await service.extract_claims("Some text.")


@pytest.mark.asyncio
async def test_analyze_evidence_returns_unverified_when_no_evidence():
    service = LLMService()
    status, confidence, reasoning = await service.analyze_evidence("A claim.", [])

    assert status == ClaimStatus.UNVERIFIED
    assert confidence == 0.0
    assert "No supporting evidence" in reasoning


@pytest.mark.asyncio
async def test_analyze_evidence_clamps_confidence_score():
    service = LLMService()
    service._client = SimpleNamespace(
        chat=SimpleNamespace(
            completions=SimpleNamespace(
                create=AsyncMock(
                    return_value=_chat_completion(
                        {"status": "supported", "confidence_score": 1.5, "reasoning": "Matches the sources."}
                    )
                )
            )
        )
    )
    evidence = [EvidenceSnippet(url="https://example.com", title="Example", snippet="Confirms the claim.")]

    status, confidence, reasoning = await service.analyze_evidence("A claim.", evidence)

    assert status == ClaimStatus.SUPPORTED
    assert confidence == 1.0
    assert reasoning == "Matches the sources."
