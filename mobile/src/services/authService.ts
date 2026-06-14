import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.29.37:8000';

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async saveToken(token: string) {
    await AsyncStorage.setItem('auth_token', token);
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('auth_token');
  },

  async logout() {
    await AsyncStorage.removeItem('auth_token');
  },
};
