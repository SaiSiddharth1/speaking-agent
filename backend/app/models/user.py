from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.mysql import BIGINT
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(BIGINT(unsigned=True), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column("password_hash", String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
