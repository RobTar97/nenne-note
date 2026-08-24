import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type * as NotificationsModule from 'expo-notifications';
import type { SQLiteDatabase } from 'expo-sqlite';

import { lastEntry, runningEntry } from '@/db/repo';
import { TIMER_NUDGE_MIN, type Settings } from '@/db/types';
import { dictionaries, formatDuration } from '@/i18n';

/**
 * Local reminders.
 *
 * Two nudges, both derived from what is already in the database rather than
 * from any state of their own:
 *
 *  - **Feed** — fires `remindFeedMin` after the last feed *started*.
 *  - **Forgotten timer** — fires when a session has been running for four hours,
 *    which in practice means the parent fell asleep with the timer going.
 *
 * Everything is rescheduled from scratch on every database change. That is a
 * little wasteful (two cancels and at most two schedules) and completely
 * removes the class of bug where a reminder outlives the log that justified it —
 * a notification telling a parent their baby is due a feed, an hour after they
 * fed them, is worse than no notification at all.
 */

const CHANNEL_ID = 'reminders';

/** Tags our own scheduled notifications so we never cancel someone else's. */
const OWNED = { owner: 'nenne-reminders' } as const;

/**
 * `expo-notifications` **throws from its import** inside Expo Go — Android push
 * support was removed there in SDK 53, and the module refuses to load at all
 * even though this app only ever schedules local notifications.
 *
 * A static import would therefore take the whole app down in Expo Go, so the
 * module is required lazily and every entry point below degrades to a no-op
 * when it isn't there. Reminders work in a development or production build;
 * everything else in the app keeps working without one.
 */
const IS_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let cached: typeof NotificationsModule | null | undefined;

function load(): typeof NotificationsModule | null {
  if (cached !== undefined) return cached;
  if (IS_EXPO_GO) {
    cached = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-notifications') as typeof NotificationsModule;
    // Nothing arrives while the app is open — the screen already says all of this.
    mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: false,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    cached = mod;
  } catch (e) {
    console.warn('[reminders] notifications unavailable, reminders disabled', e);
    cached = null;
  }
  return cached;
}

/** Whether reminders can work at all in this environment. */
export function remindersAvailable() {
  return load() !== null;
}

async function ensureChannel(N: typeof NotificationsModule) {
  if (Platform.OS !== 'android') return;
  await N.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Reminders',
    importance: N.AndroidImportance.DEFAULT,
    // A parent may be holding a sleeping baby. Never vibrate for a reminder.
    vibrationPattern: null,
    sound: null,
    lightColor: '#161616',
  });
}

export async function hasPermission() {
  const N = load();
  if (!N) return false;
  try {
    const { granted } = await N.getPermissionsAsync();
    return granted;
  } catch {
    return false;
  }
}

/**
 * Asks for permission, returning whether it was granted.
 *
 * Only ever called from the moment the user flips a reminder on — asking before
 * they have shown any interest is the fastest way to be denied permanently, and
 * a denial cannot be undone from inside the app.
 */
export async function requestPermission() {
  const N = load();
  if (!N) return false;
  try {
    const existing = await N.getPermissionsAsync();
    if (existing.granted) {
      await ensureChannel(N);
      return true;
    }
    if (!existing.canAskAgain) return false;

    const asked = await N.requestPermissionsAsync();
    if (asked.granted) await ensureChannel(N);
    return asked.granted;
  } catch {
    return false;
  }
}

async function cancelOurs(N: typeof NotificationsModule) {
  try {
    const scheduled = await N.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((n) => (n.content.data as Record<string, unknown> | null)?.owner === OWNED.owner)
        .map((n) => N.cancelScheduledNotificationAsync(n.identifier)),
    );
  } catch {
    // Nothing scheduled, or the module is unavailable. Either way there is
    // nothing to clean up.
  }
}

async function scheduleAt(
  N: typeof NotificationsModule,
  date: Date,
  title: string,
  body: string,
) {
  await N.scheduleNotificationAsync({
    content: { title, body, data: OWNED, sound: false },
    trigger: {
      type: N.SchedulableTriggerInputTypes.DATE,
      date,
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : null),
    },
  });
}

/**
 * Brings the scheduled notifications in line with the database.
 *
 * Safe to call on every change, safe when permission was never granted, and
 * safe in an environment with no notifications at all.
 */
export async function syncReminders(
  db: SQLiteDatabase,
  babyId: number,
  babyName: string,
  settings: Settings,
) {
  const N = load();
  if (!N) return;

  await cancelOurs(N);

  if (!babyId) return;
  if (!settings.remindFeed && !settings.remindTimer) return;
  if (!(await hasPermission())) return;

  await ensureChannel(N);

  const t = dictionaries[settings.language];
  const now = Date.now();

  if (settings.remindFeed) {
    const feed = await lastEntry(db, babyId, 'feed');
    if (feed) {
      const at = feed.startedAt + settings.remindFeedMin * 60_000;
      // A due-or-overdue reminder is not worth firing: the parent is either
      // already feeding, or they know.
      if (at > now + 30_000) {
        await scheduleAt(
          N,
          new Date(at),
          t.reminders.feedTitle,
          t.reminders.feedBody(
            babyName,
            formatDuration(settings.remindFeedMin * 60, settings.language, t),
          ),
        );
      }
    }
  }

  if (settings.remindTimer) {
    const running = await runningEntry(db, babyId);
    if (running) {
      const at = running.startedAt + TIMER_NUDGE_MIN * 60_000;
      if (at > now + 30_000) {
        const kind = running.kind === 'sleep' ? t.kind.sleep : t.kind.feed;
        await scheduleAt(N, new Date(at), t.reminders.timerTitle, t.reminders.timerBody(kind));
      }
    }
  }
}

/** Clears everything we scheduled — used when reminders are switched off. */
export async function clearReminders() {
  const N = load();
  if (!N) return;
  await cancelOurs(N);
}
