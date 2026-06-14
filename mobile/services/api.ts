import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const BASE_URL = 'http://192.168.29.37:8000';
export const API_BASE_URL = BASE_URL;

export interface ConversationResponse {
  user_text: string;
  coach_text: string;
  audio_base64: string;
  score: {
    grammar_score: number;
    fluency_score: number;
    overall_score: number;
    feedback_tips: string[];
  };
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function sendAudioToBackend(
  audioUri: string,
  history: { role: string; content: string }[] = []
): Promise<ConversationResponse> {
  const authHeaders = await getAuthHeader();

  if (Platform.OS === 'web') {
    const formData = new FormData();
    
    // For web, if it's a blob/file or a uri, fetch it and append as blob
    let audioBlob: Blob | { uri: string; name: string; type: string };
    if (audioUri.startsWith('blob:') || audioUri.startsWith('http')) {
      const response = await fetch(audioUri);
      audioBlob = await response.blob();
    } else {
      audioBlob = {
        uri: audioUri,
        name: 'recording.m4a',
        type: 'audio/m4a',
      };
    }
    
    formData.append('file', audioBlob as any, 'recording.m4a');
    formData.append('conversation_history', JSON.stringify(history));

    // Do NOT set Content-Type header manually for FormData fetch.
    const response = await fetch(`${BASE_URL}/api/conversation/respond`, {
      method: 'POST',
      headers: authHeaders,
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API error ${response.status}: ${err}`);
    }

    return response.json();
  } else {
    // Native mobile: use FileSystem.uploadAsync
    const token = await AsyncStorage.getItem('access_token');
    const response = await FileSystem.uploadAsync(
      `${BASE_URL}/api/conversation/respond`,
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

    const res = JSON.parse(response.body);
    return {
      user_text: res.user_text ?? res.user_transcript ?? '',
      coach_text: res.coach_text ?? res.reply_text ?? '',
      audio_base64: res.audio_base64 ?? '',
      score: res.score ?? { grammar_score: 0, fluency_score: 0, overall_score: 0, feedback_tips: [] },
    };
  }
}

export async function login(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Login failed');
  const data = await response.json();
  await AsyncStorage.setItem('access_token', data.access_token);
  return data;
}

export async function register(email: string, password: string, name: string) {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  if (!response.ok) throw new Error('Registration failed');
  return response.json();
}

export async function getSessions() {
  const authHeaders = await getAuthHeader();
  const response = await fetch(`${BASE_URL}/api/sessions`, { headers: authHeaders });
  if (!response.ok) throw new Error('Failed to fetch sessions');
  return response.json();
}

export async function getProgress() {
  const authHeaders = await getAuthHeader();
  const response = await fetch(`${BASE_URL}/api/progress`, { headers: authHeaders });
  if (!response.ok) throw new Error('Failed to fetch progress');
  return response.json();
}
