from pydantic import BaseModel
from typing import List

class Message(BaseModel):
    role: str   # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    user_message: str
    history: List[Message] = []
    level: str = "intermediate"
    user_id: int

class ChatResponse(BaseModel):
    ai_response: str
    history: List[Message]
