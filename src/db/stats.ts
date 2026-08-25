import type { SQLiteDatabase } from 'expo-sqlite';
import type { Entry } from './types';
import { DAY, dayStart, overlap } from '@/utils/time';

/**
 * Derived statistics.
 *
 * Everything here is computed from raw entries rather than stored, so a later
 * edit or deletion can never leave a stale total behind. Volumes are small
 * (a busy month is a few hundred rows), so aggregating in JS is cheaper than
 * maintaining summary tables — and far easier to get right.
 */

type EntryRow = Record<string, never>;

async function entriesOverlapping(db: SQLiteDatabase, babyId: number, from: number, to: number) {
  // A sleep that starts before the window can still fall inside it, so the
  // filter has to be an overlap test, not `started_at >= from`.
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM entry
      WHERE baby_id = ?
        AND started_at < ?
        AND (ended_at IS NULL OR ended_at > ? OR started_at >= ?)
      ORDER BY started_at ASC`,
    babyId,
    to,
    from,
    from,
  );
  return rows.map(
    (r): Entry => ({
      id: r.id,
      babyId: r.baby_id,
      kind: r.kind,
      startedAt: r.started_at,
      endedAt: r.ended_at,
      note: r.note,
      diaperKind: r.diaper_kind,
      feedKind: r.feed_kind,
      amountMl: r.amount_ml,
      leftSec: r.left_sec,
      rightSec: r.right_sec,
      activeSide: r.active_side,
      activeBoth: r.active_both === 1,
      sideSince: r.side_since,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }),
  );
}

export type DaySummary = {
  dayStart: number;
  pee: number;
  poop: number;
  diaperTotal: number;
  feeds: number;
  /** Total bottle volume in ml. `null` when nothing was bottle-fed. */
  bottleMl: number | null;
  nursingSec: number;
  lastFeedAt: number | null;
  lastFeedMl: number | null;
  /** Sleep seconds that fall *inside* this day, so a nap across midnight splits. */
  sleepSec: number;
  naps: number;
  lastSleepStart: number | null;
  lastSleepSec: number | null;
};

const EMPTY = (start: number): DaySummary => ({
  dayStart: start,
  pee: 0,
  poop: 0,
  diaperTotal: 0,
  feeds: 0,
  bottleMl: null,
  nursingSec: 0,
  lastFeedAt: null,
  lastFeedMl: null,
  sleepSec: 0,
  naps: 0,
  lastSleepStart: null,
  lastSleepSec: null,
});

function foldDay(entries: Entry[], start: number, now: number): DaySummary {
  const end = start + DAY;
  const s = EMPTY(start);

  for (const e of entries) {
    if (e.kind === 'sleep') {
      const finish = e.endedAt ?? Math.min(now, end);
      const inside = overlap(e.startedAt, finish, start, end);
      if (inside > 0) {
        s.sleepSec += Math.round(inside / 1000);
        if (e.startedAt >= start && e.startedAt < end) {
          s.naps += 1;
          if (s.lastSleepStart === null || e.startedAt > s.lastSleepStart) {
            s.lastSleepStart = e.startedAt;
            s.lastSleepSec = Math.round(((e.endedAt ?? now) - e.startedAt) / 1000);
          }
        }
      }
      continue;
    }

    // Diapers and feeds are point events: they belong to the day they start in.
    if (e.startedAt < start || e.startedAt >= end) continue;

    if (e.kind === 'diaper') {
      if (e.diaperKind === 'pee' || e.diaperKind === 'both') s.pee += 1;
      if (e.diaperKind === 'poop' || e.diaperKind === 'both') s.poop += 1;
      s.diaperTotal += 1;
    } else {
      s.feeds += 1;
      if (e.amountMl != null) s.bottleMl = (s.bottleMl ?? 0) + e.amountMl;
      s.nursingSec += e.leftSec + e.rightSec;
      if (s.lastFeedAt === null || e.startedAt > s.lastFeedAt) {
        s.lastFeedAt = e.startedAt;
        s.lastFeedMl = e.amountMl;
      }
    }
  }
  return s;
}

export async function daySummary(
  db: SQLiteDatabase,
  babyId: number,
  day = Date.now(),
  now = Date.now(),
): Promise<DaySummary> {
  const start = dayStart(day);
  const entries = await entriesOverlapping(db, babyId, start, start + DAY);
  return foldDay(entries, start, now);
}

/** One summary per day, oldest first — the input for every trend chart. */
export async function daySeries(
  db: SQLiteDatabase,
  babyId: number,
  days: number,
  now = Date.now(),
): Promise<DaySummary[]> {
  const end = dayStart(now) + DAY;
  const start = end - days * DAY;
  const entries = await entriesOverlapping(db, babyId, start, end);
  return Array.from({ length: days }, (_, i) => foldDay(entries, start + i * DAY, now));
}

export type Rhythm = {
  /** Median minutes between the start of one feed and the next. */
  feedGapMin: number | null;
  /** Projection of the next feed, from the last one plus the median gap. */
  nextFeedAt: number | null;
  /** Median nap length in minutes (naps under 4h, so night sleep doesn't skew it). */
  napMin: number | null;
  /** Median hours of sleep per day over the window. */
  sleepHoursPerDay: number | null;
  /** Median feeds per day over the window. */
  feedsPerDay: number | null;
  /** How many days of data this is based on. Below 3, don't show predictions. */
  sampleDays: number;
};

const median = (xs: number[]) => {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

/**
 * The baby's own rhythm, derived from the last `days` days.
 *
 * Median rather than mean throughout: one four-hour car journey or a single
 * missed log would drag an average badly, and parents read these numbers as
 * "normal for us", which is exactly what a median is.
 */
export async function rhythm(
  db: SQLiteDatabase,
  babyId: number,
  days = 7,
  now = Date.now(),
): Promise<Rhythm> {
  const end = dayStart(now) + DAY;
  const start = end - days * DAY;
  const entries = await entriesOverlapping(db, babyId, start, end);

  const feeds = entries.filter((e) => e.kind === 'feed').sort((a, b) => a.startedAt - b.startedAt);
  const gaps: number[] = [];
  for (let i = 1; i < feeds.length; i++) {
    const gap = (feeds[i].startedAt - feeds[i - 1].startedAt) / 60_000;
    // Ignore double-taps and overnight gaps that are really "we stopped logging".
    if (gap >= 20 && gap <= 8 * 60) gaps.push(gap);
  }
  const feedGapMin = median(gaps);
  const lastFeed = feeds.at(-1);

  const naps = entries
    .filter((e) => e.kind === 'sleep' && e.endedAt != null)
    .map((e) => (e.endedAt! - e.startedAt) / 60_000)
    .filter((m) => m >= 5 && m <= 240);

  const series = Array.from({ length: days }, (_, i) => foldDay(entries, start + i * DAY, now));
  // Only count days that actually have data; a fresh install has empty history.
  const active = series.filter((d) => d.feeds > 0 || d.diaperTotal > 0 || d.sleepSec > 0);

  return {
    feedGapMin: feedGapMin ? Math.round(feedGapMin) : null,
    nextFeedAt:
      feedGapMin && lastFeed ? lastFeed.startedAt + Math.round(feedGapMin) * 60_000 : null,
    napMin: naps.length ? Math.round(median(naps)!) : null,
    sleepHoursPerDay: active.length
      ? Math.round((median(active.map((d) => d.sleepSec))! / 3600) * 10) / 10
      : null,
    feedsPerDay: active.length ? Math.round(median(active.map((d) => d.feeds))!) : null,
    sampleDays: active.length,
  };
}

export type { EntryRow };
