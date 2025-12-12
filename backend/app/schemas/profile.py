# app/schemas/profile.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserProfile(BaseModel):
    id: str
    username: str
    email: str
    bio: Optional[str] = ""
    avatar_url: Optional[str] = ""
    created_at: datetime


class ProfileUpdate(BaseModel):
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
