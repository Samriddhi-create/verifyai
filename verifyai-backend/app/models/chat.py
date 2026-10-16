from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field, field_validator

from app.models.verification import Claim

MAX_QUESTION_LENGTH = 2000
MAX_MESSAGE_LENGTH = 8000
MAX_HISTORY_MESSAGES = 20
# This endpoint takes the whole report back from the client and is callable
# without signing in, so bound what a single request can push through the LLM.
MAX_CONTEXT_TEXT_LENGTH = 50_000
MAX_CONTEXT_CLAIMS = 100


class ChatRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"


class ChatMessage(BaseModel):
    role: ChatRole
    content: str = Field(max_length=MAX_MESSAGE_LENGTH)


class ChatRequest(BaseModel):
    original_text: str = Field(max_length=MAX_CONTEXT_TEXT_LENGTH)
    claims: list[Claim] = Field(max_length=MAX_CONTEXT_CLAIMS)
    history: list[ChatMessage] = Field(default_factory=list)
    question: str = Field(min_length=1, max_length=MAX_QUESTION_LENGTH)

    @field_validator("question")
    @classmethod
    def strip_question(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("question must not be empty or whitespace-only")
        return stripped

    @field_validator("history")
    @classmethod
    def cap_history(cls, value: list[ChatMessage]) -> list[ChatMessage]:
        return value[-MAX_HISTORY_MESSAGES:]


class ChatResponse(BaseModel):
    answer: str
