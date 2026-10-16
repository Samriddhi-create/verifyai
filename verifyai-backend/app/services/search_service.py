from __future__ import annotations

import logging

import httpx

from app.core.config import get_settings
from app.core.errors import UpstreamServiceError
from app.models.verification import EvidenceSnippet

logger = logging.getLogger(__name__)

_TAVILY_SEARCH_URL = "https://api.tavily.com/search"


class SearchService:
    def __init__(self) -> None:
        settings = get_settings()
        self._api_key = settings.tavily_api_key
        self._max_results = settings.max_evidence_per_claim

    async def search_claim(self, claim: str) -> list[EvidenceSnippet]:
        payload = {
            "api_key": self._api_key,
            "query": claim,
            "search_depth": "advanced",
            "max_results": self._max_results,
            "include_answer": False,
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(_TAVILY_SEARCH_URL, json=payload)
                response.raise_for_status()
        except httpx.HTTPError as exc:
            logger.exception("Tavily search failed for claim: %s", claim)
            raise UpstreamServiceError("Web search failed. Please try again.") from exc

        results = response.json().get("results", [])
        return [
            EvidenceSnippet(
                url=r.get("url", ""),
                title=r.get("title", "Untitled"),
                snippet=(r.get("content") or "").strip()[:500],
                source_name=_hostname(r.get("url", "")),
                published_date=r.get("published_date"),
            )
            for r in results
            if r.get("url") and r.get("content")
        ]


def _hostname(url: str) -> str | None:
    try:
        from urllib.parse import urlparse

        return urlparse(url).netloc or None
    except ValueError:
        return None
