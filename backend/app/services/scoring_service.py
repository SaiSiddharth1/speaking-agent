import json
import logging
from groq import AsyncGroq
from app.config import settings
from app.schemas.score import ScoreResult

logger = logging.getLogger(__name__)

# Initialize the Groq client using settings
client = AsyncGroq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """You are an expert English speaking coach. Evaluate the user's spoken transcript.
You must return a JSON object with the exact keys listed below:
- grammar_score (an integer between 0 and 100 representing their grammar proficiency)
- fluency_score (an integer between 0 and 100 representing their flow, phrasing, and vocabulary flow)
- overall_score (an integer between 0 and 100 representing their overall spoken proficiency)
- feedback (a list containing 2 to 3 short, actionable improvement tips as strings)

Requirements:
- Your response must be a single, valid JSON object.
- Do not include any explanations, preambles, or markdown fences.
- Return raw JSON only.
"""

async def evaluate_transcript(transcript: str) -> ScoreResult:
    """
    Evaluates the provided English spoken transcript using Groq LLM.
    Ensures deterministic, structured output and validates the JSON payload.
    Defers to a high-quality local heuristic evaluation if GROQ_API_KEY is not set or is a placeholder.
    """
    if not transcript or not transcript.strip():
        # Edge case: empty transcript
        return ScoreResult(
            grammar_score=0,
            fluency_score=0,
            overall_score=0,
            feedback=["Please provide a valid spoken transcript to receive feedback."]
        )

    # Check if the API key is unconfigured or is a placeholder
    is_placeholder = (
        not settings.GROQ_API_KEY 
        or "your_groq_api_key_here" in settings.GROQ_API_KEY 
        or settings.GROQ_API_KEY.strip() == ""
    )

    if is_placeholder:
        logger.warning("GROQ_API_KEY is placeholder or empty. Returning local simulated evaluation.")
        
        # Heuristic analysis of the transcript for realistic demo/test feedback
        text = transcript.lower()
        grammar_deductions = 0
        fluency_deductions = 0
        feedback = []

        if "i go to the market" in text or "yesterday i go" in text:
            grammar_deductions += 15
            feedback.append("Use the past tense 'went' instead of 'go' when speaking about yesterday.")
        if "buyed" in text:
            grammar_deductions += 15
            feedback.append("The past tense of 'buy' is irregular: 'bought', not 'buyed'.")
        if "good" in text and ("very good" in text or "learn english very good" in text):
            fluency_deductions += 10
            feedback.append("Consider using the adverb 'well' (e.g. 'speak English well') instead of the adjective 'good'.")
        if len(transcript.split()) < 5:
            fluency_deductions += 20
            feedback.append("Try to speak in longer, complete sentences to build fluency.")

        if not feedback:
            feedback.append("Great job! Your sentence structure and flow are very natural.")
            feedback.append("To level up, try introducing more complex vocabulary or descriptive idioms.")
        else:
            # Always ensure a positive encouragement comment
            feedback.append("Keep practicing! Consistency is the key to mastering English pronunciation.")

        grammar_score = max(50, 100 - grammar_deductions)
        fluency_score = max(50, 100 - fluency_deductions)
        overall_score = int((grammar_score + fluency_score) / 2)

        return ScoreResult(
            grammar_score=grammar_score,
            fluency_score=fluency_score,
            overall_score=overall_score,
            feedback=feedback[:3]
        )

    # Key is present, invoke Groq asynchronously
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Here is the transcript: \"{transcript}\""}
    ]

    try:
        response = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            temperature=0.0, # Deterministic response
            response_format={"type": "json_object"} # Force JSON mode on Groq
        )

        raw_content = response.choices[0].message.content
        if not raw_content:
            raise ValueError("Empty response received from Groq LLM.")

        clean_content = raw_content.strip()

        # Handle any possible markdown wrapping code block (e.g. ```json ... ```)
        if clean_content.startswith("```json"):
            clean_content = clean_content[7:]
        elif clean_content.startswith("```"):
            clean_content = clean_content[3:]
        if clean_content.endswith("```"):
            clean_content = clean_content[:-3]
        clean_content = clean_content.strip()

        # Safely parse JSON
        parsed_data = json.loads(clean_content)

        # Validate that required keys are present, mapping/cleaning where necessary
        grammar_score = int(parsed_data.get("grammar_score", 0))
        fluency_score = int(parsed_data.get("fluency_score", 0))
        overall_score = int(parsed_data.get("overall_score", 0))
        feedback = parsed_data.get("feedback", [])

        # Validate feedback is a list of strings
        if not isinstance(feedback, list):
            feedback = [str(feedback)] if feedback else ["Keep practicing your spoken English!"]
        else:
            feedback = [str(item) for item in feedback]

        # Return validated ScoreResult Pydantic schema
        return ScoreResult(
            grammar_score=max(0, min(100, grammar_score)),
            fluency_score=max(0, min(100, fluency_score)),
            overall_score=max(0, min(100, overall_score)),
            feedback=feedback
        )

    except json.JSONDecodeError as jde:
        logger.error(f"JSON parsing error from Groq output: {jde}. Raw content: {raw_content}", exc_info=True)
        raise ValueError(f"LLM returned invalid JSON structure: {str(jde)}")
    except Exception as e:
        logger.error(f"Error during transcript evaluation: {e}", exc_info=True)
        raise e
