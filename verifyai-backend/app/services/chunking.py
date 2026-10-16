from __future__ import annotations

import re

_SENTENCE_BOUNDARY = re.compile(r"(?<=[.!?])\s+")


def chunk_text(text: str, chunk_size_chars: int) -> list[str]:
    """Split text into chunks no larger than `chunk_size_chars`, breaking on
    sentence boundaries so claims are never cut mid-sentence.
    """
    text = text.strip()
    if len(text) <= chunk_size_chars:
        return [text]

    sentences = _SENTENCE_BOUNDARY.split(text)
    chunks: list[str] = []
    current: list[str] = []
    current_len = 0

    for sentence in sentences:
        sentence_len = len(sentence) + 1
        if current and current_len + sentence_len > chunk_size_chars:
            chunks.append(" ".join(current))
            current = []
            current_len = 0
        # A single sentence longer than the chunk size is kept whole rather
        # than truncated, so no claim ever loses context mid-word.
        current.append(sentence)
        current_len += sentence_len

    if current:
        chunks.append(" ".join(current))

    return chunks
