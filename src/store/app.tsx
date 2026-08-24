import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { addDatabaseChangeListener, useSQLiteContext } from 'expo-sqlite';
import { useLive } from '@/db/live';
import { getBaby, getSettings, setSetting } from '@/db/repo';
import { DEFAULT_SETTINGS, type Baby, type Settings } from '@/db/types';
import { dictionaries, type Dictionary, type Language } from '@/i18n';
import { syncReminders } from '@/notifications/reminders';

type AppValue = {
  ready: boolean;
  baby: Baby | null;
  settings: Settings;
  lang: Language;
  t: Dictionary;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  /**
   * Bumped once when a log is saved. Home watches it so the bear can
   * acknowledge the save — a rare, caused moment, which is the only kind of
   * thing that earns a delight animation.
   */
  celebration: number;
  celebrate: () => void;
  /** Haptics that respect the user's preference, in one place. */
  haptic: {
    select: () => void;
    tap: () => void;
    commit: () => void;
    success: () => void;
    warn: () => void;
  };
};

const AppContext = createContext<AppValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();

  const { data: settings, loading: sLoading } = useLive(getSettings, [], DEFAULT_SETTINGS, ['setting']);
  const { data: baby, loading: bLoading } = useLive(getBaby, [], null as Baby | null, ['baby']);

  const update = useCallback(
    async <K extends keyof Settings>(key: K, value: Settings[K]) => {
      await setSetting(db, key, value);
    },
    [db],
  );

  const [celebration, setCelebration] = useState(0);
  const celebrate = useCallback(() => setCelebration((n) => n + 1), []);

  /**
   * Reminders are a projection of the database, so they are rebuilt from it on
   * every write rather than being scheduled at the call sites that happen to
   * change the relevant rows. One place to get right, and a reminder can never
   * outlive the log that justified it.
   */
  const babyId = baby?.id ?? 0;
  const babyName = baby?.name ?? '';
  const { remindFeed, remindFeedMin, remindTimer, language } = settings;

  useEffect(() => {
    if (!babyId) return;
    const run = () => {
      syncReminders(db, babyId, babyName, {
        ...DEFAULT_SETTINGS,
        remindFeed,
        remindFeedMin,
        remindTimer,
        language,
      }).catch((e) => console.warn('[reminders] sync failed', e));
    };
    run();
    // Only entry writes can change when the next feed is due or whether a
    // session is running; a settings or growth write must not reschedule.
    const sub = addDatabaseChangeListener((event) => {
      if (event.tableName === 'entry') run();
    });
    return () => sub.remove();
  }, [db, babyId, babyName, remindFeed, remindFeedMin, remindTimer, language]);

  const enabled = settings.haptics;
  const haptic = useMemo(
    () => ({
      /** A value ticked past a step: segmented control, chip, picker detent. */
      select: () => {
        if (enabled) Haptics.selectionAsync();
      },
      /** A light confirmation that something committed. */
      tap: () => {
        if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      /** Something heavier landed: a timer started or stopped. */
      commit: () => {
        if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      },
      success: () => {
        if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      warn: () => {
        if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      },
    }),
    [enabled],
  );

  const value = useMemo<AppValue>(
    () => ({
      ready: !sLoading && !bLoading,
      baby,
      settings,
      lang: settings.language,
      t: dictionaries[settings.language],
      update,
      haptic,
      celebration,
      celebrate,
    }),
    [baby, settings, sLoading, bLoading, update, haptic, celebration, celebrate],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

/** The baby, asserted non-null. Only call from screens behind the onboarding gate. */
export function useBaby() {
  const { baby } = useApp();
  if (!baby) throw new Error('useBaby called before onboarding completed');
  return baby;
}
