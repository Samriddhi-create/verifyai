from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel


class AuthenticatedUser(BaseModel):
    id: UUID
    email: str | None = None


class LoginRequest(BaseModel):
    provider: str  # "google" | "github"
    redirect_to: str


class LoginResponse(BaseModel):
    auth_url: str


class SessionResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: AuthenticatedUser
