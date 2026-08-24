import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, space } from '@/design/tokens';
import { Txt } from './Txt';
import { IconButton } from './Press';

export const SCREEN_PADDING = space.lg;

export function Screen({
  children,
  style,
  /** Skip the top inset when a native header already supplies it. */
  edges = 'top',
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: 'top' | 'none';
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, edges === 'top' && { paddingTop: insets.top }, style]}>
      {children}
    </View>
  );
}

export type HeaderAction = {
  icon: React.ReactNode;
  onPress: () => void;
  label: string;
};

/**
 * The header from the mockups: an action, a centred title, an action.
 *
 * The title is absolutely positioned rather than flexed between the two
 * buttons, so it stays optically centred on the screen even when one side has
 * an action and the other doesn't.
 */
export function Header({
  title,
  subtitle,
  left,
  right,
}: {
  title: string;
  subtitle?: string;
  left?: HeaderAction;
  right?: HeaderAction;
}) {
  return (
    <View style={styles.header}>
      <View pointerEvents="none" style={styles.titleWrap}>
        <Txt variant="title" center numberOfLines={1}>
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="support" center numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Txt>
        ) : null}
      </View>

      <View style={styles.side}>
        {left ? (
          <IconButton onPress={left.onPress} accessibilityLabel={left.label}>
            {left.icon}
          </IconButton>
        ) : null}
      </View>
      <View style={[styles.side, styles.sideRight]}>
        {right ? (
          <IconButton onPress={right.onPress} accessibilityLabel={right.label}>
            {right.icon}
          </IconButton>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
  },
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: space.sm,
  },
  titleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: space.sm,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 64,
  },
  subtitle: {
    marginTop: 2,
  },
  side: {
    width: 44,
    alignItems: 'flex-start',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
});
