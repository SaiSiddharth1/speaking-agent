import * as FileSystem from 'expo-file-system';
import { API_BASE_URL } from '../../services/api';

export interface Message {
  role: string;
  content: string;
}

export interface CoachResponse {
  reply: string;
  correction: string | null;
  encouragement: string;
  follow_up_question: string;
  raw_text: string;
}

export interface VoiceConversationResponse {
  transcript: string;
  replyText: string;
  audioUri: string;
}

export async function sendMessage(
  message: string,
  history: Message[],
  userId: string = 'test_user_1'
): Promise<CoachResponse> {
  const response = await fetch(`${API_BASE_URL}/api/conversation/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      message: message,
      history,
      topic: 'free_talk',
    }),
  });

  if (!response.ok) {
    let errorDetail = 'Conversation API failed';
    try {
      const errData = await response.json();
      errorDetail = errData.detail || errorDetail;
    } catch (_) {
      errorDetail = await response.text();
    }
    throw new Error(errorDetail);
  }

  return await response.json();
}

export async function sendVoiceConversation(
  audioUri: string,
  history: Message[]
): Promise<VoiceConversationResponse> {
  const formData = new FormData();

  // React Native FormData needs this exact shape for file uploads
  formData.append('file', {
    uri: audioUri,
    type: 'audio/wav',
    name: 'recording.wav',
  } as any);

  // Pass history as a JSON string (since we are doing a multipart request)
  formData.append('history', JSON.stringify(history));

  const response = await fetch(`${API_BASE_URL}/api/conversation/respond`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = 'Voice pipeline failed';
    try {
      const errData = await response.json();
      errorDetail = errData.detail || errorDetail;
    } catch (_) {
      errorDetail = await response.text();
    }
    throw new Error(errorDetail);
  }

  // Extract transcript and reply text from headers (they are URL-encoded on the server)
  const transcriptHeader = response.headers.get('X-Transcript') || '';
  const replyTextHeader = response.headers.get('X-Reply-Text') || '';

  const transcript = decodeURIComponent(transcriptHeader);
  const replyText = decodeURIComponent(replyTextHeader);

  // Convert binary stream response to blob
  const blob = await response.blob();
  
  // Convert blob to base64 to write to FileSystem
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  // Write base64 string to a temporary file inside the cache directory
  const tempAudioPath = `${FileSystem.cacheDirectory}reply_${Date.now()}.mp3`;
  await FileSystem.writeAsStringAsync(tempAudioPath, base64, {
    encoding: 'base64',
  });

  return {
    transcript,
    replyText,
    audioUri: tempAudioPath,
  };
}
