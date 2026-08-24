import { useEffect } from 'react';
import {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

/**
 * An authored timeline: one linear clock that every element reads from.
 *
 * The alternative — a pile of independent `delay(...)` entrances — works, but
 * each one owns its own truth about when it starts, so retiming the sequence
 * means editing every element and nothing can be replayed or jumped to the end
 * as a whole.
 *
 * With a single clock in milliseconds, each element declares the window it
 * cares about, the whole cascade can be re-timed in one place, and reduced
 * motion is expressed exactly as it should be: jump the clock to the end, so
 * every element is already in its final state on the first frame.
 */
export function useTimeline(durationMs: number, replayKey: unknown = 0) {
  const reduced = useReducedMotion();
  const clock = useSharedValue(reduced ? durationMs : 0);

  useEffect(() => {
    cancelAnimation(clock);
    if (reduced) {
      clock.set(durationMs);
      return;
    }
    clock.set(0);
    // Linear on purpose: the clock is time itself. Each cue applies its own
    // easing to its own window, which is what lets one element ease out while
    // another further along the timeline is still easing in.
    clock.set(withTiming(durationMs, { duration: durationMs, easing: Easing.linear }));
  }, [durationMs, reduced, replayKey, clock]);

  return clock;
}

/** Strong ease-out, as a worklet-callable function for use inside a cue. */
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1).factory();

/**
 * Progress through one element's window on the timeline, eased.
 *
 * `cue(t, 200, 480)` is 0 before 200ms, 1 after 480ms, and eased in between.
 */
export function cue(t: number, from: number, to: number) {
  'worklet';
  return EASE_OUT(interpolate(t, [from, to], [0, 1], Extrapolation.CLAMP));
}
