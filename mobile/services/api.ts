export const API_BASE_URL = "http://192.168.29.37:8000";

export async function transcribeAudio(uri: string): Promise<string> {
  const formData = new FormData();
  
  // React Native's FormData needs an object with uri, name, and type
  // We use 'as any' because the TypeScript definition for FormData in RN can be tricky
  formData.append("file", {
    uri,
    name: "audio.m4a",
    type: "audio/m4a",
  } as any);

  try {
    const response = await fetch(`${API_BASE_URL}/api/stt/transcribe`, {
      method: "POST",
      body: formData,
      headers: {
        'Accept': 'application/json',
        // 'Content-Type': 'multipart/form-data' is handled automatically when sending FormData
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Transcription failed");
    }

    const data = await response.json();
    return data.transcript;
  } catch (error) {
    console.error("API Error (transcribeAudio):", error);
    throw error;
  }
}
