from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, status

from app.core.config import get_settings
from app.core.errors import AppError, UpstreamServiceError
from app.models.auth import AuthenticatedUser
from app.models.verification import VerificationReport, VerifyRequest
from app.services.supabase_service import SupabaseService
from app.services.verification_service import VerificationService
from app.api.deps import get_optional_user

router = APIRouter(prefix="/api", tags=["verify"])
logger = logging.getLogger(__name__)

_verification_service = VerificationService()
_supabase_service = SupabaseService()


@router.post("/verify", response_model=VerificationReport, status_code=status.HTTP_200_OK)
async def verify_text(
    payload: VerifyRequest,
    user: AuthenticatedUser | None = Depends(get_optional_user),
) -> VerificationReport:
    settings = get_settings()
    if len(payload.text) > settings.max_text_length:
        raise AppError(
            f"Text exceeds the {settings.max_text_length}-character limit.",
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
        )

    report = await _verification_service.verify(payload, user_id=user.id if user else None)

    if user is not None:
        # History persistence is a side effect, not the point of this
        # endpoint — a save failure (e.g. a misconfigured table) shouldn't
        # hide a verification result the user already got back correctly.
        try:
            await _supabase_service.save_verification(report)
        except UpstreamServiceError:
            logger.warning("Verification %s completed but was not saved to history", report.id, exc_info=True)

    return report
