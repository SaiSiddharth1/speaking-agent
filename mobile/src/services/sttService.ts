import { API_BASE_URL } from '../../services/api';

// If API_BASE_URL is not exported or different, we can define it here
// const BASE_URL = "http://192.168.29.37:8000"; 

export async function transcribeAudio(uri: string): Promise<string> {
  const formData = new FormData();

  // React Native's FormData needs an object with uri, name, and type
  formData.append("file", {
    uri,
    name: "audio.m4a",
    type: "audio/m4a",
  } as any);

  const response = await fetch(`${API_BASE_URL}/api/stt/transcribe`, {
    method: "POST",
    body: formData,
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Transcription failed");
  }

  const data = await response.json();
  return data.transcript;
}
