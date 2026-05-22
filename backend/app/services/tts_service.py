import io
import edge_tts

async def text_to_speech(text: str, voice: str = "en-US-JennyNeural") -> bytes:
    """
    Converts text to speech bytes using edge-tts without saving to disk.
    
    Args:
        text (str): The text to be spoken.
        voice (str): The edge-tts voice string. Default is en-US-JennyNeural.
        
    Returns:
        bytes: The MP3 audio data.
    """
    communicate = edge_tts.Communicate(text, voice)
    audio_data = io.BytesIO()
    
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data.write(chunk["data"])
            
    return audio_data.getvalue()
