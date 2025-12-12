from fastapi import FastAPI
from app.core.config import settings
from app.db.client import connect_to_mongo, close_mongo_connection

# import routers
from app.api.routers import health
from app.api.routers import auth   
from app.api.routers import users
from app.api.routers import posts



app = FastAPI(title=settings.APP_NAME)

from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# register routers
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")  
app.include_router(users.router, prefix="/api")
app.include_router(posts.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    # connect to MongoDB when the app starts
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    # close MongoDB connection when the app stops
    await close_mongo_connection()

@app.get("/")
async def root():
    return {"msg": "Social Media Backend Running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
