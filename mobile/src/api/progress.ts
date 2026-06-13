import { apiGet } from '../utils/apiClient';

export async function fetchProgressSummary() {
  return apiGet('/api/progress/summary');
}

export async function fetchScoreHistory(days = 30) {
  return apiGet(`/api/progress/history?days=${days}`);
}
