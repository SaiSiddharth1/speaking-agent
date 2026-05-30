from fastapi import APIRouter, HTTPException
from app.schemas.conversation import ChatRequest, CoachResponse
from app.services.groq_service import get_coach_response

router = APIRouter(tags=["conversation"])
conversation_router = router

@router.post("/chat", response_model=CoachResponse)
async def chat_with_coach(request: ChatRequest):
    try:
        result = await get_coach_response(
            message=request.message,
            history=request.history,
            topic=request.topic
        )
        return CoachResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
