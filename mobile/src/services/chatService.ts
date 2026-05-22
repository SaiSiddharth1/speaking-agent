import { API_BASE_URL } from '../../services/api';

const API_URL = `${API_BASE_URL}/api/chat/`;

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  updated_history: Message[];
}

export async function sendMessage(
  conversationHistory: Message[]
): Promise<ChatResponse> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversation_history: conversationHistory }),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.status}`);
  }

  return response.json();
}
