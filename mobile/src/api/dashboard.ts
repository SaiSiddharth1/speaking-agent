import { apiClient } from './client';

export interface DashboardSummary {
  total_sessions: number;
  avg_grammar: number;
  avg_fluency: number;
  avg_overall: number;
  total_turns: number;
  trend: { date: string; overall: number }[];
}

export const dashboardApi = {
  getSummary: () => apiClient.get<DashboardSummary>('/api/dashboard/summary'),
};
