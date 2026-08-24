import { getLocales } from 'expo-localization';
import { ja, type Dictionary } from './ja';
import { en } from './en';

export type Language = 'ja' | 'en';

export const dictionaries: Record<Language, Dictionary> = { ja, en };

/** Device language, used only as the onboarding default. */
export function deviceLanguage(): Language {
  return getLocales()[0]?.languageCode === 'en' ? 'en' : 'ja';
}

/**
 * `1時間20分` / `1h 20m`. Durations appear all over the summary, so the two
 * languages' very different shapes are handled once, here.
 */
export function formatDuration(seconds: number, lang: Language, t: Dictionary): string {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);

  if (lang === 'ja') {
    if (h > 0) return m > 0 ? `${h}${t.units.hour}${m}${t.units.minute}` : `${h}${t.units.hour}`;
    return `${m}${t.units.minute}`;
  }
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
}

/**
 * The duration split into a value and its unit, so the summary card can set
 * them at different sizes — `5h 20m` with small units, as in the design.
 */
export function durationParts(seconds: number, lang: Language, t: Dictionary) {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const parts: { value: string; unit: string }[] = [];
  if (h > 0) parts.push({ value: String(h), unit: lang === 'ja' ? t.units.hour : 'h' });
  parts.push({ value: String(m), unit: lang === 'ja' ? t.units.minute : 'm' });
  return parts;
}

export type { Dictionary };
