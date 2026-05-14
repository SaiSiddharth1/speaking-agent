import { API_BASE_URL } from '../../services/api';

export interface Message {
  role: string;
  content: string;
}

export interface ChatResponse {
  ai_response: string;
  history: Message[];
}

export async function sendMessage(
  userMessage: string,
  history: Message[],
  level: string = 'intermediate',
  userId: number = 1
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/conversation/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_message: userMessage,
      history,
      level,
      user_id: userId,
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
