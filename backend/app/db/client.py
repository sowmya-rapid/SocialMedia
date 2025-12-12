# app/db/client.py

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

mongo_client: AsyncIOMotorClient | None = None

async def connect_to_mongo():
    global mongo_client
    if mongo_client is None:
        mongo_client = AsyncIOMotorClient(settings.MONGODB_URI)
    return mongo_client

async def close_mongo_connection():
    global mongo_client
    if mongo_client:
        mongo_client.close()
        mongo_client = None

def get_database():
    if mongo_client is None:
        raise RuntimeError("MongoDB client is not initialized. Did startup run?")
    return mongo_client[settings.DATABASE_NAME]
