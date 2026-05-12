from faster_whisper import WhisperModel
import tempfile, os

# Load ONCE at module level — "base" is fast + accurate enough for MVP
model = WhisperModel("base", device="cpu", compute_type="int8")

def transcribe_audio(file_bytes: bytes, extension: str = "wav") -> str:
    # Write bytes to a temp file
    with tempfile.NamedTemporaryFile(
        delete=False, suffix=f".{extension}"
    ) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        segments, _ = model.transcribe(tmp_path, language="en")
        transcript = " ".join(seg.text for seg in segments)
        return transcript.strip()
    finally:
        os.remove(tmp_path)  # Always clean up
