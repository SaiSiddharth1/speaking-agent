from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, JSON, Text
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class ConversationSession(Base):
    __tablename__ = "conversation_sessions"

    id = Column(BIGINT(unsigned=True), primary_key=True, index=True)
    user_id = Column(BIGINT(unsigned=True), ForeignKey("users.id"), index=True, nullable=True) # allow null for testing
    topic = Column(String(255), nullable=True)
    avg_score = Column(Float, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)

    messages = relationship("ConversationMessage", back_populates="session", cascade="all, delete")
    user = relationship("User")

class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(BIGINT(unsigned=True), primary_key=True, index=True)
    session_id = Column(BIGINT(unsigned=True), ForeignKey("conversation_sessions.id"), index=True, nullable=False)
    role = Column(String(50), nullable=False) # user or assistant
    content = Column(Text, nullable=False)
    scores = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ConversationSession", back_populates="messages")


# Pydantic schemas for structured conversation JSON pipeline (Day 26)
from pydantic import BaseModel
from typing import List, Optional

class ChatMessage(BaseModel):
    role: str        # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    transcript: str
    session_id: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: str
    audio_url: Optional[str] = None
    grammar_issues: List[str] = []
    fluency_score: int
    suggestion: str

