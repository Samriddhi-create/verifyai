from __future__ import annotations

import time

import httpx
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import get_settings
from app.core.errors import UnauthorizedError
from app.models.auth import AuthenticatedUser

_bearer_scheme = HTTPBearer(auto_error=False)

# Supabase signs session JWTs with an asymmetric key pair (ES256) and
# publishes the public half at this well-known JWKS endpoint, rotating keys
# over time. Verifying against the JWKS (rather than a static shared
# secret) means rotations never require an env var update. Cached
# in-process for an hour; a `kid` miss forces one immediate refetch to
# handle a rotation that just happened.
_JWKS_CACHE: dict[str, tuple[float, dict]] = {}
_JWKS_TTL_SECONDS = 3600


async def _fetch_jwks(supabase_url: str) -> dict:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(f"{supabase_url}/auth/v1/.well-known/jwks.json")
        response.raise_for_status()
    return response.json()


async def _get_jwks(supabase_url: str, *, force_refresh: bool = False) -> dict:
    cached = _JWKS_CACHE.get(supabase_url)
    now = time.time()
    if not force_refresh and cached is not None and now - cached[0] < _JWKS_TTL_SECONDS:
        return cached[1]

    jwks = await _fetch_jwks(supabase_url)
    _JWKS_CACHE[supabase_url] = (now, jwks)
    return jwks


async def _resolve_signing_key(token: str, supabase_url: str) -> dict:
    try:
        header = jwt.get_unverified_header(token)
    except JWTError as exc:
        raise UnauthorizedError("Invalid session token.") from exc

    kid = header.get("kid")
    jwks = await _get_jwks(supabase_url)
    key = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)

    if key is None:
        # The key may have just rotated; refetch once before giving up.
        jwks = await _get_jwks(supabase_url, force_refresh=True)
        key = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)

    if key is None:
        raise UnauthorizedError("Session token was signed with an unrecognized key.")
    return key


async def _decode_token(token: str) -> AuthenticatedUser:
    settings = get_settings()
    signing_key = await _resolve_signing_key(token, settings.supabase_url)

    try:
        # jose accepts a raw JWK dict as the verification key directly.
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=[signing_key.get("alg", "ES256")],
            audience="authenticated",
        )
    except JWTError as exc:
        raise UnauthorizedError("Invalid or expired session token.") from exc

    subject = payload.get("sub")
    if not subject:
        raise UnauthorizedError("Invalid session token.")

    return AuthenticatedUser(id=subject, email=payload.get("email"))


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> AuthenticatedUser:
    if credentials is None:
        raise UnauthorizedError()
    return await _decode_token(credentials.credentials)


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> AuthenticatedUser | None:
    if credentials is None:
        return None
    try:
        return await _decode_token(credentials.credentials)
    except UnauthorizedError:
        return None
