from datetime import datetime
from uuid import uuid4
from app.db.client import get_database


# Convert DB doc → response object
def _to_out(doc):
    liked_by = doc.get("liked_by", []) or []
    likes = doc.get("likes", len(liked_by))
    return {
        **doc,
        "likes": likes,
        "liked_by": liked_by,
        "comments": doc.get("comments", [])
    }


async def get_all_posts():
    db = get_database()
    posts = []
    cursor = db.posts.find().sort("created_at", -1)
    async for p in cursor:
        posts.append(_to_out(p))
    return posts


async def insert_post(doc):
    db = get_database()
    await db.posts.insert_one(doc)
    return _to_out(doc)


async def find_post_by_id(post_id: str):
    db = get_database()
    doc = await db.posts.find_one({"id": post_id})
    return _to_out(doc) if doc else None


async def update_post(post_id: str, update: dict):
    db = get_database()
    await db.posts.update_one({"id": post_id}, update)
    return await find_post_by_id(post_id)


async def delete_post(post_id: str):
    db = get_database()
    await db.posts.delete_one({"id": post_id})
