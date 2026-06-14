/**
 * conversationService.ts — Day 30: Voice Conversation API Layer
 *
 * Handles communication with the POST /api/conversation/respond endpoint.
 * Sends audio + conversation history as multipart/form-data.
 * Receives JSON with reply_text, audio_base64, and updated_history.
 */import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const token = await AsyncStorage.getItem('access_token');

  const response = await FileSystem.uploadAsync(
    `${API_BASE_URL}/api/conversation/respond`,
    audioUri,
    {
      fieldName: 'file',
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      parameters: {
        conversation_history: JSON.stringify(history),
      },
    }
  );

  if (response.status !== 200) {
    throw new Error(response.body || 'Failed to upload audio');
  }

  const data: ConversationResponse = JSON.parse(response.body);
  return data;
}
