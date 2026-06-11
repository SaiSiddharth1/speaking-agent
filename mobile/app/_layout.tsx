import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootLayoutNav() {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === 'auth';
    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (isLoggedIn && inAuthGroup) {
      router.replace('/');
    }
  }, [isLoggedIn, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
