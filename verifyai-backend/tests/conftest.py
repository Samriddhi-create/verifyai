import os

# Must be set before `app.main` (and its transitive imports) load, since
# `Settings()` reads the environment at import time.
os.environ.setdefault("GROQ_API_KEY", "gsk-test")
os.environ.setdefault("GROQ_MODEL", "openai/gpt-oss-120b")
os.environ.setdefault("TAVILY_API_KEY", "tvly-test")
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "sb_publishable_test")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "sb_secret_test")

import pytest
from fastapi.testclient import TestClient

from app.api.deps import get_current_user, get_optional_user
from app.main import app
from app.models.auth import AuthenticatedUser

TEST_USER = AuthenticatedUser(id="11111111-1111-1111-1111-111111111111", email="test@example.com")


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture()
def authenticated(client: TestClient):
    """Overrides auth dependencies to resolve as TEST_USER for this test."""
    app.dependency_overrides[get_current_user] = lambda: TEST_USER
    app.dependency_overrides[get_optional_user] = lambda: TEST_USER
    yield TEST_USER
    app.dependency_overrides.pop(get_current_user, None)
    app.dependency_overrides.pop(get_optional_user, None)
