/**
 * conversationService.ts — Day 30: Voice Conversation API Layer
 *
 * Handles communication with the POST /api/conversation/respond endpoint.
 * Sends audio + conversation history as multipart/form-data.
 * Receives JSON with reply_text, audio_base64, and updated_history.
 */

import { API_BASE_URL } from './api';

export interface Message {
  role: string;
  content: string;
}

export interface ConversationResponse {
  reply_text: string;
  audio_base64: string;
  updated_history: Message[];
  user_transcript: string;
}

/**
 * Send recorded audio and conversation history to the backend.
 *
 * @param audioUri - Local file URI of the recorded audio (from expo-av)
 * @param history - Array of previous conversation messages
 * @returns ConversationResponse with reply text, base64 audio, and updated history
 */
export async function sendAudioMessage(
  audioUri: string,
  history: Message[]
): Promise<ConversationResponse> {
  const formData = new FormData();

  // React Native FormData requires this specific object shape for file uploads
  formData.append('file', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  } as any);

  // Send conversation history as a JSON string field
  formData.append('conversation_history', JSON.stringify(history));

  // IMPORTANT: Do NOT set Content-Type header manually.
  // Let fetch set multipart/form-data with the correct boundary automatically.
  const response = await fetch(`${API_BASE_URL}/api/conversation/respond`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = 'Voice conversation failed';
    try {
      const errData = await response.json();
      errorDetail = errData.detail || errorDetail;
    } catch (_) {
      errorDetail = await response.text();
    }
    throw new Error(errorDetail);
  }

  const data: ConversationResponse = await response.json();
  return data;
}
