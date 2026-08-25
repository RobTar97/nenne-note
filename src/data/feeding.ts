/**
 * Typical ranges by age, for orientation only.
 *
 * These are the broad public-health ranges that appear consistently across WHO,
 * AAP and NHS infant-feeding guidance, and the National Sleep Foundation's
 * age-based sleep recommendations. They are population ranges, not targets.
 *
 * Three rules govern how this data may be used in the UI, and they are not
 * negotiable:
 *
 * 1. **Never compare a specific baby against these numbers.** The app must not
 *    say "below average", "behind", "not enough" or anything a tired parent
 *    could read as a diagnosis. Show the range; let them draw their own
 *    conclusions.
 * 2. **Always show it as a range, never a single number.** A single number
 *    reads as a target to hit.
 * 3. **Always pair it with the disclaimer** (`t.guidance.disclaimer`), which
 *    points at a healthcare professional.
 *
 * A baby log is read at 3am by someone exhausted and anxious. Anything that
 * could be mistaken for a verdict on their child does more harm than the
 * information is worth.
 */

export type AgeBand = {
  /** Inclusive lower bound in days. */
  fromDays: number;
  /** Feeds per 24 hours. */
  feeds: [number, number];
  /** Typical gap between the start of one feed and the next, in hours. */
  gapHours: [number, number];
  /** Total sleep per 24 hours, in hours. */
  sleepHours: [number, number];
  /** Wet nappies per 24 hours. */
  wetNappies: [number, number];
  /** Whether solid food is typically part of the picture at this age. */
  solids: boolean;
  ja: string;
  en: string;
};

/** Ordered oldest-last; `bandFor` walks backwards to find the match. */
export const AGE_BANDS: AgeBand[] = [
  {
    fromDays: 0,
    feeds: [8, 12],
    gapHours: [2, 3],
    sleepHours: [14, 17],
    wetNappies: [6, 8],
    solids: false,
    ja: '生後1か月まで',
    en: 'Up to 1 month',
  },
  {
    fromDays: 30,
    feeds: [7, 9],
    gapHours: [2.5, 4],
    sleepHours: [14, 17],
    wetNappies: [5, 7],
    solids: false,
    ja: '1〜3か月ごろ',
    en: 'Around 1–3 months',
  },
  {
    fromDays: 90,
    feeds: [5, 7],
    gapHours: [3, 4],
    sleepHours: [12, 15],
    wetNappies: [5, 7],
    solids: false,
    ja: '3〜6か月ごろ',
    en: 'Around 3–6 months',
  },
  {
    fromDays: 180,
    feeds: [4, 6],
    gapHours: [3, 5],
    sleepHours: [12, 15],
    wetNappies: [4, 6],
    solids: true,
    ja: '6〜12か月ごろ',
    en: 'Around 6–12 months',
  },
  {
    fromDays: 365,
    feeds: [2, 4],
    gapHours: [4, 6],
    sleepHours: [11, 14],
    wetNappies: [4, 6],
    solids: true,
    ja: '1歳ごろから',
    en: 'From around 1 year',
  },
];

export function bandFor(ageDays: number): AgeBand {
  let match = AGE_BANDS[0];
  for (const band of AGE_BANDS) {
    if (ageDays >= band.fromDays) match = band;
  }
  return match;
}

/**
 * A sensible default for the feed reminder, from the middle of the age band's
 * typical gap, rounded to one of the intervals the settings screen offers.
 */
export function suggestedReminderMin(ageDays: number, options: readonly number[]): number {
  const band = bandFor(ageDays);
  const midHours = (band.gapHours[0] + band.gapHours[1]) / 2;
  const target = midHours * 60;
  return options.reduce((best, o) =>
    Math.abs(o - target) < Math.abs(best - target) ? o : best,
  );
}

/**
 * Where the sleep ring fills to.
 *
 * Age-aware rather than a fixed 16 hours: a one-year-old sleeping 12 hours has
 * had a full night, and a ring that reads three-quarters empty would be quietly
 * telling their parent otherwise. Uses the top of the band so a full ring means
 * "comfortably within the typical range" rather than "you hit the target".
 */
export const sleepRingTargetSec = (ageDays: number) => bandFor(ageDays).sleepHours[1] * 3600;

export const range = (r: [number, number]) =>
  r[0] === r[1] ? `${r[0]}` : `${fmt(r[0])}〜${fmt(r[1])}`;

export const rangeEn = (r: [number, number]) =>
  r[0] === r[1] ? `${r[0]}` : `${fmt(r[0])}–${fmt(r[1])}`;

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, ''));
