import type { SQLiteDatabase } from 'expo-sqlite';
import type {
  Baby,
  DiaperKind,
  Entry,
  EntryKind,
  FeedKind,
  Growth,
  Milestone,
  NursingSide,
  Settings,
  Side,
} from './types';
import { DEFAULT_SETTINGS } from './types';

/* ------------------------------------------------------------------ rows */

type EntryRow = {
  id: number;
  baby_id: number;
  kind: EntryKind;
  started_at: number;
  ended_at: number | null;
  note: string | null;
  diaper_kind: DiaperKind | null;
  feed_kind: FeedKind | null;
  amount_ml: number | null;
  left_sec: number;
  right_sec: number;
  active_side: Side | null;
  active_both: number;
  side_since: number | null;
  created_at: number;
  updated_at: number;
};

const toEntry = (r: EntryRow): Entry => ({
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
});

/* ------------------------------------------------------------------ baby */

export async function getBaby(db: SQLiteDatabase): Promise<Baby | null> {
  const r = await db.getFirstAsync<{
    id: number;
    name: string;
    birthday: string;
    created_at: number;
  }>('SELECT * FROM baby ORDER BY id LIMIT 1');
  return r ? { id: r.id, name: r.name, birthday: r.birthday, createdAt: r.created_at } : null;
}

export async function createBaby(db: SQLiteDatabase, name: string, birthday: string) {
  const res = await db.runAsync(
    'INSERT INTO baby (name, birthday, created_at) VALUES (?, ?, ?)',
    name,
    birthday,
    Date.now(),
  );
  return res.lastInsertRowId;
}

export async function updateBaby(db: SQLiteDatabase, id: number, name: string, birthday: string) {
  await db.runAsync('UPDATE baby SET name = ?, birthday = ? WHERE id = ?', name, birthday, id);
}

/* -------------------------------------------------------------- settings */

export async function getSettings(db: SQLiteDatabase): Promise<Settings> {
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT * FROM setting');
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    language: map.language === 'en' ? 'en' : DEFAULT_SETTINGS.language,
    caregiver:
      map.caregiver === 'papa' || map.caregiver === 'none' ? map.caregiver : DEFAULT_SETTINGS.caregiver,
    haptics: map.haptics ? map.haptics === '1' : DEFAULT_SETTINGS.haptics,
    onboarded: map.onboarded === '1',
    remindFeed: map.remindFeed === '1',
    // A corrupt or hand-edited value must not schedule a notification for
    // NaN minutes from now, which would silently never fire.
    remindFeedMin: Number.isFinite(Number(map.remindFeedMin))
      ? Number(map.remindFeedMin)
      : DEFAULT_SETTINGS.remindFeedMin,
    remindTimer: map.remindTimer === '1',
  };
}

export async function setSetting<K extends keyof Settings>(
  db: SQLiteDatabase,
  key: K,
  value: Settings[K],
) {
  const raw = typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
  await db.runAsync(
    'INSERT INTO setting (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    raw,
  );
}

/* --------------------------------------------------------------- entries */

export type NewEntry = {
  kind: EntryKind;
  startedAt: number;
  endedAt?: number | null;
  note?: string | null;
  diaperKind?: DiaperKind | null;
  feedKind?: FeedKind | null;
  amountMl?: number | null;
  leftSec?: number;
  rightSec?: number;
  activeSide?: Side | null;
  activeBoth?: boolean;
  sideSince?: number | null;
};

export async function createEntry(db: SQLiteDatabase, babyId: number, e: NewEntry) {
  const now = Date.now();
  const res = await db.runAsync(
    `INSERT INTO entry
       (baby_id, kind, started_at, ended_at, note, diaper_kind, feed_kind, amount_ml,
        left_sec, right_sec, active_side, active_both, side_since, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    babyId,
    e.kind,
    e.startedAt,
    e.endedAt ?? null,
    e.note ?? null,
    e.diaperKind ?? null,
    e.feedKind ?? null,
    e.amountMl ?? null,
    e.leftSec ?? 0,
    e.rightSec ?? 0,
    e.activeSide ?? null,
    e.activeBoth ? 1 : 0,
    e.sideSince ?? null,
    now,
    now,
  );
  return res.lastInsertRowId;
}

export async function updateEntry(db: SQLiteDatabase, id: number, e: Partial<NewEntry>) {
  const cols: Record<string, unknown> = {};
  if ('startedAt' in e) cols.started_at = e.startedAt;
  if ('endedAt' in e) cols.ended_at = e.endedAt;
  if ('note' in e) cols.note = e.note;
  if ('diaperKind' in e) cols.diaper_kind = e.diaperKind;
  if ('feedKind' in e) cols.feed_kind = e.feedKind;
  if ('amountMl' in e) cols.amount_ml = e.amountMl;
  if ('leftSec' in e) cols.left_sec = e.leftSec;
  if ('rightSec' in e) cols.right_sec = e.rightSec;
  if ('activeSide' in e) cols.active_side = e.activeSide;
  if ('activeBoth' in e) cols.active_both = e.activeBoth ? 1 : 0;
  if ('sideSince' in e) cols.side_since = e.sideSince;
  cols.updated_at = Date.now();

  const keys = Object.keys(cols);
  if (keys.length === 0) return;
  await db.runAsync(
    `UPDATE entry SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`,
    ...keys.map((k) => cols[k] as never),
    id,
  );
}

export async function deleteEntry(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM entry WHERE id = ?', id);
}

export async function getEntry(db: SQLiteDatabase, id: number): Promise<Entry | null> {
  const r = await db.getFirstAsync<EntryRow>('SELECT * FROM entry WHERE id = ?', id);
  return r ? toEntry(r) : null;
}

/**
 * Entries overlapping [from, to). Newest first.
 *
 * Point events have `ended_at === started_at`, so the final OR keeps them in
 * the day they started while the first two terms include a sleep that began
 * before the day and is still running or ended inside it.
 */
export async function listEntries(
  db: SQLiteDatabase,
  babyId: number,
  from: number,
  to: number,
  kind?: EntryKind,
): Promise<Entry[]> {
  const rows = await db.getAllAsync<EntryRow>(
    `SELECT * FROM entry
      WHERE baby_id = ? AND started_at < ?
        AND (ended_at IS NULL OR ended_at > ? OR started_at >= ?)
        ${kind ? 'AND kind = ?' : ''}
      ORDER BY started_at DESC`,
    ...([babyId, to, from, from, ...(kind ? [kind] : [])] as never[]),
  );
  return rows.map(toEntry);
}

/** The most recent *finished* entry of a kind — what the home cards show. */
export async function lastEntry(
  db: SQLiteDatabase,
  babyId: number,
  kind: EntryKind,
  diaperKind?: DiaperKind[],
): Promise<Entry | null> {
  const diaperFilter = diaperKind?.length
    ? `AND diaper_kind IN (${diaperKind.map(() => '?').join(',')})`
    : '';
  const r = await db.getFirstAsync<EntryRow>(
    `SELECT * FROM entry
      WHERE baby_id = ? AND kind = ? AND ended_at IS NOT NULL ${diaperFilter}
      ORDER BY started_at DESC LIMIT 1`,
    ...([babyId, kind, ...(diaperKind ?? [])] as never[]),
  );
  return r ? toEntry(r) : null;
}

/** The single running session, if any. Only one can run at a time. */
export async function runningEntry(db: SQLiteDatabase, babyId: number): Promise<Entry | null> {
  const r = await db.getFirstAsync<EntryRow>(
    'SELECT * FROM entry WHERE baby_id = ? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1',
    babyId,
  );
  return r ? toEntry(r) : null;
}

/* ---------------------------------------------------------------- timers */

export async function startSleep(db: SQLiteDatabase, babyId: number, at = Date.now()) {
  return createEntry(db, babyId, { kind: 'sleep', startedAt: at, endedAt: null });
}

export async function startNursing(
  db: SQLiteDatabase,
  babyId: number,
  side: NursingSide,
  at = Date.now(),
) {
  return createEntry(db, babyId, {
    kind: 'feed',
    feedKind: 'breast',
    startedAt: at,
    endedAt: null,
    activeSide: side === 'both' ? null : side,
    activeBoth: side === 'both',
    sideSince: at,
  });
}

/**
 * Flushes the time accrued on the currently running side into its accumulator.
 * Every timer mutation goes through this, so elapsed time can never be lost by
 * switching sides or pausing.
 */
function flush(entry: Entry, at: number) {
  const running = entry.activeBoth || entry.activeSide !== null;
  const delta =
    running && entry.sideSince ? Math.max(0, Math.round((at - entry.sideSince) / 1000)) : 0;
  // Tandem credits the same wall-clock seconds to both sides, because both
  // breasts really were feeding for that whole time. The session's own length
  // comes from `startedAt`, not from summing the two, so nothing double-counts.
  return {
    leftSec: entry.leftSec + (entry.activeBoth || entry.activeSide === 'left' ? delta : 0),
    rightSec: entry.rightSec + (entry.activeBoth || entry.activeSide === 'right' ? delta : 0),
  };
}

/** Whether a nursing session is currently counting, on any side. */
export const isNursing = (e: Entry) => e.activeBoth || e.activeSide !== null;

/** Switch sides, or pass the same side to pause it. */
export async function setNursingSide(
  db: SQLiteDatabase,
  entry: Entry,
  side: NursingSide | null,
  at = Date.now(),
) {
  const { leftSec, rightSec } = flush(entry, at);
  await updateEntry(db, entry.id, {
    leftSec,
    rightSec,
    activeSide: side === 'both' ? null : side,
    activeBoth: side === 'both',
    sideSince: side ? at : null,
  });
}

export async function stopRunning(db: SQLiteDatabase, entry: Entry, at = Date.now()) {
  if (entry.kind === 'sleep') {
    await updateEntry(db, entry.id, { endedAt: at });
    return;
  }
  const { leftSec, rightSec } = flush(entry, at);
  await updateEntry(db, entry.id, {
    endedAt: at,
    leftSec,
    rightSec,
    activeSide: null,
    activeBoth: false,
    sideSince: null,
  });
}

/** Live elapsed seconds for a running entry, including the un-flushed side. */
/**
 * How long the session has been going, as wall-clock time.
 *
 * Deliberately measured from `startedAt` rather than by summing the per-side
 * accumulators. Summing is wrong in two directions: it under-reports a paused
 * session (the baby unlatched but the feed is still happening) and it
 * double-counts a tandem feed, where the same minute legitimately belongs to
 * both sides. `leftSec` / `rightSec` remain the per-side detail.
 */
export function elapsedSec(entry: Entry, now: number) {
  return Math.max(0, Math.round(((entry.endedAt ?? now) - entry.startedAt) / 1000));
}

/** Per-side nursing seconds, including time not yet flushed. */
export function sideSeconds(entry: Entry, now: number) {
  return flush(entry, now);
}

/* --------------------------------------------------------------- growth */

export async function listGrowth(db: SQLiteDatabase, babyId: number): Promise<Growth[]> {
  const rows = await db.getAllAsync<{
    id: number;
    baby_id: number;
    measured_at: number;
    weight_g: number | null;
    height_mm: number | null;
    head_mm: number | null;
    note: string | null;
  }>('SELECT * FROM growth WHERE baby_id = ? ORDER BY measured_at DESC', babyId);
  return rows.map((r) => ({
    id: r.id,
    babyId: r.baby_id,
    measuredAt: r.measured_at,
    weightG: r.weight_g,
    heightMm: r.height_mm,
    headMm: r.head_mm,
    note: r.note,
  }));
}

export async function createGrowth(
  db: SQLiteDatabase,
  babyId: number,
  g: Omit<Growth, 'id' | 'babyId'>,
) {
  const res = await db.runAsync(
    'INSERT INTO growth (baby_id, measured_at, weight_g, height_mm, head_mm, note) VALUES (?,?,?,?,?,?)',
    babyId,
    g.measuredAt,
    g.weightG,
    g.heightMm,
    g.headMm,
    g.note,
  );
  return res.lastInsertRowId;
}

export async function getGrowth(db: SQLiteDatabase, id: number): Promise<Growth | null> {
  const r = await db.getFirstAsync<{
    id: number;
    baby_id: number;
    measured_at: number;
    weight_g: number | null;
    height_mm: number | null;
    head_mm: number | null;
    note: string | null;
  }>('SELECT * FROM growth WHERE id = ?', id);
  return r
    ? {
        id: r.id,
        babyId: r.baby_id,
        measuredAt: r.measured_at,
        weightG: r.weight_g,
        heightMm: r.height_mm,
        headMm: r.head_mm,
        note: r.note,
      }
    : null;
}

export async function updateGrowth(
  db: SQLiteDatabase,
  id: number,
  g: Omit<Growth, 'id' | 'babyId'>,
) {
  await db.runAsync(
    'UPDATE growth SET measured_at = ?, weight_g = ?, height_mm = ?, head_mm = ?, note = ? WHERE id = ?',
    g.measuredAt,
    g.weightG,
    g.heightMm,
    g.headMm,
    g.note,
    id,
  );
}

export async function deleteGrowth(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM growth WHERE id = ?', id);
}

/* ------------------------------------------------------------ milestones */

export async function listMilestones(db: SQLiteDatabase, babyId: number): Promise<Milestone[]> {
  const rows = await db.getAllAsync<{
    id: number;
    baby_id: number;
    key: string;
    achieved_at: number;
    note: string | null;
  }>('SELECT * FROM milestone WHERE baby_id = ? ORDER BY achieved_at DESC', babyId);
  return rows.map((r) => ({
    id: r.id,
    babyId: r.baby_id,
    key: r.key,
    achievedAt: r.achieved_at,
    note: r.note,
  }));
}

export async function toggleMilestone(
  db: SQLiteDatabase,
  babyId: number,
  key: string,
  achievedAt: number | null,
) {
  if (achievedAt === null) {
    await db.runAsync('DELETE FROM milestone WHERE baby_id = ? AND key = ?', babyId, key);
    return;
  }
  await db.runAsync(
    `INSERT INTO milestone (baby_id, key, achieved_at) VALUES (?,?,?)
     ON CONFLICT(baby_id, key) DO UPDATE SET achieved_at = excluded.achieved_at`,
    babyId,
    key,
    achievedAt,
  );
}

/* ----------------------------------------------------------- danger zone */

export async function wipeAll(db: SQLiteDatabase) {
  await db.execAsync('DELETE FROM entry; DELETE FROM growth; DELETE FROM milestone; DELETE FROM baby;');
}
