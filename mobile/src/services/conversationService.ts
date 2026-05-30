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
