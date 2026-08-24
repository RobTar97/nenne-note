/**
 * Design tokens for ねんねノート.
 *
 * The whole app is strictly monochrome — the personality comes from line-art
 * illustration, generous whitespace and motion, never from colour. Every value
 * below is read off the reference mockups in `design/screens/`.
 */

export const color = {
  /** Page background — a warm-neutral off-white, never pure #FFF. */
  bg: '#F4F4F4',
  /** Raised card surface. */
  surface: '#FFFFFF',
  /** Card surface used when a card sits on white (Today rows). */
  surfaceAlt: '#FAFAFA',
  /** Recessed fills: icon medallions, segmented-control track, inputs. */
  sunken: '#EFEFEF',
  /** Slightly deeper sunken, for pressed recessed surfaces. */
  sunkenPressed: '#E8E8E8',

  /** Primary text and line-art strokes. */
  ink: '#161616',
  /** Secondary text: labels, units, supporting values. */
  inkMuted: '#8E8E8E',
  /** Tertiary text: placeholders, disabled, timeline dots. */
  inkFaint: '#BEBEBE',
  /** Hairlines and dashed dividers. */
  hairline: '#E6E6E6',

  /** Filled black elements: primary CTA, selected pill. */
  fill: '#161616',
  fillPressed: '#000000',
  /** Text/strokes on top of `fill`. */
  onFill: '#FFFFFF',

  /** Scrim behind modals. */
  scrim: 'rgba(20,20,20,0.28)',
} as const;

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  pill: 999,
} as const;

/** 4pt base scale. Layout spacing only ever comes from here. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

/**
 * Shadows are deliberately barely-there. On Android we avoid animating
 * elevation (it re-renders the shadow every frame) — see `src/design/motion.ts`.
 */
export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#000000',
    shadowOpacity: 0.09,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  none: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
} as const;

/** Line-art stroke weights, matched to the mockup illustrations. */
export const stroke = {
  hairline: 1.25,
  regular: 1.75,
  bold: 2.25,
} as const;

/** Minimum touch target. Anything smaller gets hitSlop, never a bigger visual. */
export const HIT_TARGET = 48;

export const hitSlop = (visual: number) => {
  const pad = Math.max(0, (HIT_TARGET - visual) / 2);
  return { top: pad, bottom: pad, left: pad, right: pad };
};
