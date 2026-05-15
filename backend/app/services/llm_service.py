import json
import os
from groq import AsyncGroq
from dotenv import load_dotenv
from app.services.prompt_builder import build_system_prompt

load_dotenv()

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

async def get_coach_response(
    user_message: str,
    conversation_history: list[dict],
    user_level: str = "intermediate",
    topic: str = "daily life"
) -> dict:
    
    messages = _build_messages(user_message, conversation_history, user_level, topic)
    model = os.getenv("GROQ_MODEL", "llama3-70b-8192")
    
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,       
            max_tokens=400,
            response_format={"type": "json_object"} 
        )
        
        raw = response.choices[0].message.content
        return json.loads(raw)
        
    except json.JSONDecodeError:
        # Fallback if model fails to return valid JSON
        return {
            "correction": None,
            "praise": "Great effort!",
            "response": "I didn't quite catch that JSON formatting issue. What were you saying?",
            "follow_up": "Can you try saying that again?",
            "score": {
                "grammar": 5,
                "fluency": 5,
                "vocabulary": 5
            }
        }
    except Exception as e:
        raise Exception(f"LLM Error: {str(e)}")

def _build_messages(user_message: str, history: list[dict], user_level: str, topic: str) -> list[dict]:
    system_prompt = build_system_prompt(user_level, topic)
    
    messages = [{"role": "system", "content": system_prompt}]
    
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})
        
    messages.append({"role": "user", "content": user_message})
    
    return messages
