from datetime import datetime
from uuid import uuid4
from app.repositories import posts_repo


async def create_post(user, payload):
    doc = {
        "id": str(uuid4()),
        "author_id": user["id"],
        "author_username": user.get("username"),
        "title": payload.title,
        "content": payload.content,
        "image": None,
        "likes": 0,
        "liked_by": [],
        "comments": [],
        "created_at": datetime.utcnow(),
    }
    return await posts_repo.insert_post(doc)


async def toggle_like(post_id, user_id):
    post = await posts_repo.find_post_by_id(post_id)
    if not post:
        return None

    liked_by = set(post["liked_by"])

    if user_id in liked_by:
        liked_by.remove(user_id)
    else:
        liked_by.add(user_id)

    update = {
        "$set": {
            "liked_by": list(liked_by),
            "likes": len(liked_by)
        }
    }

    return await posts_repo.update_post(post_id, update)


async def add_comment(post_id, text):
    update = {"$push": {"comments": text}}
    return await posts_repo.update_post(post_id, update)
