import { apiClient } from './client';

export interface ScoreResult {
  grammar_score: number;
  fluency_score: number;
  overall_score: number;
  feedback_tips: string[];
}

export const scoringApi = {
  score: (transcript: string) =>
    apiClient.post<ScoreResult>('/api/score', { transcript }),
};
