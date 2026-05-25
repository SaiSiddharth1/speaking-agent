/**
 * chatService.ts — Voice Chat Pipeline Service
 * 
 * Handles the full voice conversation flow:
 *   Record audio → Send to /api/chat/voice → Receive AI audio response
 * 
 * The backend handles: STT → LLM → TTS
 * This service handles: sending audio + receiving audio + extracting metadata
 */

import { API_BASE_URL } from './api';

export interface VoiceChatResponse {
  /** URL to the audio blob that can be played with expo-av */
  audioUrl: string;
  /** The user's transcribed speech text */
  transcript: string;
  /** The AI coach's text reply */
  aiReply: string;
  /** Session ID used for this conversation */
  sessionId: string;
}

/**
 * Send recorded audio to the backend voice chat pipeline.
 * 
 * Flow: Audio file → Backend (STT → LLM → TTS) → Audio response
 * 
 * @param audioUri - Local URI of the recorded audio file (from expo-av)
 * @param sessionId - Unique session ID for conversation continuity
 * @returns VoiceChatResponse with audio URL and text metadata
 */
export async function sendVoiceChat(
  audioUri: string,
  sessionId: string
): Promise<VoiceChatResponse> {
  const formData = new FormData();

  // React Native FormData needs this specific object shape
  formData.append('audio', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  } as any);

  formData.append('session_id', sessionId);

  const response = await fetch(`${API_BASE_URL}/api/chat/voice`, {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type — let fetch set it with multipart boundary
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[chatService] Voice chat failed:', response.status, errorText);
    throw new Error(`Voice chat failed: ${response.status}`);
  }

  // Extract metadata from response headers
  const transcript = decodeURIComponent(
    response.headers.get('X-Transcript') || ''
  );
  const aiReply = decodeURIComponent(
    response.headers.get('X-AI-Reply') || ''
  );
  const returnedSessionId = response.headers.get('X-Session-Id') || sessionId;

  // Convert response audio blob to a playable URI
  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);

  return {
    audioUrl,
    transcript,
    aiReply,
    sessionId: returnedSessionId,
  };
}

/**
 * Get conversation history for a session.
 * 
 * @param sessionId - The session to fetch history for
 * @returns Array of message objects with role and content
 */
export async function getConversationHistory(sessionId: string): Promise<{
  session_id: string;
  message_count: number;
  messages: Array<{ role: string; content: string }>;
}> {
  const response = await fetch(
    `${API_BASE_URL}/api/chat/history?session_id=${encodeURIComponent(sessionId)}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch conversation history');
  }

  return response.json();
}

/**
 * Clear conversation history for a session.
 * 
 * @param sessionId - The session to clear
 */
export async function clearConversationHistory(sessionId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/chat/history?session_id=${encodeURIComponent(sessionId)}`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    throw new Error('Failed to clear conversation history');
  }
}

/**
 * Generate a unique session ID for a new conversation.
 * Uses a simple UUID v4 implementation.
 */
export function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
