from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.groq_service import GroqService

router = APIRouter()
groq_service = GroqService()

class ChatRequest(BaseModel):
    text: str

class ChatResponse(BaseModel):
    feedback: str
    original_text: str

@router.post("/chat", response_model=ChatResponse)
async def get_feedback(request: ChatRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    try:
        feedback = groq_service.get_coaching_feedback(request.text)
        return ChatResponse(feedback=feedback, original_text=request.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
