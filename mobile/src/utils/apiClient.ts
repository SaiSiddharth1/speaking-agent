import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:8000';

async function request(path: string, options: RequestInit = {}) {
  const token = await AsyncStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Request failed');
  }

  return response.json();
}

export const apiGet = (path: string) => request(path, { method: 'GET' });
export const apiPost = (path: string, body: any) =>
  request(path, { method: 'POST', body: JSON.stringify(body) });
