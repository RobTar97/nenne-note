import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { color as palette } from '@/design/tokens';
import { ease } from '@/design/motion';
import { STROKE_BASE } from './types';

/**
 * The bear peeking over a ledge — the app's signature illustration.
 *
 * Authored in a 132x92 grid. The head, ears and paws are geometrically derived
 * (arc endpoints are the real circle-circle intersections) so the silhouette
 * stays clean at any size instead of showing the seams a freehand trace leaves.
 *
 * `alive` gives it an idle life: it breathes, and every few seconds it opens
 * its eyes and peeks before settling back. See `useIdleLife` for why that is
 * the specific behaviour chosen, and why the hearts deliberately stay still.
 */

const HEART_D =
  'M12 20.6S3.4 15.3 3.4 9.7a4.7 4.7 0 0 1 8.6-2.7 4.7 4.7 0 0 1 8.6 2.7c0 5.6-8.6 10.9-8.6 10.9Z';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Heart placements in the 132-unit grid: centre x, centre y, width, rest opacity. */
const HEARTS = [
  { x: 112, y: 20, w: 13, opacity: 0.9 },
  { x: 100.5, y: 32.5, w: 9, opacity: 0.55 },
  { x: 120, y: 34, w: 7, opacity: 0.35 },
] as const;

export type BearMood = 'happy' | 'awake';

export type PeekBearProps = {
  /** Rendered width in px; height follows the 132:92 aspect ratio. */
  width?: number;
  color?: string;
  /** `happy` = closed arch eyes (default), `awake` = open round eyes. */
  eyes?: BearMood;
  /** Floating hearts to the upper right. */
  hearts?: boolean;
  /** Real-world pen width in px, before the viewBox scale is divided out. */
  penWidth?: number;
  /**
   * Breathe, and peek every few seconds. Off by default: most placements are
   * decoration on a screen that is doing something else, and a character
   * moving in the corner of a screen you are trying to read is noise.
   */
  alive?: boolean;
  /** Bumped to make the bear react — the hearts lift and fade. */
  celebration?: number;
  /** Tapping makes it peek. Only wired up where `alive` is set. */
  pressable?: boolean;
};

/**
 * The idle behaviour.
 *
 * Two things, both on the character itself:
 *
 * - **Breathing.** A 1.4% scale pinned to the ledge, so the bear rises and
 *   settles but the line it leans on stays put.
 * - **Peeking.** Every 4–8s it opens its eyes, looks, and closes them again.
 *   The interval is randomised because a mascot on an exact metronome stops
 *   reading as alive and starts reading as a loading spinner.
 *
 * The hearts stay still. They sit in the upper right of the home screen, which
 * is opened dozens of times a day, and something drifting in the corner of your
 * eye every single time is the kind of motion people end up resenting. They
 * move once, when there is something to celebrate.
 */
function useIdleLife(alive: boolean, celebration: number) {
  const reduced = useReducedMotion();
  const breath = useSharedValue(0);
  const peek = useSharedValue(0);
  const pop = useSharedValue(0);
  const firstCelebration = useRef(true);

  useEffect(() => {
    if (!alive || reduced) return;
    breath.set(
      withRepeat(
        // Sinusoidal, not the app's usual ease-out: this is a physical
        // oscillation rather than something entering or leaving the screen.
        withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
    return () => cancelAnimation(breath);
  }, [alive, reduced, breath]);

  useEffect(() => {
    if (!alive || reduced) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      timer = setTimeout(
        () => {
          if (cancelled) return;
          peek.set(
            withSequence(
              withTiming(1, { duration: 150, easing: ease.out }),
              withDelay(820, withTiming(0, { duration: 190, easing: ease.out })),
            ),
          );
          schedule();
        },
        4000 + Math.random() * 4000,
      );
    };

    schedule();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      cancelAnimation(peek);
    };
  }, [alive, reduced, peek]);

  useEffect(() => {
    if (firstCelebration.current) {
      firstCelebration.current = false;
      return;
    }
    if (reduced) return;
    pop.set(withSequence(withTiming(1, { duration: 260, easing: ease.out }), withTiming(0, { duration: 520 })));
  }, [celebration, reduced, pop]);

  return { breath, peek, pop, reduced };
}

export function PeekBear({
  width = 132,
  color = palette.ink,
  eyes = 'happy',
  hearts = true,
  penWidth = 1.9,
  alive = false,
  celebration = 0,
  pressable = false,
}: PeekBearProps) {
  const height = (width * 92) / 132;
  // Authored at 132 units wide; keep the pen a constant real-world width.
  const sw = (penWidth * 132) / width;
  const k = width / 132;

  const { breath, peek, pop, reduced } = useIdleLife(alive, celebration);

  // `awake` is a fixed open-eyed expression; `happy` rests closed and opens
  // only while peeking. One shared value drives the cross-fade either way.
  const openBase = eyes === 'awake' ? 1 : 0;

  const archProps = useAnimatedProps(() => ({
    opacity: openBase === 1 ? 0 : 1 - peek.get(),
  }));
  const dotProps = useAnimatedProps(() => ({
    opacity: openBase === 1 ? 1 : peek.get(),
  }));

  const breathing = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breath.get() * 0.014 }],
  }));

  const body = (
    <Animated.View
      style={[
        // Pinned to the ledge (74/92 of the height) so breathing lifts the bear
        // without the line it rests on drifting.
        alive && !reduced ? [styles.breathOrigin, breathing] : null,
      ]}
    >
      <Svg width={width} height={height} viewBox="0 0 132 92" fill="none">
        <G stroke={color} strokeWidth={sw} {...STROKE_BASE}>
          {/* ears — outer bumps, then the inner fold */}
          <Path d="M40.85 47.71A11 11 0 1 1 56.15 33.79" />
          <Path d="M43.09 43.47A6.2 6.2 0 1 1 51.73 35.63" />
          <Path d="M75.85 33.79A11 11 0 1 1 91.15 47.71" />
          <Path d="M80.27 35.63A6.2 6.2 0 1 1 88.91 43.47" />

          {/* head — a 28r circle cut off exactly where it meets the ledge */}
          <Path d="M41.75 74A28 28 0 1 1 90.25 74" />

          {/* the tuft */}
          <Path d="M67.6 32.3c.5-3.7 3.8-5.4 5.9-3.7 1.5 1.2.9 3.4-1.1 4" />

          {/* Both expressions are always mounted and cross-faded, so a blink is
              an opacity change on the UI thread rather than a re-render. */}
          <AnimatedPath d="M51 60c1.8-4 6.2-4 8 0" animatedProps={archProps} />
          <AnimatedPath d="M73 60c1.8-4 6.2-4 8 0" animatedProps={archProps} />
          <AnimatedCircle
            cx="55"
            cy="58.6"
            r="2.9"
            fill={color}
            strokeWidth={0}
            animatedProps={dotProps}
          />
          <AnimatedCircle
            cx="77"
            cy="58.6"
            r="2.9"
            fill={color}
            strokeWidth={0}
            animatedProps={dotProps}
          />

          {/* blush */}
          <Ellipse cx="47.6" cy="64.4" rx="4.4" ry="2.7" fill={color} opacity={0.16} strokeWidth={0} />
          <Ellipse cx="84.4" cy="64.4" rx="4.4" ry="2.7" fill={color} opacity={0.16} strokeWidth={0} />

          {/* muzzle */}
          <Ellipse cx="66" cy="64.6" rx="2.7" ry="1.95" fill={color} strokeWidth={0} />
          <Path d="M66 66.6v1" />
          <Path d="M62.1 68.4c1.7 1.6 3.4.9 3.9-1.3.5 2.2 2.2 2.9 3.9 1.3" />

          {/* paws resting on the ledge */}
          <Path d="M37.2 74.6a7.4 6.6 0 0 1 14.8 0Z" />
          <Path d="M80 74.6a7.4 6.6 0 0 1 14.8 0Z" />
          <G fill={color} strokeWidth={0}>
            <Circle cx="41.2" cy="71.6" r="0.95" />
            <Circle cx="44.6" cy="70.6" r="0.95" />
            <Circle cx="48" cy="71.6" r="0.95" />
            <Circle cx="84" cy="71.6" r="0.95" />
            <Circle cx="87.4" cy="70.6" r="0.95" />
            <Circle cx="90.8" cy="71.6" r="0.95" />
          </G>

          {/* the ledge */}
          <Path d="M18 74.6H114" />
        </G>
      </Svg>
    </Animated.View>
  );

  return (
    <View style={{ width, height }}>
      {pressable && alive ? (
        <Pressable
          accessibilityRole="image"
          onPress={() => {
            if (reduced) return;
            peek.set(
              withSequence(
                withTiming(1, { duration: 130, easing: ease.out }),
                withDelay(900, withTiming(0, { duration: 190, easing: ease.out })),
              ),
            );
          }}
        >
          {body}
        </Pressable>
      ) : (
        body
      )}

      {/* Hearts live outside the SVG so each one is a plain View transform —
          the cheapest thing to animate, and no SVG prop interpolation. */}
      {hearts
        ? HEARTS.map((h, i) => (
            <FloatingHeart
              key={i}
              color={color}
              pop={pop}
              index={i}
              rest={h.opacity}
              size={h.w * k}
              left={h.x * k - (h.w * k) / 2}
              top={h.y * k - (h.w * k) / 2}
            />
          ))
        : null}
    </View>
  );
}

/**
 * One heart. Still at rest; lifts and fades when the bear has something to be
 * pleased about, each one a little later than the last.
 */
function FloatingHeart({
  color,
  pop,
  index,
  rest,
  size,
  left,
  top,
}: {
  color: string;
  pop: SharedValue<number>;
  index: number;
  rest: number;
  size: number;
  left: number;
  top: number;
}) {
  const style = useAnimatedStyle(() => {
    // Each heart trails the one before it, so the group reads as a rising
    // cluster rather than three things moving in lockstep.
    const p = Math.max(0, Math.min(1, pop.get() * 1.4 - index * 0.18));
    return {
      opacity: rest + p * (1 - rest) * 0.9,
      transform: [{ translateY: -p * (6 + index * 3) }, { scale: 1 + p * 0.22 }],
    };
  });

  return (
    <Animated.View style={[styles.heart, { left, top, width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={HEART_D} fill={color} />
      </Svg>
    </Animated.View>
  );
}

/**
 * A tiny version with no hearts, used as a footer flourish.
 * Same drawing, fewer parts — never a second, subtly different bear.
 */
export function PeekBearMini({ width = 88, color = palette.ink }: { width?: number; color?: string }) {
  return <PeekBear width={width} color={color} hearts={false} penWidth={1.7} />;
}

const styles = StyleSheet.create({
  breathOrigin: {
    transformOrigin: 'center 80%',
  },
  heart: {
    position: 'absolute',
  },
});
