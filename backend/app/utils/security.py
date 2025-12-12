# app/utils/security.py
from datetime import datetime, timedelta
from typing import Tuple, Dict, Any
import bcrypt
from jose import jwt, JWTError
from app.core.config import settings

# safe fallback for refresh days if not defined in settings
REFRESH_DAYS = getattr(settings, "REFRESH_TOKEN_EXPIRE_DAYS", 30)


def hash_password(plain_password: str) -> str:
    pw = plain_password.encode("utf-8")
    hashed = bcrypt.hashpw(pw, bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception:
        return False


def create_access_token(subject: str, username: str | None = None) -> Tuple[str, int]:
    expire = datetime.utcnow() + timedelta(minutes=int(settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    payload: Dict[str, Any] = {
        "sub": subject,
        "type": "access",
        "exp": int(expire.timestamp()),
        "username": username,
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    expires_in = int(settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    return token, expires_in


def create_refresh_token(subject: str, username: str | None = None) -> str:
    expire = datetime.utcnow() + timedelta(days=int(REFRESH_DAYS))
    payload: Dict[str, Any] = {
        "sub": subject,
        "type": "refresh",
        "exp": int(expire.timestamp()),
        "username": username,
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token


def decode_token(token: str):
    try:
        data = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_exp": False}  # <--- ADD THIS
        )
        return data
    except Exception as e:
        raise e

