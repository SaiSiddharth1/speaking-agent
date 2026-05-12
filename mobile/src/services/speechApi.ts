import { API_BASE_URL } from '../../services/api';

export async function transcribeAudio(audioUri: string): Promise<string> {
  const formData = new FormData();

  // React Native FormData needs this exact shape
  formData.append('file', {
    uri: audioUri,
    type: 'audio/wav',
    name: 'recording.wav',
  } as any);

  const response = await fetch(`${API_BASE_URL}/api/speech/transcribe`, {
    method: 'POST',
    body: formData,
    // ⚠️ Do NOT set Content-Type manually — fetch sets boundary automatically
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Transcription failed');
  }

  const data = await response.json();
  return data.transcript;
}
