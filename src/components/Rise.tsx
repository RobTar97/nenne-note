import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { cue } from '@/design/timeline';

/**
 * One element's entrance on a timeline.
 *
 * Reads its window off a shared clock, so nothing here re-renders and the whole
 * cascade runs on the UI thread. Only `opacity` and `transform` move.
 */
export function Rise({
  clock,
  from,
  to,
  /** How far it travels up into place. */
  distance = 14,
  /** Optional scale-in. Never from 0 — nothing appears from nothing. */
  scaleFrom,
  style,
  children,
}: {
  clock: SharedValue<number>;
  from: number;
  to: number;
  distance?: number;
  scaleFrom?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const animated = useAnimatedStyle(() => {
    const p = cue(clock.get(), from, to);
    // Translate before scale: reversed, the offset would be scaled too.
    const transform: { translateY: number }[] | { translateY: number; scale?: number }[] = [
      { translateY: (1 - p) * distance },
    ];
    return {
      opacity: p,
      transform: scaleFrom
        ? [{ translateY: (1 - p) * distance }, { scale: scaleFrom + (1 - scaleFrom) * p }]
        : transform,
    };
  });

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}
