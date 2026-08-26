import base64
import hashlib
import hmac
import json
import secrets
import time

from fastapi import HTTPException, status


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def hash_password(password: str, salt: str | None = None) -> str:
    salt_value = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt_value.encode("utf-8"),
        120000
    ).hex()
    return f"pbkdf2_sha256${salt_value}${digest}"


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        _, salt_value, digest = hashed_password.split("$", 2)
    except ValueError:
        return False

    candidate = hash_password(password, salt_value)
    return hmac.compare_digest(candidate, hashed_password)


def create_access_token(subject: str, secret_key: str, expires_minutes: int, extra_claims: dict | None = None) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    issued_at = int(time.time())
    payload = {
        "sub": subject,
        "iat": issued_at,
        "exp": issued_at + (expires_minutes * 60)
    }
    if extra_claims:
        payload.update(extra_claims)

    signing_input = f"{_b64encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))}.{_b64encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))}"
    signature = hmac.new(secret_key.encode("utf-8"), signing_input.encode("utf-8"), hashlib.sha256).digest()
    return f"{signing_input}.{_b64encode(signature)}"


def decode_access_token(token: str, secret_key: str) -> dict:
    try:
        header_part, payload_part, signature_part = token.split(".")
        signing_input = f"{header_part}.{payload_part}"
        expected_signature = _b64encode(
            hmac.new(secret_key.encode("utf-8"), signing_input.encode("utf-8"), hashlib.sha256).digest()
        )
        if not hmac.compare_digest(expected_signature, signature_part):
            raise ValueError("Invalid signature")

        payload = json.loads(_b64decode(payload_part))
        if int(payload.get("exp", 0)) < int(time.time()):
            raise ValueError("Token expired")
        return payload
    except Exception as exc:  # pragma: no cover - defensive auth guard
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        ) from exc
