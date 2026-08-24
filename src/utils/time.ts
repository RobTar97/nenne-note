import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns';

export const MINUTE = 60_000;
export const HOUR = 3_600_000;
export const DAY = 86_400_000;

/** Local midnight for the day containing `ts`. */
export const dayStart = (ts: number) => startOfDay(ts).getTime();
export const dayEnd = (ts: number) => addDays(startOfDay(ts), 1).getTime();

/** Stable `YYYY-MM-DD` key in *local* time — never `toISOString`, which is UTC. */
export function dayKey(ts: number) {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function parseDayKey(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

/** 24-hour clock, e.g. `07:35`. The whole app is 24h. */
export function formatClock(ts: number) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Age in whole days, counted by calendar day so it ticks over at midnight. */
export const ageInDays = (birthdayKey: string, now = Date.now()) =>
  Math.max(0, differenceInCalendarDays(now, parseDayKey(birthdayKey)));

/** Overlap in ms between [aStart,aEnd) and [bStart,bEnd). */
export const overlap = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));

/** `1h 20m`, `45m`, `2h`. Unit suffixes are localised by the caller. */
export function splitDuration(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

/** `07:12` style stopwatch readout for a live timer. */
export function formatStopwatch(seconds: number) {
  const { h, m, s } = splitDuration(seconds);
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
