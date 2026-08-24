import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { ease } from '@/design/motion';
import { color } from '@/design/tokens';
import { circumference } from '@/icons/geometry';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * The sleep ring on the daily summary.
 *
 * It draws itself once on mount: the sweep is explanatory — it shows the
 * proportion of the day accounted for, which a static arc states but doesn't
 * demonstrate. This screen is opened occasionally rather than dozens of times a
 * day, which is what buys the 620ms; it would be wrong on the home screen.
 *
 * The stroke is driven through `useAnimatedProps` so the sweep runs on the UI
 * thread and keeps going while the summary's queries are still resolving.
 */
export function Ring({
  size = 104,
  width = 5.5,
  progress,
  children,
}: {
  size?: number;
  width?: number;
  /** 0–1. Values above 1 are clamped; a 26-hour day isn't a thing. */
  progress: number;
  children?: React.ReactNode;
}) {
  const r = (size - width) / 2;
  const c = circumference(r);
  const target = Math.max(0, Math.min(1, progress));

  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? target : 0);

  useEffect(() => {
    p.set(reduced ? target : withTiming(target, { duration: 620, easing: ease.out }));
  }, [target, reduced, p]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c * (1 - p.get()),
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color.sunken}
          strokeWidth={width}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color.ink}
          strokeWidth={width}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          animatedProps={animatedProps}
          // SVG angles start at 3 o'clock; the ring has to start at the top.
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children ? <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
