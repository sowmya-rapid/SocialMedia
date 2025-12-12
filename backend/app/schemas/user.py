# app/schemas/user.py
from __future__ import annotations
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=6)


class UserRead(BaseModel):
    id: str
    email: EmailStr
    username: str
    is_active: bool
    created_at: datetime


class UserInDB(UserRead):
    password_hash: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds for access token


class TokenPayload(BaseModel):
    sub: str  # user id
    type: str  # "access" or "refresh"
    exp: int
    username: Optional[str] = None
