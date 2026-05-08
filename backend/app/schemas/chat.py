from pydantic import BaseModel
from typing import List, Dict, Optional

class ChatRequest(BaseModel):
    user_message: str
    conversation_history: List[Dict[str, str]] = []
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    updated_history: List[Dict[str, str]]
