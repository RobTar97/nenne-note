import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { timings } from '@/design/motion';
import { color, radius, space } from '@/design/tokens';
import { CheckIcon } from '@/icons';
import { Press } from './Press';
import { Txt } from './Txt';

/**
 * A selectable option tile — the Pee / Poop / Both row in the mockups.
 *
 * The selected ring is a separate absolutely-positioned border whose opacity
 * animates, rather than an animated `borderColor` on the tile itself. Same
 * result on screen, but opacity is free and a border colour is a paint every
 * frame. The check badge grows from 0.86 rather than from nothing, because
 * nothing in the real world appears from zero size.
 */
export function ChoiceCard({
  label,
  icon,
  selected,
  onPress,
  onHaptic,
}: {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onPress: () => void;
  onHaptic?: () => void;
}) {
  const p = useDerivedValue(
    () => withTiming(selected ? 1 : 0, timings.micro),
    [selected],
  );

  const ring = useAnimatedStyle(() => ({ opacity: p.get() }));
  const badge = useAnimatedStyle(() => ({
    opacity: p.get(),
    transform: [{ scale: 0.86 + p.get() * 0.14 }],
  }));

  return (
    <Press
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      onHaptic={selected ? undefined : onHaptic}
      style={styles.wrap}
    >
      <View style={styles.tile}>
        <Animated.View pointerEvents="none" style={[styles.ring, ring]} />
        <View style={styles.icon}>{icon}</View>
        <Txt variant="label" color={selected ? color.ink : color.inkMuted}>
          {label}
        </Txt>
      </View>

      <Animated.View pointerEvents="none" style={[styles.badge, badge]}>
        <CheckIcon size={15} color={color.onFill} penWidth={2.2} />
      </Animated.View>
    </Press>
  );
}

const BADGE = 28;

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    // Room for the badge to overhang the tile's top-right corner.
    paddingTop: BADGE / 2,
    paddingRight: BADGE / 2,
  },
  tile: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    paddingVertical: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.lg,
    borderWidth: 1.6,
    borderColor: color.ink,
  },
  icon: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    backgroundColor: color.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
