"""HMAC request verification for Dew Theory internal calls."""
import hashlib
import hmac
import time

from fastapi import HTTPException, Request

from app.config import settings

NONCE_CACHE: set[str] = set()
MAX_NONCES = 5000
DEFAULT_SKEW = 300


def _body_digest(body: bytes) -> str:
    return hmac.new(settings.hmac_secret.encode(), body or b"", hashlib.sha256).hexdigest()


def verify_hmac(request: Request, body: bytes) -> None:
    if not settings.hmac_secret:
        raise HTTPException(status_code=503, detail="HMAC not configured", headers={"X-Code": "hmac_not_configured"})

    ts = request.headers.get("x-dew-timestamp")
    nonce = request.headers.get("x-dew-nonce")
    sig = request.headers.get("x-dew-signature")
    if not ts or not nonce or not sig:
        raise HTTPException(status_code=401, detail="Missing HMAC headers", headers={"X-Code": "hmac_headers_missing"})

    try:
        ts_num = int(ts)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid timestamp") from exc

    if abs(int(time.time()) - ts_num) > DEFAULT_SKEW:
        raise HTTPException(status_code=401, detail="Timestamp skew", headers={"X-Code": "hmac_timestamp_invalid"})

    if nonce in NONCE_CACHE:
        raise HTTPException(status_code=401, detail="Replay detected", headers={"X-Code": "hmac_replay"})

    canonical = f"{request.method.upper()}\n{request.url.path}\n{ts}\n{nonce}\n{_body_digest(body)}"
    expected = hmac.new(settings.hmac_secret.encode(), canonical.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, expected):
        raise HTTPException(status_code=401, detail="Invalid signature", headers={"X-Code": "hmac_invalid"})

    NONCE_CACHE.add(nonce)
    if len(NONCE_CACHE) > MAX_NONCES:
        for _ in range(len(NONCE_CACHE) - MAX_NONCES):
            NONCE_CACHE.pop()


def sign_outgoing(method: str, path: str, body: bytes) -> dict[str, str]:
    ts = str(int(time.time()))
    nonce = f"{ts}_{hashlib.sha256(body).hexdigest()[:8]}"
    digest = _body_digest(body)
    canonical = f"{method.upper()}\n{path}\n{ts}\n{nonce}\n{digest}"
    sig = hmac.new(settings.hmac_secret.encode(), canonical.encode(), hashlib.sha256).hexdigest()
    return {
        "x-dew-timestamp": ts,
        "x-dew-nonce": nonce,
        "x-dew-signature": sig,
    }
