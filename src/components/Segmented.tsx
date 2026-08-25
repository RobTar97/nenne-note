import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { timings } from '@/design/motion';
import { HIT_TARGET, color, radius, shadow, space } from '@/design/tokens';
import { Press } from './Press';
import { Txt } from './Txt';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  icon?: React.ReactNode;
};

/**
 * The type selector at the top of the quick-log sheet.
 *
 * The thumb slides rather than cutting, because the movement is the only thing
 * that tells you the three options are one control. It's a selection change a
 * parent makes a couple of dozen times a day, so it's kept to 160ms — long
 * enough to read as connected, short enough never to be in the way.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  onHaptic,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  onHaptic?: () => void;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const cellWidth = trackWidth > 0 ? (trackWidth - PAD * 2) / options.length : 0;

  const x = useDerivedValue(
    () => withTiming(index * cellWidth, timings.microInOut),
    [index, cellWidth],
  );

  const thumb = useAnimatedStyle(() => ({
    width: cellWidth,
    transform: [{ translateX: x.get() }],
  }));

  const onLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.track} onLayout={onLayout}>
      {cellWidth > 0 ? <Animated.View style={[styles.thumb, thumb]} /> : null}
      {options.map((o, i) => {
        const selected = o.value === value;
        return (
          <React.Fragment key={o.value}>
            {i > 0 ? <View style={[styles.divider, selected || options[i - 1].value === value ? styles.dividerHidden : null]} /> : null}
            <Press
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={o.label}
              scale={0.96}
              style={styles.cell}
              onHaptic={selected ? undefined : onHaptic}
              onPress={() => onChange(o.value)}
            >
              {o.icon ? <View style={styles.icon}>{o.icon}</View> : null}
              <Txt variant="label" color={selected ? color.ink : color.inkMuted}>
                {o.label}
              </Txt>
            </Press>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const PAD = 6;

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: color.sunken,
    borderRadius: radius.lg,
    padding: PAD,
  },
  thumb: {
    position: 'absolute',
    left: PAD,
    top: PAD,
    bottom: PAD,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    ...shadow.card,
  },
  cell: {
    flex: 1,
    minHeight: HIT_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.md,
    gap: space.xs,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    marginVertical: space.md,
    backgroundColor: color.hairline,
  },
  dividerHidden: {
    backgroundColor: 'transparent',
  },
  icon: {
    marginBottom: 2,
  },
});
