import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const lightTheme = {
  background: '#F9FAFB',
  cardBackground: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  primary: '#6366F1',
  border: '#E5E7EB',
  inputBackground: '#F3F4F6',
  tabBarBackground: '#FFFFFF',
  activeTab: '#6366F1',
  inactiveTab: '#9CA3AF',
  isDark: false,
};

export const darkTheme = {
  background: '#0F0F1A',
  cardBackground: '#1E1E2E',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  primary: '#818CF8',
  border: 'rgba(255, 255, 255, 0.08)',
  inputBackground: '#161622',
  tabBarBackground: '#161622',
  activeTab: '#818CF8',
  inactiveTab: '#64748B',
  isDark: true,
};

type ThemeType = typeof lightTheme;

interface ThemeContextType {
  isDarkMode: boolean;
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to Dark mode for that premium look!

  useEffect(() => {
    // Load persisted theme preference
    AsyncStorage.getItem('theme_preference').then((value) => {
      if (value !== null) {
        setIsDarkMode(value === 'dark');
      }
    });
  }, []);

  const toggleTheme = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    AsyncStorage.setItem('theme_preference', newVal ? 'dark' : 'light');
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
