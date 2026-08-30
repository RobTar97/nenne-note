import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { STAGGER, timings } from '@/design/motion';
import { color, radius, space } from '@/design/tokens';
import { Txt } from './Txt';

export type Bar = { label: string; value: number; emphasis?: boolean };

/**
 * A small monochrome bar chart.
 *
 * Bars are absolutely positioned inside fixed-height columns, so animating
 * their height costs no layout pass for their siblings — the one case where
 * animating a size instead of a transform is the right call, because a scaled
 * bar would smear its rounded cap.
 *
 * Each bar is delayed by its index. The stagger is 45ms and the whole sequence
 * is capped, because a chart that takes a second to assemble reads as slow, not
 * as considered.
 */
export function BarChart({
  bars,
  height = 132,
  formatValue,
  accessibilityLabel,
}: {
  bars: Bar[];
  height?: number;
  formatValue?: (v: number) => string;
  accessibilityLabel?: string;
}) {
  // The real peak is what the scale label reports; the divisor is clamped so a
  // week with no data still lays out instead of dividing by zero.
  const peak = Math.max(...bars.map((b) => b.value), 0);
  const max = Math.max(peak, 1);
  // Never let the stagger run past ~450ms however many days are shown.
  const step = Math.min(STAGGER, 450 / Math.max(1, bars.length));

  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      {formatValue && peak > 0 ? (
        <View style={styles.scaleRow}>
          <Txt variant="caption">{formatValue(peak)}</Txt>
        </View>
      ) : null}

      <View style={[styles.plot, { height }]}>
        {bars.map((b, i) => (
          <Column
            key={`${b.label}-${i}`}
            bar={b}
            ratio={b.value / max}
            delay={i * step}
            height={height}
          />
        ))}
      </View>

      <View style={styles.labels}>
        {bars.map((b, i) => (
          <View key={`${b.label}-${i}-l`} style={styles.labelCell}>
            {/* On a 30-day range there is no room for every date. */}
            {bars.length <= 10 || i % 5 === 0 || i === bars.length - 1 ? (
              <Txt variant="caption" center numberOfLines={1}>
                {b.label}
              </Txt>
            ) : null}
          </View>
        ))}
      </View>

    </View>
  );
}

function Column({
  bar,
  ratio,
  delay,
  height,
}: {
  bar: Bar;
  ratio: number;
  delay: number;
  height: number;
}) {
  const reduced = useReducedMotion();
  const target = Math.max(ratio > 0 ? 4 : 2, ratio * height);

  const h = useDerivedValue(
    () => (reduced ? target : withDelay(delay, withTiming(target, timings.medium))),
    [target, delay, reduced],
  );

  const style = useAnimatedStyle(() => ({ height: h.get() }));

  return (
    <View style={styles.column}>
      <Animated.View
        style={[styles.bar, bar.emphasis ? styles.barOn : null, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  column: {
    flex: 1,
    height: '100%',
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 2,
    borderTopLeftRadius: radius.xs,
    borderTopRightRadius: radius.xs,
    backgroundColor: color.inkFaint,
  },
  barOn: {
    backgroundColor: color.ink,
  },
  labels: {
    flexDirection: 'row',
    gap: 3,
    marginTop: space.sm,
  },
  labelCell: {
    flex: 1,
  },
  scaleRow: {
    alignItems: 'flex-end',
    marginBottom: space.xs,
  },
});
