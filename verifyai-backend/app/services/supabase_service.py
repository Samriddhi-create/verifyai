from __future__ import annotations

import asyncio
import logging
from uuid import UUID

from supabase import Client, create_client

from app.core.config import get_settings
from app.core.errors import UpstreamServiceError
from app.models.verification import (
    ClaimStatus,
    HistoryResponse,
    VerificationReport,
    VerificationSummary,
    compute_trust_score,
    compute_verdict,
)

logger = logging.getLogger(__name__)

_TABLE = "verifications"


class SupabaseService:
    """Wraps the Supabase Python client (sync) for use from async endpoints.

    Uses the service-role key: RLS is bypassed here by design, so every
    query below MUST filter by the caller's authenticated user_id.
    """

    def __init__(self) -> None:
        settings = get_settings()
        self._client: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)

    async def save_verification(self, report: VerificationReport) -> None:
        if report.user_id is None:
            return

        def _insert() -> None:
            self._client.table(_TABLE).insert(
                {
                    "id": str(report.id),
                    "user_id": str(report.user_id),
                    "original_text": report.original_text,
                    "source_url": report.source_url,
                    "claims": [claim.model_dump(mode="json") for claim in report.claims],
                    "created_at": report.created_at.isoformat(),
                }
            ).execute()

        try:
            await asyncio.to_thread(_insert)
        except Exception as exc:  # noqa: BLE001 - supabase client raises generic exceptions
            logger.exception("Failed to persist verification %s", report.id)
            raise UpstreamServiceError("Could not save verification history.") from exc

    async def list_history(self, user_id: UUID, limit: int = 50, offset: int = 0) -> HistoryResponse:
        def _query():
            return (
                self._client.table(_TABLE)
                .select("id, original_text, claims, created_at", count="exact")
                .eq("user_id", str(user_id))
                .order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )

        try:
            result = await asyncio.to_thread(_query)
        except Exception as exc:  # noqa: BLE001
            logger.exception("Failed to fetch history for user %s", user_id)
            raise UpstreamServiceError("Could not load verification history.") from exc

        items = []
        for row in result.data:
            statuses = _statuses(row["claims"])
            items.append(
                VerificationSummary(
                    id=row["id"],
                    original_text=row["original_text"],
                    claim_count=len(row["claims"]),
                    summary=_summarize(statuses),
                    trust_score=compute_trust_score(statuses),
                    verdict=compute_verdict(statuses),
                    created_at=row["created_at"],
                )
            )
        return HistoryResponse(items=items, total=result.count or len(items))


def _statuses(claims: list[dict]) -> list[ClaimStatus]:
    valid = {status.value for status in ClaimStatus}
    return [ClaimStatus(claim["status"]) for claim in claims if claim.get("status") in valid]


def _summarize(statuses: list[ClaimStatus]) -> dict[str, int]:
    counts = {status.value: 0 for status in ClaimStatus}
    for status in statuses:
        counts[status.value] += 1
    return counts
