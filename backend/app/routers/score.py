import logging
from fastapi import APIRouter, HTTPException
from app.schemas.score import ScoreRequest, ScoreResult
from app.services.scoring_service import evaluate_transcript

logger = logging.getLogger(__name__)

router = APIRouter(tags=["scoring"])

@router.post("/score", response_model=ScoreResult)
async def score_transcript(request: ScoreRequest) -> ScoreResult:
    """
    Day 28 Endpoint: POST /api/score
    Takes a transcript string and returns a structured evaluation:
    grammar score, fluency score, overall score, and feedback tips.
    """
    try:
        result = await evaluate_transcript(request.transcript)
        return result
    except ValueError as val_err:
        logger.error(f"Value error or parsing failed in scoring endpoint: {val_err}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Scoring failed due to malformed output from LLM: {str(val_err)}"
        )
    except Exception as exc:
        logger.error(f"Unexpected error in scoring endpoint: {exc}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while scoring the transcript: {str(exc)}"
        )
