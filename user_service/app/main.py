from fastapi import FastAPI, HTTPException
from app.database import users_collection
from app.models import UserCreate, UserLogin
from app.utils import hash_password, verify_password
from bson import ObjectId

app = FastAPI(title="User Microservice")

#Root
@app.get("/")
def root():
    return {"message": "User Service is running"}

#CREATE USER 
@app.post("/users")
def create_user(user: UserCreate):
    existing = users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    user_data = user.dict()
    user_data["password"] = hash_password(user.password)

    result = users_collection.insert_one(user_data)

    return {
        "id": str(result.inserted_id),
        "email": user.email
    }


# LOGIN USER
@app.post("/login")
def login_user(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    return {
        "message": "Login successful",
        "user_id": str(db_user["_id"]),
        "email": db_user["email"]
    }
