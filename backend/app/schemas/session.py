from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# Auth
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime
    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str

# Sessions
class MessageOut(BaseModel):
    id: int
    role: str
    content: str
    feedback_tips: List[str] = []
    created_at: datetime
    model_config = {"from_attributes": True}

class SessionOut(BaseModel):
    id: int
    grammar_score: float
    fluency_score: float
    overall_score: float
    created_at: datetime
    messages: List[MessageOut] = []
    model_config = {"from_attributes": True}

# Progress
class ProgressOut(BaseModel):
    avg_grammar_7d: float
    avg_fluency_7d: float
    avg_overall_7d: float
    avg_grammar_30d: float
    avg_fluency_30d: float
    avg_overall_30d: float
    total_sessions: int
    streak_days: int
    scores_over_time: List[dict]
