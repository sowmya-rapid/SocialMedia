# app/models/user.py

USERS_COLLECTION = "users"

# Helper to create a full user document
def user_doc(id: str, email: str, username: str, password_hash: str, created_at):
    return {
        "id": id,
        "email": email,
        "username": username,
        "password_hash": password_hash,
        "is_active": True,
        "created_at": created_at,
        "last_login": None,
        "roles": ["user"],

        # ⭐ ADDING PROFILE FIELDS ⭐
        "bio": "",
        "avatar_url": "",
    }
