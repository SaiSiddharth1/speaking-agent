from fastapi import APIRouter, HTTPException
from app.schemas.conversation import ChatRequest, CoachResponse
from app.services.groq_service import get_coach_response
from app.services.pronunciation_service import get_pronunciation_hints

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

@router.post("/pronunciation-hints")
async def pronunciation_hints(payload: dict):
    transcript = payload.get("transcript", "")
    if not transcript:
        raise HTTPException(400, "Transcript required")
    hints = get_pronunciation_hints(transcript)
    return {"hints": hints}
