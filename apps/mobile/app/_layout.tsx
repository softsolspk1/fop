import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider, useAuth } from '../context/AuthContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!token && inAuthGroup) {
      router.replace('/login');
    } else if (token && (segments[0] === 'login' || segments[0] === 'signup')) {
      router.replace('/(tabs)');
    }

    // Hide splash screen once we've decided where to go
    if (isReady) return;

    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Splash hide error:', e);
      } finally {
        setIsReady(true);
      }
    };
    hideSplash();
  }, [token, loading, segments, isReady]);

  if (!isReady) return null;

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
