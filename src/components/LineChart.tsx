import React, { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { ease } from '@/design/motion';
import { color, space } from '@/design/tokens';
import { Txt } from './Txt';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export type Point = { x: number; y: number };

/**
 * A sparse line chart for growth measurements.
 *
 * Growth is logged weekly at best, so this is a handful of points rather than a
 * dense series: every one gets a visible dot, because with six readings the
 * individual measurements *are* the data — smoothing them into a curve would
 * imply readings that were never taken.
 *
 * The line draws itself once on mount. This screen is opened occasionally, not
 * dozens of times a day, which is what buys the animation at all.
 */
export function LineChart({
  points,
  height = 168,
  formatValue,
}: {
  /** Oldest first. `x` is a timestamp, `y` the measured value. */
  points: Point[];
  height?: number;
  formatValue: (v: number) => string;
}) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const reduced = useReducedMotion();
  const draw = useSharedValue(reduced ? 1 : 0);

  const PAD_Y = 14;
  const PAD_X = 6;

  const geometry = useMemo(() => {
    if (points.length === 0 || width <= 0) return null;

    const ys = points.map((p) => p.y);
    let min = Math.min(...ys);
    let max = Math.max(...ys);
    // A flat series would divide by zero; give it a band so the line sits mid-height.
    if (max - min < 1e-6) {
      min -= 1;
      max += 1;
    }

    const xs = points.map((p) => p.x);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const xSpan = xMax - xMin;

    const plotW = Math.max(1, width - PAD_X * 2);
    const plotH = Math.max(1, height - PAD_Y * 2);

    // Two readings on the same day — a morning and an evening weigh-in — have
    // no time span to scale by and would stack on a single x. Fall back to
    // spacing by index so both are visible and the order still reads correctly.
    const spread = xSpan === 0;

    const project = (p: Point, i: number) => ({
      x:
        PAD_X +
        (points.length === 1
          ? plotW / 2
          : spread
            ? (i / (points.length - 1)) * plotW
            : ((p.x - xMin) / xSpan) * plotW),
      // SVG y grows downward; the largest value belongs at the top.
      y: PAD_Y + (1 - (p.y - min) / (max - min)) * plotH,
    });

    const projected = points.map(project);
    const d = projected.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');

    let length = 0;
    for (let i = 1; i < projected.length; i++) {
      length += Math.hypot(projected[i].x - projected[i - 1].x, projected[i].y - projected[i - 1].y);
    }

    return { projected, d, length: Math.max(length, 1), min: Math.min(...ys), max: Math.max(...ys) };
  }, [points, width, height]);

  useEffect(() => {
    draw.set(reduced ? 1 : 0);
    if (reduced) return;
    draw.set(withTiming(1, { duration: 520, easing: ease.out }));
  }, [geometry?.d, reduced, draw]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: (geometry?.length ?? 1) * (1 - draw.get()),
  }));

  return (
    <View>
      <View style={styles.scaleRow}>
        <Txt variant="caption">{geometry ? formatValue(geometry.max) : ''}</Txt>
      </View>

      <View style={{ height }} onLayout={onLayout}>
        {geometry && width > 0 ? (
          <Svg width={width} height={height}>
            {points.length > 1 ? (
              <AnimatedPath
                d={geometry.d}
                stroke={color.ink}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                strokeDasharray={geometry.length}
                animatedProps={animatedProps}
              />
            ) : null}
            {geometry.projected.map((p, i) => (
              <Circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={i === geometry.projected.length - 1 ? 4.5 : 3}
                fill={i === geometry.projected.length - 1 ? color.ink : color.surface}
                stroke={color.ink}
                strokeWidth={2}
              />
            ))}
          </Svg>
        ) : null}
      </View>

      <View style={styles.scaleRow}>
        <Txt variant="caption">{geometry ? formatValue(geometry.min) : ''}</Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scaleRow: {
    alignItems: 'flex-end',
    marginVertical: space.xs,
  },
});
