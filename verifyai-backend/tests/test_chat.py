from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

import app.api.chat as chat_module
from app.core.errors import UpstreamServiceError
from app.models.chat import MAX_CONTEXT_CLAIMS, MAX_HISTORY_MESSAGES, ChatMessage, ChatRole
from app.models.verification import Claim, ClaimStatus
from app.services.llm_service import LLMService

CLAIM = {
    "id": "33333333-3333-3333-3333-333333333333",
    "claim_text": "The Eiffel Tower was completed in 1889.",
    "status": "supported",
    "evidence": [],
    "confidence_score": 0.97,
    "reasoning": "Multiple sources agree.",
}


def _payload(**overrides):
    body = {"original_text": "The Eiffel Tower was completed in 1889.", "claims": [CLAIM], "history": [], "question": "Who built it?"}
    body.update(overrides)
    return body


def test_chat_returns_answer(client, monkeypatch):
    answer = AsyncMock(return_value="Gustave Eiffel's company built it.")
    monkeypatch.setattr(chat_module._llm_service, "answer_followup", answer)

    response = client.post("/api/chat", json=_payload())

    assert response.status_code == 200
    assert response.json() == {"answer": "Gustave Eiffel's company built it."}
    assert answer.await_args.kwargs["question"] == "Who built it?"


def test_chat_trims_the_question(client, monkeypatch):
    answer = AsyncMock(return_value="ok")
    monkeypatch.setattr(chat_module._llm_service, "answer_followup", answer)

    client.post("/api/chat", json=_payload(question="   Who built it?  "))

    assert answer.await_args.kwargs["question"] == "Who built it?"


@pytest.mark.parametrize("question", ["", "    ", "x" * 2001])
def test_chat_rejects_bad_questions(client, question):
    assert client.post("/api/chat", json=_payload(question=question)).status_code == 422


def test_chat_rejects_oversized_context(client):
    assert client.post("/api/chat", json=_payload(original_text="x" * 50_001)).status_code == 422
    assert client.post("/api/chat", json=_payload(claims=[CLAIM] * (MAX_CONTEXT_CLAIMS + 1))).status_code == 422


def test_chat_keeps_only_the_latest_history(client, monkeypatch):
    answer = AsyncMock(return_value="ok")
    monkeypatch.setattr(chat_module._llm_service, "answer_followup", answer)
    history = [{"role": "user" if i % 2 == 0 else "assistant", "content": f"message {i}"} for i in range(30)]

    client.post("/api/chat", json=_payload(history=history))

    sent = answer.await_args.kwargs["history"]
    assert len(sent) == MAX_HISTORY_MESSAGES
    assert sent[-1].content == "message 29"


def test_chat_upstream_failure_returns_502(client, monkeypatch):
    monkeypatch.setattr(
        chat_module._llm_service, "answer_followup", AsyncMock(side_effect=UpstreamServiceError("Chat failed. Please try again."))
    )

    response = client.post("/api/chat", json=_payload())

    assert response.status_code == 502
    assert response.json()["error"]["message"] == "Chat failed. Please try again."


def _service_returning(content: str | None) -> tuple[LLMService, AsyncMock]:
    create = AsyncMock(return_value=SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=content))]))
    service = LLMService()
    service._client = SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=create)))
    return service, create


async def test_answer_followup_sends_context_then_history_then_question():
    service, create = _service_returning("  Gustave Eiffel.  ")
    claim = Claim(claim_text="The tower opened in 1889.", status=ClaimStatus.SUPPORTED, confidence_score=0.9)
    history = [ChatMessage(role=ChatRole.USER, content="Earlier question"), ChatMessage(role=ChatRole.ASSISTANT, content="Earlier answer")]

    answer = await service.answer_followup("Some text", [claim], history, "Who built it?")

    assert answer == "Gustave Eiffel."
    messages = create.await_args.kwargs["messages"]
    assert [m["role"] for m in messages] == ["system", "user", "assistant", "user", "assistant", "user"]
    assert "The tower opened in 1889." in messages[1]["content"]
    assert "Status: supported" in messages[1]["content"]
    assert messages[-1] == {"role": "user", "content": "Who built it?"}
    assert "response_format" not in create.await_args.kwargs  # plain text, not JSON mode


async def test_answer_followup_rejects_empty_completion():
    service, _ = _service_returning("   ")

    with pytest.raises(UpstreamServiceError):
        await service.answer_followup("text", [], [], "Question?")
