import { useState } from 'react';
import { sendMessage, Message } from '../services/conversationService';

export function useConversation(
  initialLevel: string = 'intermediate',
  userId: number = 1
) {
  const [history, setHistory] = useState<Message[]>([]);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [level, setLevel] = useState<string>(initialLevel);

  const handleSendMessage = async (transcript: string) => {
    if (!transcript.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await sendMessage(transcript, history, level, userId);
      setAiResponse(response.ai_response);
      setHistory(response.history);
    } catch (error) {
      console.error('Failed to get AI coach response:', error);
      setAiResponse('⚠️ Coach Alex is currently unreachable. Please verify your connection or try again shortly.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = () => {
    setHistory([]);
    setAiResponse('');
  };

  return {
    history,
    aiResponse,
    isLoading,
    level,
    setLevel,
    handleSendMessage,
    resetConversation,
  };
}
