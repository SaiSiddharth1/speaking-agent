export const API_BASE_URL = "http://192.168.29.37:8000";

export const transcribeAudio = async (fileUri: string): Promise<string> => {
  const formData = new FormData();
  
  // React Native FormData needs this object shape
  formData.append("audio", {
    uri: fileUri,
    name: "recording.m4a",
    type: "audio/m4a",
  } as any);

  const response = await fetch(`${API_BASE_URL}/transcribe/`, {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type — let fetch set it with boundary
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Transcription failed:", errorText);
    throw new Error("Transcription failed");
  }
  
  const data = await response.json();
  return data.transcript;
};
