from fastapi import APIRouter, HTTPException
from app.models.chat_models import ChatRequest, ChatResponse, Message
from app.services.groq_service import get_ai_response

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        history = [m.model_dump() for m in request.conversation_history] # using model_dump for pydantic v2
        
        reply = get_ai_response(history)
        
        # Append AI reply to history
        updated = list(request.conversation_history) + [
            Message(role="assistant", content=reply)
        ]
        
        return ChatResponse(reply=reply, updated_history=updated)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
