import React, { useCallback, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

import { color, radius, shadow, space } from '@/design/tokens';
import { ChevronRightIcon } from '@/icons';
import { Press } from './Press';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

type ScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

export type LongScrollProps = Omit<
  ScrollViewProps,
  'contentContainerStyle' | 'onContentSizeChange' | 'onLayout' | 'onScroll' | 'onScrollEndDrag' | 'onMomentumScrollEnd'
> & {
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Accessible name for the control that returns to the top after a long scroll. */
  backToTopLabel: string;
  onContentSizeChange?: (width: number, height: number) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  onScrollEndDrag?: ScrollEnd;
  onMomentumScrollEnd?: ScrollEnd;
};

/**
 * The default scroll surface for browse screens.
 *
 * Long pages are easier to read when the viewport has a little orientation of
 * its own. The cue is only mounted after measuring a real overflow, and fades
 * with the user's scroll position. The return-to-top action appears after a
 * page-sized movement, so it is available when needed without becoming chrome
 * on every screen. Scroll position never enters React state on every frame.
 */
export function LongScroll({
  children,
  contentContainerStyle,
  backToTopLabel,
  onContentSizeChange,
  onLayout,
  onScrollEndDrag,
  onMomentumScrollEnd,
  ...rest
}: LongScrollProps) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [showTop, setShowTop] = useState(false);

  const canScroll = contentHeight > viewportHeight + space.base;

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height;
      setViewportHeight((previous) => (previous === height ? previous : height));
      onLayout?.(event);
    },
    [onLayout],
  );

  const handleContentSizeChange = useCallback(
    (width: number, height: number) => {
      setContentHeight((previous) => (previous === height ? previous : height));
      onContentSizeChange?.(width, height);
    },
    [onContentSizeChange],
  );

  const updateTopVisibility = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      setShowTop(canScroll && y > Math.max(viewportHeight * 0.72, 180));
    },
    [canScroll, viewportHeight],
  );

  const handleScrollEndDrag = useCallback<ScrollEnd>(
    (event) => {
      updateTopVisibility(event);
      onScrollEndDrag?.(event);
    },
    [onScrollEndDrag, updateTopVisibility],
  );

  const handleMomentumScrollEnd = useCallback<ScrollEnd>(
    (event) => {
      updateTopVisibility(event);
      onMomentumScrollEnd?.(event);
    },
    [onMomentumScrollEnd, updateTopVisibility],
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.set(event.contentOffset.y);
    },
  });

  const cueStyle = useAnimatedStyle(() => ({
    opacity: canScroll
      ? interpolate(scrollY.get(), [0, 28, Math.max(viewportHeight * 0.28, 160)], [1, 0.72, 0], Extrapolation.CLAMP)
      : 0,
    transform: [
      {
        translateY: interpolate(scrollY.get(), [0, 80], [0, 5], Extrapolation.CLAMP),
      },
    ],
  }));

  const topStyle = useAnimatedStyle(() => ({
    opacity: showTop ? 1 : 0,
    transform: [{ translateY: showTop ? 0 : 6 }],
  }));

  const toTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: !reduced });
    setShowTop(false);
  };

  return (
    <View style={styles.root}>
      <AnimatedScrollView
        ref={scrollRef}
        {...rest}
        contentContainerStyle={contentContainerStyle}
        onLayout={handleLayout}
        onContentSizeChange={handleContentSizeChange}
        onScroll={onScroll}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical
        nestedScrollEnabled
        keyboardDismissMode="on-drag"
        overScrollMode="always"
      >
        {children}
      </AnimatedScrollView>

      {canScroll ? (
        <Animated.View pointerEvents="none" accessibilityElementsHidden style={[styles.cue, cueStyle]}>
          <View style={styles.cuePill}>
            <View style={styles.downIcon}>
              <ChevronRightIcon size={17} color={color.inkMuted} />
            </View>
          </View>
        </Animated.View>
      ) : null}

      {canScroll && showTop ? (
        <Animated.View style={[styles.top, { bottom: Math.max(insets.bottom, space.base) }, topStyle]}>
          <Press
            onPress={toTop}
            accessibilityLabel={backToTopLabel}
            accessibilityHint={backToTopLabel}
            style={styles.topButton}
            scale={0.94}
          >
            <View style={styles.upIcon}>
              <ChevronRightIcon size={18} color={color.inkMuted} />
            </View>
          </Press>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  cue: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: space.sm,
    alignItems: 'center',
  },
  cuePill: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  top: {
    position: 'absolute',
    right: space.lg,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  downIcon: {
    transform: [{ rotate: '90deg' }],
  },
  upIcon: {
    transform: [{ rotate: '-90deg' }],
  },
});
