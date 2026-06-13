import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '../components/Toast';

const BASE_URL = 'http://192.168.29.37:8000';

async function getHeaders(): Promise<HeadersInit> {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function handleResponse<T>(res: Response, path: string): Promise<T> {
  if (res.ok) return res.json();

  let message = `Request failed (${res.status})`;
  try {
    const body = await res.json();
    message = body.detail ?? message;
  } catch {}

  // Auto-show toast for server errors
  if (res.status >= 500) {
    showToast.error('Server Error', 'Please try again later');
  } else if (res.status === 401) {
    showToast.error('Session Expired', 'Please log in again');
  } else if (res.status === 422) {
    showToast.error('Validation Error', message);
  }

  throw new ApiError(message, res.status);
}

export const apiClient = {
  get: async <T>(path: string): Promise<T> => {
    const res = await fetch(`${BASE_URL}${path}`, { headers: await getHeaders() });
    return handleResponse<T>(res, path);
  },
  post: async <T>(path: string, body?: unknown): Promise<T> => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: await getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res, path);
  },
  put: async <T>(path: string, body?: unknown): Promise<T> => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res, path);
  },
};
