"""
Auth utilities — JWT token validation and current user dependency.
Uses the existing core.security and core.config modules.
"""

from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from app.database import get_db
from app.models.user import User
from app.core.config import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Mandatory auth — raises 401 if token is missing or invalid."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Support both "sub" as email string and "sub" as user ID
        sub = payload.get("sub")
        email = payload.get("email")
        if sub is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Try to find user by email first, then by id
    user = None
    if email:
        user = db.query(User).filter(User.email == email).first()
    if not user and sub:
        # sub might be user id (from existing auth) or email (from new auth)
        try:
            user_id = int(sub)
            user = db.query(User).filter(User.id == user_id).first()
        except (ValueError, TypeError):
            user = db.query(User).filter(User.email == sub).first()

    if user is None:
        raise credentials_exception
    return user


async def get_current_user_optional(
    request: Request,
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Optional auth — returns None if no valid token is present."""
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else ""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        email = payload.get("email")
        if not sub:
            return None

        user = None
        if email:
            user = db.query(User).filter(User.email == email).first()
        if not user and sub:
            try:
                user_id = int(sub)
                user = db.query(User).filter(User.id == user_id).first()
            except (ValueError, TypeError):
                user = db.query(User).filter(User.email == sub).first()
        return user
    except JWTError:
        return None
