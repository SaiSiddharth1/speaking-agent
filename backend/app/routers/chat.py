from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.llm_service import get_coach_reply

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        reply = await get_coach_reply(
            request.user_message,
            request.conversation_history
        )

        # Update history to return to frontend
        updated_history = request.conversation_history + [
            {"role": "user", "content": request.user_message},
            {"role": "assistant", "content": reply},
        ]

        return ChatResponse(reply=reply, updated_history=updated_history)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
