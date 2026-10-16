from __future__ import annotations

import logging

from fastapi import APIRouter, status
from supabase import create_client

from app.core.config import get_settings
from app.core.errors import AppError
from app.models.auth import AuthenticatedUser, LoginRequest, LoginResponse, SessionResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])
logger = logging.getLogger(__name__)

_SUPPORTED_PROVIDERS = {"google", "github"}


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest) -> LoginResponse:
    """Returns a Supabase OAuth authorize URL. The extension opens this via
    chrome.identity.launchWebAuthFlow and Supabase redirects back to
    `redirect_to` with the session in the URL fragment.
    """
    if payload.provider not in _SUPPORTED_PROVIDERS:
        raise AppError(
            f"Unsupported provider '{payload.provider}'. Use one of: {sorted(_SUPPORTED_PROVIDERS)}.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    settings = get_settings()
    client = create_client(settings.supabase_url, settings.supabase_anon_key)
    result = client.auth.sign_in_with_oauth(
        {
            "provider": payload.provider,
            "options": {"redirect_to": payload.redirect_to, "skip_http_redirect": True},
        }
    )
    return LoginResponse(auth_url=result.url)


@router.get("/callback", response_model=SessionResponse)
async def callback(code: str) -> SessionResponse:
    """Exchanges a Supabase PKCE auth code for a session.

    Only needed for server-rendered clients (e.g. the optional web
    dashboard). The Chrome extension uses chrome.identity.launchWebAuthFlow,
    which receives the session directly in the redirect URL fragment and
    never hits this endpoint.
    """
    settings = get_settings()
    client = create_client(settings.supabase_url, settings.supabase_anon_key)
    try:
        result = client.auth.exchange_code_for_session({"auth_code": code})
    except Exception as exc:  # noqa: BLE001 - supabase client raises generic exceptions
        raise AppError("Failed to exchange auth code for a session.", status.HTTP_400_BAD_REQUEST) from exc

    session = result.session
    user = result.user
    return SessionResponse(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        user=AuthenticatedUser(id=user.id, email=user.email),
    )
