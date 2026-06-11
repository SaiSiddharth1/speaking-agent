import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister } from '../services/api';

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('access_token').then((token) => {
      setIsLoggedIn(!!token);
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    await apiLogin(email, password);
    setIsLoggedIn(true);
  };

  const register = async (email: string, password: string, name: string) => {
    await apiRegister(email, password, name);
    await login(email, password);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('access_token');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
