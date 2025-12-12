from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class PostCreate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: str = Field(...)


class CommentCreate(BaseModel):
    text: str = Field(..., max_length=1000)


class PostOut(BaseModel):
    id: str
    author_id: str
    author_username: Optional[str]
    title: Optional[str]
    content: str
    image: Optional[str] = None
    likes: int
    liked_by: List[str] = []
    comments: List[str] = []
    created_at: datetime
