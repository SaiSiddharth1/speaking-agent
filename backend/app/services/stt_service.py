import httpx
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_STT_URL = "https://api.groq.com/openai/v1/audio/transcriptions"

async def transcribe_audio(file_bytes: bytes, filename: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GROQ_STT_URL,
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
            files={"file": (filename, file_bytes, "audio/m4a")},
            data={"model": "whisper-large-v3", "language": "en"},
            timeout=30.0
        )
        response.raise_for_status()
        return response.json()["text"]
