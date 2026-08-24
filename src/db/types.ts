/** Domain types. Times are epoch milliseconds; the DB never stores strings for time. */

export type EntryKind = 'diaper' | 'feed' | 'sleep';

export type DiaperKind = 'pee' | 'poop' | 'both';
export type FeedKind = 'bottle' | 'breast' | 'solid';
export type Side = 'left' | 'right';

export type Baby = {
  id: number;
  name: string;
  /** Local calendar date, `YYYY-MM-DD`. Birthdays are dates, not instants. */
  birthday: string;
  createdAt: number;
};

export type Entry = {
  id: number;
  babyId: number;
  kind: EntryKind;
  startedAt: number;
  /** `null` while a sleep or nursing session is still running. */
  endedAt: number | null;
  note: string | null;

  diaperKind: DiaperKind | null;

  feedKind: FeedKind | null;
  /** Bottle volume in millilitres. */
  amountMl: number | null;
  /** Accumulated nursing seconds per side. */
  leftSec: number;
  rightSec: number;
  /** Which side is currently running, and since when. Both null when paused. */
  activeSide: Side | null;
  sideSince: number | null;

  createdAt: number;
  updatedAt: number;
};

export type Growth = {
  id: number;
  babyId: number;
  measuredAt: number;
  /** Grams, millimetres — integers, so no floating point drift in charts. */
  weightG: number | null;
  heightMm: number | null;
  headMm: number | null;
  note: string | null;
};

export type Milestone = {
  id: number;
  babyId: number;
  /** Stable key into the milestone catalogue, e.g. `first_smile`. */
  key: string;
  achievedAt: number;
  note: string | null;
};

/** How the app addresses the person using it, shown in the home greeting. */
export type Caregiver = 'mama' | 'papa' | 'none';

export type Settings = {
  language: 'ja' | 'en';
  caregiver: Caregiver;
  haptics: boolean;
  onboarded: boolean;
  /** Nudge when it has been `remindFeedMin` since the last feed. */
  remindFeed: boolean;
  remindFeedMin: number;
  /** Nudge when a sleep or nursing session has been running for hours. */
  remindTimer: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  language: 'ja',
  caregiver: 'mama',
  haptics: true,
  onboarded: false,
  // Both reminders are opt-in: they need notification permission, and asking
  // for it before the user has expressed any interest is the fastest way to
  // get permanently denied.
  remindFeed: false,
  remindFeedMin: 180,
  remindTimer: false,
};

/**
 * Feed-reminder intervals offered in settings, in minutes.
 *
 * Three, not five: they render as pills on one row, and "2時間30分" is wide
 * enough that five of them would scroll — a choice you have to scroll to see is
 * a choice most people never find.
 */
export const FEED_INTERVALS = [120, 180, 240] as const;

/** How long a session may run before the "did you forget?" nudge fires. */
export const TIMER_NUDGE_MIN = 240;

/** An entry that is still running — a live nursing or sleep session. */
export type RunningEntry = Entry & { endedAt: null };

export const isRunning = (e: Entry): e is RunningEntry => e.endedAt === null;
