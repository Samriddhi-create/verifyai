from unittest.mock import AsyncMock

import app.api.verify as verify_module
from app.core.errors import UpstreamServiceError
from app.models.verification import Claim, ClaimStatus, VerificationReport


def _fake_report(text: str) -> VerificationReport:
    return VerificationReport(
        original_text=text,
        claims=[
            Claim(
                claim_text="The Eiffel Tower is in Paris.",
                status=ClaimStatus.SUPPORTED,
                evidence=[],
                confidence_score=0.95,
                reasoning="Well-established fact.",
            )
        ],
    )


def test_verify_valid_text_returns_report(client, monkeypatch):
    monkeypatch.setattr(
        verify_module._verification_service, "verify", AsyncMock(side_effect=lambda req, user_id: _fake_report(req.text))
    )

    response = client.post("/api/verify", json={"text": "The Eiffel Tower is in Paris."})

    assert response.status_code == 200
    body = response.json()
    assert body["original_text"] == "The Eiffel Tower is in Paris."
    assert body["claims"][0]["status"] == "supported"


def test_verify_empty_text_returns_422(client):
    response = client.post("/api/verify", json={"text": "   "})
    assert response.status_code == 422


def test_verify_missing_text_field_returns_422(client):
    response = client.post("/api/verify", json={})
    assert response.status_code == 422


def test_verify_oversized_text_returns_413(client, monkeypatch):
    monkeypatch.setattr(verify_module, "get_settings", lambda: type("Settings", (), {"max_text_length": 10})())

    response = client.post("/api/verify", json={"text": "x" * 50})
    assert response.status_code == 413


def test_verify_upstream_failure_returns_502(client, monkeypatch):
    async def _raise(*args, **kwargs):
        raise UpstreamServiceError("Claim extraction failed. Please try again.")

    monkeypatch.setattr(verify_module._verification_service, "verify", _raise)

    response = client.post("/api/verify", json={"text": "Some claim to verify."})

    assert response.status_code == 502
    assert response.json()["error"]["message"] == "Claim extraction failed. Please try again."


def test_verify_does_not_save_history_when_unauthenticated(client, monkeypatch):
    save_mock = AsyncMock()
    monkeypatch.setattr(
        verify_module._verification_service, "verify", AsyncMock(side_effect=lambda req, user_id: _fake_report(req.text))
    )
    monkeypatch.setattr(verify_module._supabase_service, "save_verification", save_mock)

    client.post("/api/verify", json={"text": "The Eiffel Tower is in Paris."})

    save_mock.assert_not_called()


def test_verify_saves_history_when_authenticated(client, monkeypatch, authenticated):
    save_mock = AsyncMock()
    monkeypatch.setattr(
        verify_module._verification_service, "verify", AsyncMock(side_effect=lambda req, user_id: _fake_report(req.text))
    )
    monkeypatch.setattr(verify_module._supabase_service, "save_verification", save_mock)

    response = client.post("/api/verify", json={"text": "The Eiffel Tower is in Paris."})

    assert response.status_code == 200
    save_mock.assert_awaited_once()


def test_verify_still_returns_report_when_history_save_fails(client, monkeypatch, authenticated):
    async def _raise_on_save(*args, **kwargs):
        raise UpstreamServiceError("Could not save verification history.")

    monkeypatch.setattr(
        verify_module._verification_service, "verify", AsyncMock(side_effect=lambda req, user_id: _fake_report(req.text))
    )
    monkeypatch.setattr(verify_module._supabase_service, "save_verification", _raise_on_save)

    response = client.post("/api/verify", json={"text": "The Eiffel Tower is in Paris."})

    assert response.status_code == 200
    assert response.json()["claims"][0]["status"] == "supported"
