from pydantic import BaseModel, Field
from typing import List

class ScoreRequest(BaseModel):
    transcript: str = Field(..., description="The spoken English transcript transcribed from Whisper")

class ScoreResult(BaseModel):
    grammar_score: int = Field(..., ge=0, le=100, description="The grammar evaluation score from 0 to 100")
    fluency_score: int = Field(..., ge=0, le=100, description="The fluency evaluation score from 0 to 100")
    overall_score: int = Field(..., ge=0, le=100, description="The overall average speaking score from 0 to 100")
    feedback: List[str] = Field(..., description="List of 2-3 short improvement tips as strings")
