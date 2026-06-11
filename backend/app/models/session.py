from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Session(Base):
    __tablename__ = "sessions"

    id = Column(BIGINT(unsigned=True), primary_key=True, index=True)
    user_id = Column(BIGINT(unsigned=True), ForeignKey("users.id"), nullable=False)
    grammar_score = Column(Float, default=0.0)
    fluency_score = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="sessions")
    messages = relationship("Message", back_populates="session", cascade="all, delete")


class Message(Base):
    __tablename__ = "messages"

    id = Column(BIGINT(unsigned=True), primary_key=True, index=True)
    session_id = Column(BIGINT(unsigned=True), ForeignKey("sessions.id"), nullable=False)
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    feedback_tips = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("Session", back_populates="messages")
