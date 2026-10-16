from unittest.mock import AsyncMock

import app.api.history as history_module
from app.models.verification import HistoryResponse, VerificationSummary


def test_history_requires_auth(client):
    response = client.get("/api/history")
    assert response.status_code == 401


def test_history_rejects_invalid_token(client):
    response = client.get("/api/history", headers={"Authorization": "Bearer not-a-real-token"})
    assert response.status_code == 401


def test_history_returns_items_for_authenticated_user(client, monkeypatch, authenticated):
    fake_response = HistoryResponse(
        items=[
            VerificationSummary(
                id="22222222-2222-2222-2222-222222222222",
                original_text="Sample verified text",
                claim_count=2,
                summary={"supported": 1, "partial": 1, "contradicted": 0, "unverified": 0},
                created_at="2026-01-01T00:00:00Z",
            )
        ],
        total=1,
    )
    monkeypatch.setattr(history_module._supabase_service, "list_history", AsyncMock(return_value=fake_response))

    response = client.get("/api/history")

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["claim_count"] == 2
