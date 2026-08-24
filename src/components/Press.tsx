import React, { useCallback } from 'react';
import { Pressable, type PressableProps, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { PRESS_SCALE, timings } from '@/design/motion';
import { HIT_TARGET } from '@/design/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PressProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** How far it compresses. Large surfaces need less to read as pressed. */
  scale?: number;
  /** Fires on press-*in*, at the causal moment — never after the animation. */
  onHaptic?: () => void;
  children?: React.ReactNode;
};

/**
 * The app's only pressable.
 *
 * Feedback happens on press-in and commit on press-out, because waiting for the
 * tap to complete before showing anything is the latency users actually feel.
 * The scale runs on a shared value rather than React state, so pressing
 * something never costs a re-render.
 *
 * `pressRetentionOffset` is generous on purpose: a thumb drifting a few pixels
 * on a moving bus should not cancel a press the parent meant to make.
 *
 * A press is normally the textbook case for a declarative CSS transition driven
 * by `useState`, and that would be the cheaper tool. This one uses a shared
 * value on purpose: `Press` wraps whole cards, and two React renders per press
 * would re-render the card's entire subtree — icons, SVG paths and all — twice
 * for every tap. The shared value costs zero renders, which matters more here
 * than the extra worklet costs.
 */
export function Press({
  style,
  scale = PRESS_SCALE,
  onHaptic,
  onPressIn,
  onPressOut,
  disabled,
  children,
  ...rest
}: PressProps) {
  const s = useSharedValue(1);

  const animated = useAnimatedStyle(() => ({ transform: [{ scale: s.get() }] }));

  const handleIn = useCallback<NonNullable<PressableProps['onPressIn']>>(
    (e) => {
      s.set(withTiming(scale, timings.press));
      onHaptic?.();
      onPressIn?.(e);
    },
    [onHaptic, onPressIn, s, scale],
  );

  const handleOut = useCallback<NonNullable<PressableProps['onPressOut']>>(
    (e) => {
      s.set(withTiming(1, timings.press));
      onPressOut?.(e);
    },
    [onPressOut, s],
  );

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={handleIn}
      onPressOut={handleOut}
      pressRetentionOffset={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={[style, animated, disabled ? { opacity: 0.4 } : null]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

/** A square icon button that keeps a 48pt target however small the glyph is. */
export function IconButton({
  size = 44,
  children,
  style,
  ...rest
}: PressProps & { size?: number }) {
  const pad = Math.max(0, (HIT_TARGET - size) / 2);
  return (
    <Press
      hitSlop={{ top: pad, bottom: pad, left: pad, right: pad }}
      style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}
      {...rest}
    >
      {children}
    </Press>
  );
}
