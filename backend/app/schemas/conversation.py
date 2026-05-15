from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class SessionStartRequest(BaseModel):
    topic: Optional[str] = "daily life"
    user_id: Optional[int] = None

class SessionResponse(BaseModel):
    session_id: int
    topic: str

class MessageRequest(BaseModel):
    session_id: int
    message: str
    level: Optional[str] = "intermediate"
    user_id: Optional[int] = None

class Score(BaseModel):
    grammar: Optional[int] = None
    fluency: Optional[int] = None
    vocabulary: Optional[int] = None

class CoachResponse(BaseModel):
    correction: Optional[str] = None
    praise: Optional[str] = None
    response: str
    follow_up: Optional[str] = None
    score: Optional[Score] = None

class Message(BaseModel):
    role: str
    content: str
