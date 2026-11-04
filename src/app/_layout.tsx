import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { COLORS } from '@/constants/colors';
import { AuthProvider, useAuth } from '@/context/auth-context';

// Screens pushed above the tabs show a native header with a back button.
const DETAIL_SCREEN_OPTIONS = {
  headerShown: true,
  headerBackTitle: 'Quay lại',
  headerTintColor: COLORS.primary,
  headerStyle: { backgroundColor: COLORS.surface },
  headerTitleStyle: { color: COLORS.text },
} as const;

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { user, isLoading } = useAuth();

  // Keep the native splash screen up until the stored session has been read.
  if (isLoading) {
    return null;
  }

  return (
    <>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!!user} redirectTo="/login">
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="temple/[id]" options={DETAIL_SCREEN_OPTIONS} />
          <Stack.Screen name="checkout" options={DETAIL_SCREEN_OPTIONS} />
          <Stack.Screen name="order/[id]" options={DETAIL_SCREEN_OPTIONS} />
          <Stack.Screen name="profile-edit" options={DETAIL_SCREEN_OPTIONS} />
          <Stack.Screen name="donation/new" options={DETAIL_SCREEN_OPTIONS} />
          <Stack.Screen name="donation/[id]" options={DETAIL_SCREEN_OPTIONS} />
        </Stack.Protected>
        <Stack.Protected guard={!user} redirectTo="/">
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
