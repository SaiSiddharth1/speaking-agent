from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SessionCreate(BaseModel):
    topic: Optional[str] = None
    duration_seconds: int = 0
    grammar_score: float = 0.0
    fluency_score: float = 0.0
    overall_score: float = 0.0
    transcript: Optional[str] = None
    ai_feedback: Optional[str] = None

class SessionOut(BaseModel):
    id: int
    user_id: int
    topic: Optional[str]
    duration_seconds: int
    grammar_score: float
    fluency_score: float
    overall_score: float
    ai_feedback: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
