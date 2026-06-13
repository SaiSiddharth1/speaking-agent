import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Replace with your machine's local IP when testing on a physical device
const BASE_URL = 'http://192.168.29.37:8000';

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

  const formData = new FormData();
  formData.append('audio', {
    uri: audioUri,
    name: 'recording.m4a',
    type: 'audio/m4a',
  } as any);
  formData.append('history', JSON.stringify(history));

  const response = await fetch(`${BASE_URL}/api/conversation/respond`, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  return response.json();
}

export async function login(email: string, password: string) {
  const body = new URLSearchParams({ username: email, password });
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!response.ok) throw new Error('Login failed');
  const data = await response.json();
  await AsyncStorage.setItem('access_token', data.access_token);
  return data;
}

export async function register(email: string, password: string, name: string) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
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
