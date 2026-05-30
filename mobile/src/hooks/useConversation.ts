import { useState } from 'react';
import { sendMessage, sendVoiceConversation, Message } from '../services/conversationService';

export function useConversation(
  initialLevel: string = 'intermediate',
  userId: string = 'test_user_1'
) {
  const [history, setHistory] = useState<Message[]>([]);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [correction, setCorrection] = useState<string | null>(null);
  const [encouragement, setEncouragement] = useState<string>('');
  const [followUpQuestion, setFollowUpQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [level, setLevel] = useState<string>(initialLevel);

  const handleSendMessage = async (transcript: string) => {
    if (!transcript.trim()) return;
    
    setIsLoading(true);
    
    // 1. Append user's transcript to local history immediately
    const userMsg: Message = { role: 'user', content: transcript };
    const currentHistory = [...history, userMsg];
    setHistory(currentHistory);
    
    try {
      // 2. Call the chat API with the previous history
      const response = await sendMessage(transcript, history, userId);
      
      // 3. Update feedback states
      setAiResponse(response.reply);
      setCorrection(response.correction);
      setEncouragement(response.encouragement);
      setFollowUpQuestion(response.follow_up_question);
      
      // 4. Append coach's reply to local history
      const coachMsg: Message = { role: 'assistant', content: response.reply };
      setHistory([...currentHistory, coachMsg]);
    } catch (error) {
      console.error('Failed to get AI coach response:', error);
      setAiResponse('⚠️ Coach Alex is currently unreachable. Please verify your connection or try again shortly.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVoice = async (audioUri: string): Promise<string | null> => {
    if (!audioUri) return null;
    
    setIsLoading(true);
    try {
      const response = await sendVoiceConversation(audioUri, history);
      
      // Update history with both user transcript and coach reply
      const updatedHistory = [
        ...history,
        { role: 'user', content: response.transcript },
        { role: 'assistant', content: response.replyText },
      ];
      
      setHistory(updatedHistory);
      setAiResponse(response.replyText);
      return response.audioUri;
    } catch (error) {
      console.error('Failed voice conversation request:', error);
      setAiResponse('⚠️ Coach Alex is currently unreachable. Please verify your connection or try again shortly.');
      
      // Still show user error message in history if possible or just return null
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = () => {
    setHistory([]);
    setAiResponse('');
    setCorrection(null);
    setEncouragement('');
    setFollowUpQuestion('');
  };

  return {
    history,
    aiResponse,
    correction,
    encouragement,
    followUpQuestion,
    isLoading,
    level,
    setLevel,
    handleSendMessage,
    handleSendVoice,
    resetConversation,
  };
}
