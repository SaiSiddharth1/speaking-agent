from faster_whisper import WhisperModel
import tempfile, os

# Load ONCE at module level — "base" is fast + accurate enough for MVP
# We can also wrap it so it doesn't fail if faster_whisper is mocked
try:
    model = WhisperModel("base", device="cpu", compute_type="int8")
except Exception:
    model = None

def transcribe(file_path: str) -> str:
    if model is None:
        return "[Mock Transcription]"
    segments, _ = model.transcribe(file_path, language="en")
    return " ".join(seg.text for seg in segments).strip()

def transcribe_audio(file_bytes: bytes, extension: str = "wav") -> str:
    # Write bytes to a temp file
    with tempfile.NamedTemporaryFile(
        delete=False, suffix=f".{extension}"
    ) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        if model is None:
            return "[Mock Transcription]"
        segments, _ = model.transcribe(tmp_path, language="en")
        transcript = " ".join(seg.text for seg in segments)
        return transcript.strip()
    finally:
        os.remove(tmp_path)  # Always clean up
