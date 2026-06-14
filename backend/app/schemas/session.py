from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class SessionCreate(BaseModel):
    topic: Optional[str] = "General"

class MessageOut(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class SessionOut(BaseModel):
    id: int
    topic: str
    duration_seconds: int
    created_at: datetime
    messages: List[MessageOut] = []

    class Config:
        from_attributes = True
