import whisper
import os

# Load ONCE at module level — not inside the function
model = whisper.load_model("base")

def transcribe(file_path: str) -> str:
    """
    Transcribe an audio file using OpenAI's Whisper model.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found: {file_path}")
        
    result = model.transcribe(file_path)
    return result["text"].strip()
