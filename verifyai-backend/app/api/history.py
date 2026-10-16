from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user
from app.models.auth import AuthenticatedUser
from app.models.verification import HistoryResponse
from app.services.supabase_service import SupabaseService

router = APIRouter(prefix="/api", tags=["history"])

_supabase_service = SupabaseService()


@router.get("/history", response_model=HistoryResponse)
async def get_history(
    user: AuthenticatedUser = Depends(get_current_user),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> HistoryResponse:
    return await _supabase_service.list_history(user.id, limit=limit, offset=offset)
