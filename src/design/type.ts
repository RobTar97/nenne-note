import { TextStyle } from 'react-native';
import { color } from './tokens';

/**
 * Zen Maru Gothic — a rounded Japanese gothic that carries the hand-drawn
 * warmth of the mockups through kana, kanji and Latin numerals in one family,
 * so times ("7:35") and labels ("おむつ") never look like two typefaces.
 *
 * Embedded natively via the expo-font config plugin in app.json; the family
 * name is the font file's basename.
 */
export const font = {
  regular: 'ZenMaruGothic_400Regular',
  medium: 'ZenMaruGothic_500Medium',
  bold: 'ZenMaruGothic_700Bold',
} as const;

/**
 * Tracking is size-specific, never one value for everything: large Latin
 * numerals tighten as they grow, Japanese text sits at 0 (kana are already
 * optically tight), and small text opens up slightly for legibility.
 *
 * Leading is generous — Japanese needs more room than Latin at the same size.
 */
export const text = {
  /** Baby name on the home hero. */
  display: {
    fontFamily: font.bold,
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.6,
    color: color.ink,
  },
  /** Screen titles: 「ねんねノート」「きょう」 */
  title: {
    fontFamily: font.bold,
    fontSize: 26,
    lineHeight: 34,
    letterSpacing: -0.2,
    color: color.ink,
  },
  /** Card headings: 「おむつ」「ミルク」 */
  heading: {
    fontFamily: font.bold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0,
    color: color.ink,
  },
  /** The headline number on a card: a time, a count, a duration. */
  metric: {
    fontFamily: font.bold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.4,
    color: color.ink,
  },
  /** Smaller metric, used where two sit side by side. */
  metricSm: {
    fontFamily: font.bold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    color: color.ink,
  },
  /** Default running text. */
  body: {
    fontFamily: font.regular,
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0,
    color: color.ink,
  },
  /** Form/section labels and button text. */
  label: {
    fontFamily: font.medium,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
    color: color.ink,
  },
  /** Supporting text under a value: 「ひだり・120ml」 */
  support: {
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
    color: color.inkMuted,
  },
  /** Units, timestamps, and the smallest labels. */
  caption: {
    fontFamily: font.regular,
    fontSize: 13,
    lineHeight: 19,
    letterSpacing: 0.2,
    color: color.inkMuted,
  },
  /** Primary CTA. */
  button: {
    fontFamily: font.bold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
    color: color.onFill,
  },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof text;
