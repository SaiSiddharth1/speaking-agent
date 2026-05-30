from pydantic import BaseModel
from typing import List, Optional

class Message(BaseModel):
    role: str        # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    user_id: str
    message: str                          # transcribed text from Whisper
    history: List[Message] = []           # previous turns
    topic: Optional[str] = "free_talk"    # practice topic

class CoachResponse(BaseModel):
    reply: str           # what coach says back
    correction: Optional[str]    # grammar/fluency fix if needed
    encouragement: str
    follow_up_question: str
    raw_text: str        # full LLM output
