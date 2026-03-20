import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '../context/AuthContext';

function InitialLayout() {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!token && inAuthGroup) {
      // Redirect to the login page if they are trying to access protected pages and are not logged in
      router.replace('/login');
    } else if (token && (segments[0] === 'login' || segments[0] === 'signup')) {
      // Redirect away from login/signup if they are already logged in
      router.replace('/(tabs)');
    }
  }, [token, loading, segments]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Login', headerShown: false }} />
      <Stack.Screen name="signup" options={{ title: 'Signup', headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <InitialLayout />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
