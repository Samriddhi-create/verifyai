import time

import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec
from jose import jwk as jose_jwk
from jose import jwt

import app.api.deps as deps
from app.core.errors import UnauthorizedError

KID = "test-key-1"


def _generate_es256_keypair():
    private_key = ec.generate_private_key(ec.SECP256R1())
    pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode()
    full_jwk = jose_jwk.construct(pem, algorithm="ES256").to_dict()
    public_jwk = {k: v for k, v in full_jwk.items() if k != "d"}
    public_jwk.update({"kid": KID, "use": "sig"})
    return pem, public_jwk


PRIVATE_KEY_PEM, PUBLIC_JWK = _generate_es256_keypair()
FAKE_JWKS = {"keys": [PUBLIC_JWK]}


def _make_token(sub="11111111-1111-1111-1111-111111111111", email="test@example.com", exp_delta=3600, **extra_claims):
    claims = {"sub": sub, "email": email, "aud": "authenticated", "exp": int(time.time()) + exp_delta, **extra_claims}
    return jwt.encode(claims, PRIVATE_KEY_PEM, algorithm="ES256", headers={"kid": KID})


@pytest.fixture(autouse=True)
def _reset_jwks_cache():
    deps._JWKS_CACHE.clear()
    yield
    deps._JWKS_CACHE.clear()


async def _fake_fetch_jwks(supabase_url: str) -> dict:
    return FAKE_JWKS


@pytest.mark.asyncio
async def test_decode_token_accepts_valid_signature(monkeypatch):
    monkeypatch.setattr(deps, "_fetch_jwks", _fake_fetch_jwks)
    token = _make_token()

    user = await deps._decode_token(token)

    assert str(user.id) == "11111111-1111-1111-1111-111111111111"
    assert user.email == "test@example.com"


@pytest.mark.asyncio
async def test_decode_token_rejects_unknown_kid(monkeypatch):
    fetch_calls = []

    async def fake_fetch(supabase_url):
        fetch_calls.append(supabase_url)
        return FAKE_JWKS

    monkeypatch.setattr(deps, "_fetch_jwks", fake_fetch)
    other_private_pem, _ = _generate_es256_keypair()
    bad_token = jwt.encode(
        {"sub": "x", "aud": "authenticated", "exp": int(time.time()) + 3600},
        other_private_pem,
        algorithm="ES256",
        headers={"kid": "some-other-kid"},
    )

    with pytest.raises(UnauthorizedError):
        await deps._decode_token(bad_token)

    # Missing kid triggers exactly one forced refetch before giving up.
    assert len(fetch_calls) == 2


@pytest.mark.asyncio
async def test_decode_token_rejects_expired_token(monkeypatch):
    monkeypatch.setattr(deps, "_fetch_jwks", _fake_fetch_jwks)
    token = _make_token(exp_delta=-3600)

    with pytest.raises(UnauthorizedError):
        await deps._decode_token(token)


@pytest.mark.asyncio
async def test_decode_token_rejects_malformed_token():
    with pytest.raises(UnauthorizedError):
        await deps._decode_token("not-a-real-token")


@pytest.mark.asyncio
async def test_decode_token_rejects_missing_subject(monkeypatch):
    monkeypatch.setattr(deps, "_fetch_jwks", _fake_fetch_jwks)
    token = jwt.encode(
        {"aud": "authenticated", "exp": int(time.time()) + 3600},
        PRIVATE_KEY_PEM,
        algorithm="ES256",
        headers={"kid": KID},
    )

    with pytest.raises(UnauthorizedError):
        await deps._decode_token(token)


@pytest.mark.asyncio
async def test_jwks_is_cached_within_ttl(monkeypatch):
    call_count = 0

    async def fake_fetch(supabase_url):
        nonlocal call_count
        call_count += 1
        return FAKE_JWKS

    monkeypatch.setattr(deps, "_fetch_jwks", fake_fetch)
    token = _make_token()

    await deps._decode_token(token)
    await deps._decode_token(token)

    assert call_count == 1
