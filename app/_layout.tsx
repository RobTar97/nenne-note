import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
// Imported from the per-weight subpaths, not the package root: the root barrel
// `require()`s all five weights, and Metro would bundle 19MB of TTF instead of
// the three the design actually uses.
import { ZenMaruGothic_400Regular } from '@expo-google-fonts/zen-maru-gothic/400Regular';
import { ZenMaruGothic_500Medium } from '@expo-google-fonts/zen-maru-gothic/500Medium';
import { ZenMaruGothic_700Bold } from '@expo-google-fonts/zen-maru-gothic/700Bold';

import { DB_NAME, migrate } from '@/db/schema';
import { AppProvider, useApp } from '@/store/app';
import { color } from '@/design/tokens';

// Held until the database has migrated and the fonts are in memory, so the
// first frame the user sees is the real screen — never a flash of fallback type.
SplashScreen.preventAutoHideAsync();

/** How long the splash will wait for the type before giving up on it. */
const FONT_DEADLINE_MS = 4000;

/**
 * `RootLayout` deliberately holds no state.
 *
 * `SQLiteProvider` captures the `children` element it was handed when it mounts
 * and does not re-render it when its parent re-renders, so any state that lives
 * *above* the provider silently delivers stale props to everything below it.
 * All boot state therefore lives in `Boot`, underneath the provider.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: color.bg }}>
      <SafeAreaProvider>
        <SQLiteProvider
          databaseName={DB_NAME}
          onInit={migrate}
          options={{ enableChangeListener: true }}
        >
          <AppProvider>
            <StatusBar style="dark" />
            <Boot />
          </AppProvider>
        </SQLiteProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Boot() {
  const { ready, settings } = useApp();
  const segments = useSegments();
  const router = useRouter();
  const reduced = useReducedMotion();

  const [fontsLoaded, fontError] = useFonts({
    ZenMaruGothic_400Regular,
    ZenMaruGothic_500Medium,
    ZenMaruGothic_700Bold,
  });

  // A font that fails — or a slow first-run download on a bad connection — must
  // never leave the user staring at a splash screen. Past the deadline we boot
  // anyway and the platform falls back to its own face.
  const [fontDeadline, setFontDeadline] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setFontDeadline(true), FONT_DEADLINE_MS);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (fontError) console.warn('[fonts] failed to load, falling back', fontError);
  }, [fontError]);

  const booted = ready && (fontsLoaded || !!fontError || fontDeadline);

  useEffect(() => {
    if (booted) SplashScreen.hideAsync();
  }, [booted]);

  // The onboarding gate. An effect on the current segments rather than a
  // <Redirect> inside each screen, so every route — deep links included — lands
  // in the right place.
  useEffect(() => {
    if (!booted) return;
    const onOnboarding = segments[0] === 'onboarding';
    if (!settings.onboarded && !onOnboarding) router.replace('/onboarding');
    else if (settings.onboarded && onOnboarding) router.replace('/');
  }, [booted, settings.onboarded, segments, router]);

  if (!booted) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color.bg },
        // The platform push, unmodified — a screen transition rebuilt in JS
        // loses the interactive back gesture and stops matching every other app
        // on the device. Under reduced motion it becomes a cross-fade, which is
        // gentler without removing the sense of moving somewhere.
        animation: reduced ? 'fade' : 'default',
        // Makes the iOS back swipe run the transition in reverse under the
        // finger rather than the default push.
        animationMatchesGesture: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="today" />
      <Stack.Screen name="summary" />
      <Stack.Screen name="stats" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="growth" />
      <Stack.Screen name="milestones" />
      <Stack.Screen name="support" />
      <Stack.Screen name="growth-log" options={{ presentation: 'modal' }} />
      {/* A log is a task, not a place: it presents over the app and dismisses
          back the way it came, which is what makes swipe-to-close feel right. */}
      <Stack.Screen name="log" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
