# app/api/routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from app.api.routers.auth import get_current_user
from app.schemas.profile import UserProfile, ProfileUpdate
from app.repositories import user_repo

router = APIRouter(prefix="/users", tags=["users"])


# 🔥 GET /api/users/me
@router.get("/me", response_model=UserProfile)
async def get_my_profile(current_user=Depends(get_current_user)):
    """
    Return the currently logged-in user's profile.
    """
    return current_user


# 🔥 PATCH /api/users/me
@router.patch("/me", response_model=UserProfile)
async def update_my_profile(
    data: ProfileUpdate,
    current_user=Depends(get_current_user)
):
    """
    Update bio or avatar_url for the current user.
    """
    updated = await user_repo.update_profile(current_user["id"], data.dict(exclude_none=True))
    return updated


# 🔥 GET /api/users/{username}
@router.get("/{username}", response_model=UserProfile)
async def get_public_profile(username: str):
    """
    View profile by username (public).
    """
    user = await user_repo.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
