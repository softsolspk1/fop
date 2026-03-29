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

  useEffect(() => {
    // Wait until Auth is loaded
    if (loading) return;

    const initialize = async () => {
      try {
        const inAuthGroup = segments?.[0] === '(tabs)';

        // Logic to decide where to go
        if (!token && inAuthGroup) {
          router.replace('/login');
        } else if (!token && !segments?.length) {
          router.replace('/login');
        } else if (token && (segments?.[0] === 'login' || segments?.[0] === 'signup' || !segments?.length)) {
          router.replace('/(tabs)');
        }

        // Only hide splash once we've signaled where to go
        // Small delay to ensure navigation is processed
        setTimeout(async () => {
          try {
            await SplashScreen.hideAsync();
          } catch (error) {
            console.warn('[Layout] Failed to hide splash:', error);
          }
        }, 100);
      } catch (err) {
        console.error('[Layout] Initialization error:', err);
      }
    };

    initialize();
  }, [loading, token, segments]);

  // Ensure the navigator is always mounted, otherwise router.replace() crashes the app before rendering
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="signup" options={{ title: 'Signup' }} />
      <Stack.Screen name="history" options={{ title: 'Activity History' }} />
      <Stack.Screen name="approvals" options={{ title: 'Approvals' }} />
      <Stack.Screen name="reports" options={{ title: 'Reports' }} />
      <Stack.Screen name="submit-assignment" options={{ title: 'Submit Assignment' }} />
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
