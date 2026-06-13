import { apiClient } from './client';

export interface SessionData {
  id: number;
  started_at: string;
  ended_at: string | null;
  grammar_score: number | null;
  fluency_score: number | null;
  overall_score: number | null;
  turn_count: number;
}

export const sessionApi = {
  start: () => apiClient.post<SessionData>('/api/sessions/start'),
  end: (id: number, scores: {
    grammar_score: number;
    fluency_score: number;
    overall_score: number;
    turn_count: number;
  }) => apiClient.put<SessionData>(`/api/sessions/${id}/end`, scores),
  list: (limit = 20, offset = 0) =>
    apiClient.get<SessionData[]>(`/api/sessions/?limit=${limit}&offset=${offset}`),
};
