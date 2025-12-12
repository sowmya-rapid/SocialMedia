from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.posts import PostCreate, PostOut, CommentCreate
from app.services import posts_service
from app.repositories.posts_repo import find_post_by_id, delete_post
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=List[PostOut])
async def list_posts():
    from app.repositories.posts_repo import get_all_posts
    return await get_all_posts()


@router.post("", response_model=PostOut, status_code=status.HTTP_201_CREATED)
async def create_post(payload: PostCreate, current_user=Depends(get_current_user)):
    return await posts_service.create_post(current_user, payload)


@router.post("/{post_id}/comments", response_model=PostOut)
async def add_comment(post_id: str, payload: CommentCreate, current_user=Depends(get_current_user)):
    updated = await posts_service.add_comment(post_id, payload.text)
    if not updated:
        raise HTTPException(status_code=404, detail="Post not found")
    return updated


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_post(post_id: str, current_user=Depends(get_current_user)):
    post = await find_post_by_id(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post["author_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    await delete_post(post_id)
    return None
