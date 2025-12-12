# app/api/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.utils.security import decode_token  
from app.repositories.user_repo import get_user_by_id

security = HTTPBearer()  # parses Authorization: Bearer <token>

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency that returns the current user dict or raises 401.
    Expects Authorization: Bearer <access_token>.
    """
    token = credentials.credentials
    try:
        payload = decode_token(token)  # should raise on invalid token unless you disabled verify_exp in dev
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id = payload.get("sub") or payload.get("user_id") or payload.get("id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    # fetch user from DB (adjust repo function signature)
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user
