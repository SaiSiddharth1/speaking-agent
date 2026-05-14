import logging
from fastapi import APIRouter, HTTPException
from app.schemas.conversation import ChatRequest, ChatResponse, Message
from app.services.groq_service import get_ai_response

logger = logging.getLogger(__name__)

conversation_router = APIRouter()
router = conversation_router  # Alias for consistency with other app routers

@conversation_router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # Convert history objects to dicts for clean mapping in service
        history_dicts = [msg.model_dump() for msg in request.history]
        
        result = await get_ai_response(
            user_message=request.user_message,
            history=history_dicts,
            level=request.level
        )
        
        # Construct updated Message objects for the response payload
        updated_history = [
            Message(role=item["role"], content=item["content"])
            for item in result["history"]
        ]
        
        return ChatResponse(
            ai_response=result["response"],
            history=updated_history
        )
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Groq API service unavailable: {str(e)}"
        )
