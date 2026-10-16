from app.services.chunking import chunk_text


def test_short_text_returns_single_chunk():
    text = "The sky is blue. Water is wet."
    assert chunk_text(text, chunk_size_chars=3000) == [text]


def test_long_text_splits_on_sentence_boundaries():
    sentence = "This is a claim about something factual. "
    text = sentence * 200  # well over the chunk size
    chunks = chunk_text(text, chunk_size_chars=500)

    assert len(chunks) > 1
    for chunk in chunks:
        assert len(chunk) <= 550  # allows the last sentence to slightly exceed the cap
        assert chunk.strip().endswith(".")


def test_oversized_single_sentence_is_kept_whole():
    long_sentence = "word " * 400 + "."
    chunks = chunk_text(long_sentence, chunk_size_chars=100)
    assert len(chunks) == 1
    assert chunks[0].strip() == long_sentence.strip()


def test_empty_text_returns_single_empty_chunk():
    assert chunk_text("", chunk_size_chars=100) == [""]
