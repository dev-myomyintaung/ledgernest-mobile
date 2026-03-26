import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme as useNWColorScheme } from 'nativewind';
import '../src/global.css';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '../src/store/authStore';
import { useThemeStore } from '../src/store/themeStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

const queryClient = new QueryClient();

function ThemeSync() {
  const preference = useThemeStore((s) => s.preference);
  const hasHydrated = useThemeStore((s) => s._hasHydrated);
  const { setColorScheme } = useNWColorScheme();

  useEffect(() => {
    if (!hasHydrated) return;
    setColorScheme(preference);
  }, [preference, hasHydrated]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="splash" options={{ headerShown: false, animation: 'none' }} />
          <Stack.Protected guard={isAuthenticated}>
            <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'none' }} />
            <Stack.Screen name="create-category" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="scan" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="receipt-review" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="profile" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="find-people" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="shared-inbox" options={{ presentation: 'modal', headerShown: false }} />
          </Stack.Protected>
          <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'none' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
