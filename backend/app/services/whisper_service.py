import whisper

# Load the model once at the module level for performance
model = whisper.load_model("base")

def transcribe(file_path: str) -> str:
    """
    Transcribes the given audio file using the whisper model.
    """
    result = model.transcribe(file_path)
    return result["text"]
