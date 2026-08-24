import React, { useCallback, useRef, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { timings } from '@/design/motion';
import { color, radius, space } from '@/design/tokens';
import { Press } from './Press';
import { Txt } from './Txt';

export type PillOption<T extends string> = {
  value: T;
  label: string;
  icon?: (active: boolean) => React.ReactNode;
};

type Rect = { x: number; width: number };

/**
 * The filter row on Today.
 *
 * The black indicator is one absolutely-positioned, childless view that slides
 * and resizes between the pills. Animating `width` is normally forbidden — it
 * re-runs layout for the node and its siblings every frame — but an absolutely
 * positioned element with no children is out of flow, so nothing else
 * re-lays-out, and it keeps the true pill radius that an X-scale would smear.
 */
export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  onHaptic,
}: {
  options: PillOption<T>[];
  value: T;
  onChange: (v: T) => void;
  onHaptic?: () => void;
}) {
  const [rects, setRects] = useState<Record<string, Rect>>({});
  const measured = useRef<Record<string, Rect>>({});

  const onPillLayout = useCallback((key: string) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    const prev = measured.current[key];
    if (prev && Math.abs(prev.x - x) < 0.5 && Math.abs(prev.width - width) < 0.5) return;
    measured.current = { ...measured.current, [key]: { x, width } };
    setRects(measured.current);
  }, []);

  const active = rects[value];
  const ready = !!active;

  const x = useDerivedValue(
    () => withTiming(active?.x ?? 0, timings.smallInOut),
    [active?.x],
  );
  const w = useDerivedValue(
    () => withTiming(active?.width ?? 0, timings.smallInOut),
    [active?.width],
  );

  const indicator = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }],
    width: w.get(),
  }));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <View>
        {ready ? <Animated.View pointerEvents="none" style={[styles.indicator, indicator]} /> : null}
        <View style={styles.pills}>
          {options.map((o) => {
            const selected = o.value === value;
            return (
              <Press
                key={o.value}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                accessibilityLabel={o.label}
                onLayout={onPillLayout(o.value)}
                onHaptic={selected ? undefined : onHaptic}
                onPress={() => onChange(o.value)}
                scale={0.95}
                style={[styles.pill, selected ? styles.pillOn : null]}
              >
                {o.icon ? <View style={styles.icon}>{o.icon(selected)}</View> : null}
                <Txt variant="label" color={selected ? color.onFill : color.inkMuted}>
                  {o.label}
                </Txt>
              </Press>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: space.lg,
    paddingVertical: space.xs,
  },
  pills: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    minHeight: 44,
    borderRadius: radius.pill,
    // The border is always present and only changes colour: toggling
    // `borderWidth` would resize the pill, and the indicator measures it.
    borderWidth: 1.4,
    borderColor: color.hairline,
  },
  pillOn: {
    borderColor: 'transparent',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: radius.pill,
    backgroundColor: color.fill,
  },
  icon: {
    marginLeft: -2,
  },
});
