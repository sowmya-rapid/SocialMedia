# app/services/auth_service.py
from app.repositories import user_repo
from app.utils.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.schemas.user import UserCreate
from fastapi import HTTPException
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED
from typing import Tuple


async def register_user(input_data: UserCreate) -> dict:
    # check existing email/username
    existing = await user_repo.get_user_by_email(input_data.email)
    if existing:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Email already registered")
    existing = await user_repo.get_user_by_username(input_data.username)
    if existing:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Username already taken")

    pw_hash = hash_password(input_data.password)
    user = await user_repo.create_user(email=input_data.email, username=input_data.username, password_hash=pw_hash)
    return user


async def authenticate_user(email_or_username: str, password: str) -> dict:
    # allow login by email or username
    user = await user_repo.get_user_by_email(email_or_username)
    if not user:
        user = await user_repo.get_user_by_username(email_or_username)
    if not user:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(password, user.get("password_hash", "")):
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # optionally update last_login
    await user_repo.set_last_login(user["id"])
    # hide password_hash when returning
    u = user.copy()
    u.pop("password_hash", None)
    return u


async def create_token_pair_for_user(user: dict) -> Tuple[dict, str, str]:
    access_token, expires_in = create_access_token(subject=user["id"], username=user.get("username"))
    refresh_token = create_refresh_token(subject=user["id"], username=user.get("username"))
    token_response = {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer", "expires_in": expires_in}
    return token_response
