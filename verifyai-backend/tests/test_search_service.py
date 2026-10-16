from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from app.core.errors import UpstreamServiceError
from app.services.search_service import SearchService


def _mock_response(json_body: dict) -> MagicMock:
    response = MagicMock()
    response.json.return_value = json_body
    response.raise_for_status = MagicMock()
    return response


@pytest.mark.asyncio
async def test_search_claim_returns_evidence_snippets():
    service = SearchService()
    fake_results = {
        "results": [
            {"url": "https://a.com", "title": "A", "content": "Confirms the claim.", "published_date": "2026-01-01"},
            {"url": "https://b.com", "title": "B", "content": ""},  # missing content, should be filtered out
        ]
    }

    with patch("httpx.AsyncClient.post", new=AsyncMock(return_value=_mock_response(fake_results))):
        evidence = await service.search_claim("Some claim")

    assert len(evidence) == 1
    assert evidence[0].url == "https://a.com"
    assert evidence[0].source_name == "a.com"


@pytest.mark.asyncio
async def test_search_claim_raises_upstream_error_on_network_failure():
    service = SearchService()

    with patch("httpx.AsyncClient.post", new=AsyncMock(side_effect=httpx.ConnectError("boom"))):
        with pytest.raises(UpstreamServiceError):
            await service.search_claim("Some claim")
