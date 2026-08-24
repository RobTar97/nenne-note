import { Easing, ReduceMotion, WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

/**
 * Motion tokens.
 *
 * Rules this file encodes, so they can't drift screen to screen:
 *  - Never `ease-in` on UI. It delays the exact moment the user is watching.
 *  - Built-in easings are too weak; use these curves.
 *  - A finger was involved → spring (it carries velocity through an
 *    interruption). No finger → timing.
 *  - Bounce only when the gesture itself carried momentum.
 *  - Reduced motion ships with the animation, never as a follow-up.
 */

export const ease = {
  /** Strong ease-out. Entrances, exits, and every press. */
  out: Easing.bezier(0.23, 1, 0.32, 1),
  /** Strong ease-in-out. Something moving/morphing on screen. */
  inOut: Easing.bezier(0.77, 0, 0.175, 1),
  /** The iOS sheet curve. */
  sheet: Easing.bezier(0.32, 0.72, 0, 1),
  /** Constant motion only: progress fills, the running-timer ring. */
  linear: Easing.linear,
} as const;

export const duration = {
  /** Press-in / press-out feedback. */
  press: 120,
  /** Toggles, chips, selection states. */
  micro: 160,
  /** Small positional or opacity changes. */
  small: 200,
  /** Cards settling, cross-fades. */
  medium: 260,
  /** Sheets, modals. */
  sheet: 300,
  /** The one place we allow slow: a first-run or celebration moment. */
  delight: 520,
} as const;

/** Stagger between siblings entering together. Short — long feels slow. */
export const STAGGER = 45;

export function timing(ms: number, easing = ease.out): WithTimingConfig {
  return {
    duration: ms,
    easing,
    reduceMotion: ReduceMotion.System,
  };
}

/**
 * Ready-made timing configs, built once at module load.
 *
 * A worklet can capture a plain object from module scope, but *calling* a
 * helper from the UI runtime requires that helper to be a worklet too — and a
 * worklet cannot resolve a default parameter that points at another module's
 * export. Anything used inside `useDerivedValue` or a gesture handler therefore
 * reaches for one of these instead of calling `timing()`. It also saves an
 * object allocation on every frame the value is re-evaluated.
 */
export const timings = {
  press: timing(duration.press),
  micro: timing(duration.micro),
  microInOut: timing(duration.micro, ease.inOut),
  small: timing(duration.small),
  smallInOut: timing(duration.small, ease.inOut),
  medium: timing(duration.medium),
} as const;

/**
 * Springs use Apple's two designer parameters (perceptual duration + damping
 * ratio) rather than mass/stiffness/damping — far easier to reason about, and
 * the values below come straight from Apple's shipped interactions.
 */
export const spring = {
  /** Default settle. Critically damped: graceful, no overshoot. */
  settle: {
    duration: 400,
    dampingRatio: 1,
    reduceMotion: ReduceMotion.System,
  },
  /** Snap back after a drag — the gesture carried momentum, so a little bounce. */
  snap: {
    duration: 400,
    dampingRatio: 0.8,
    reduceMotion: ReduceMotion.System,
  },
  /** Sheets and drawers. */
  sheet: {
    duration: 300,
    dampingRatio: 0.8,
    reduceMotion: ReduceMotion.System,
  },
  /** Must not cross a hard edge (a ring that can't exceed 100%). */
  clamped: {
    duration: 400,
    dampingRatio: 1,
    overshootClamping: true,
    reduceMotion: ReduceMotion.System,
  },
} satisfies Record<string, WithSpringConfig>;

/** Press feedback: subtle enough to feel physical, never rubbery. */
export const PRESS_SCALE = 0.97;
/** Larger targets need less scale to read as pressed. */
export const PRESS_SCALE_LARGE = 0.985;

/**
 * iOS-style momentum projection. Given a release velocity, where would the
 * element come to rest? Snap to the target nearest *that* point, not nearest
 * the release point — this is what makes a flick feel like a throw.
 */
export function projectDecay(velocity: number, decelerationRate = 0.998) {
  'worklet';
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Progressive resistance past a boundary, instead of a hard stop. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  'worklet';
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}
