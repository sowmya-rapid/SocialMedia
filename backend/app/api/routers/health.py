# app/api/routers/health.py

from fastapi import APIRouter, HTTPException
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
from app.db.client import get_database

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """
    Basic health endpoint to confirm the API is running.
    """
    return {"status": "ok"}


@router.get("/health/db")
async def health_db_check():
    """
    Checks if MongoDB is reachable by sending a 'ping' command.
    """
    db = get_database()
    try:
        result = await db.command({"ping": 1})
        if result.get("ok") == 1:
            return {"status": "ok", "db": True}
        raise HTTPException(
            status_code=HTTP_503_SERVICE_UNAVAILABLE,
            detail={"db": False, "error": "Unexpected ping response"},
        )
    except Exception as exc:
        raise HTTPException(
            status_code=HTTP_503_SERVICE_UNAVAILABLE,
            detail={"db": False, "error": str(exc)},
        )
