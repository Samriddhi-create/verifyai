from __future__ import annotations

"""Row-level shapes matching the Supabase/Postgres tables.

These mirror the `verifications` table exactly (claims are stored as a JSON
column rather than a normalized `claims` table, which keeps a full
verification report readable/writable in a single round trip).
"""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel


class VerificationRow(BaseModel):
    id: UUID
    user_id: UUID
    original_text: str
    source_url: str | None = None
    claims: list[dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True
