from pydantic import BaseModel

class LoginRequest(BaseModel):
    identifier: str
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str
