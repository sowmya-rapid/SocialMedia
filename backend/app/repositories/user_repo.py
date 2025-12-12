# app/repositories/user_repo.py

from typing import Optional
from app.db.client import get_database
from app.models.user import USERS_COLLECTION
from datetime import datetime
import uuid


async def create_user(email: str, username: str, password_hash: str) -> dict:
    db = get_database()
    now = datetime.utcnow()

    user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "username": username,
        "password_hash": password_hash,
        "is_active": True,
        "created_at": now,
        "last_login": None,
        "roles": ["user"],
        "bio": "",
        "avatar_url": "",
    }

    await db[USERS_COLLECTION].insert_one(user)

    # Remove sensitive fields before returning
    user_copy = user.copy()
    user_copy.pop("_id", None)
    user_copy.pop("password_hash", None)
    return user_copy


async def get_user_by_email(email: str) -> Optional[dict]:
    db = get_database()
    user = await db[USERS_COLLECTION].find_one({"email": email})
    if user:
        user.pop("_id", None)
    return user


async def get_user_by_username(username: str) -> Optional[dict]:
    db = get_database()
    user = await db[USERS_COLLECTION].find_one({"username": username})
    if user:
        user.pop("_id", None)
    return user


async def get_user_by_id(user_id: str) -> Optional[dict]:
    db = get_database()
    user = await db[USERS_COLLECTION].find_one({"id": user_id})
    if user:
        user.pop("_id", None)
    return user


async def set_last_login(user_id: str):
    db = get_database()
    await db[USERS_COLLECTION].update_one(
        {"id": user_id},
        {"$set": {"last_login": datetime.utcnow()}}
    )


# ⭐ NEW — update profile fields (bio, avatar_url)
async def update_profile(user_id: str, data: dict):
    db = get_database()

    await db[USERS_COLLECTION].update_one(
        {"id": user_id},
        {"$set": data}
    )

    updated = await get_user_by_id(user_id)
    return updated
