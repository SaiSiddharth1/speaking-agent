import os
from pydantic import BaseModel

class Message(BaseModel):
    role: str    # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    conversation_history: list[Message]
    # Latest user message is LAST item in history

class ChatResponse(BaseModel):
    reply: str
    updated_history: list[Message]
