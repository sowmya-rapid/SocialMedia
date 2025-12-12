from fastapi import APIRouter, Depends, HTTPException, Header
from starlette.status import HTTP_401_UNAUTHORIZED
from typing import Optional
from app.schemas.user import UserCreate, Token
from app.schemas.auth import LoginRequest, RefreshRequest
from app.services import auth_service
from app.utils.security import decode_token
from app.repositories import user_repo

router = APIRouter(tags=["auth"])


# REGISTER
@router.post("/auth/register", response_model=dict)
async def register(payload: UserCreate):
    user = await auth_service.register_user(payload)
    return user


# LOGIN
@router.post("/auth/login", response_model=Token)
async def login(data: LoginRequest):
    """
    Accepts:
    {
        "identifier": "email_or_username",
        "password": "..."
    }
    """
    user = await auth_service.authenticate_user(data.identifier, data.password)
    token_pair = await auth_service.create_token_pair_for_user(user)
    return token_pair


# REFRESH TOKEN
@router.post("/auth/refresh", response_model=Token)
async def refresh(data: RefreshRequest):
    """
    Accepts:
    {
        "refresh_token": "<token>"
    }
    """
    token = data.refresh_token

    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    user_id = payload.get("sub")
    user = await user_repo.get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="User not found")

    return await auth_service.create_token_pair_for_user(user)


# GET CURRENT USER (DEPENDENCY)
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Missing authorization header")

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid authorization format")

    token = parts[1]

    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid token")

    if payload.get("type") != "access":
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    user_id = payload.get("sub")
    user = await user_repo.get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="User not found")

    user.pop("password_hash", None)
    return user


# ME ENDPOINT
@router.get("/auth/me")
async def me(current_user=Depends(get_current_user)):
    return current_user
