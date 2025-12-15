from fastapi import FastAPI, HTTPException
from bson import ObjectId
from datetime import datetime
from app.database import posts_collection
from app.models import PostCreate
from app.grpc_client import validate_user

app = FastAPI(title="Post Microservice")

#Root
@app.get("/")
def root():
    return {"message": "Post Service is running"}


@app.post("/posts")
def create_post(post: PostCreate):
    # 1. validate user via gRPC
    if not validate_user(post.user_id):
        raise HTTPException(status_code=400, detail="Invalid user")

    # 2. save post
    post_data = {
        "user_id": post.user_id,
        "content": post.content,
        "created_at": datetime.utcnow()
    }

    result = posts_collection.insert_one(post_data)

    return {
        "id": str(result.inserted_id),
        "user_id": post.user_id,
        "content": post.content,
        "created_at": post_data["created_at"]
    }
