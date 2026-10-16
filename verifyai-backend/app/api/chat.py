from __future__ import annotations

from fastapi import APIRouter, status

from app.models.chat import ChatRequest, ChatResponse
from app.services.llm_service import LLMService

router = APIRouter(prefix="/api", tags=["chat"])

_llm_service = LLMService()


@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat(payload: ChatRequest) -> ChatResponse:
    answer = await _llm_service.answer_followup(
        original_text=payload.original_text,
        claims=payload.claims,
        history=payload.history,
        question=payload.question,
    )
    return ChatResponse(answer=answer)
