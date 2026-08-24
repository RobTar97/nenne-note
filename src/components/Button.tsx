import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { color, radius, shadow, space } from '@/design/tokens';
import { Press } from './Press';
import { Txt } from './Txt';

/**
 * The primary commit button — the black pill from the mockups.
 *
 * There is exactly one of these on a screen, ever. It is the only filled black
 * surface in the app, which is what makes it read as "the thing to do here"
 * without any colour to help.
 */
export function PrimaryButton({
  label,
  icon,
  onPress,
  disabled,
  busy,
}: {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <Press
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityLabel={label}
      style={styles.primary}
    >
      <View style={styles.row}>
        {busy ? (
          <ActivityIndicator color={color.onFill} />
        ) : (
          <>
            {icon ? <View style={styles.icon}>{icon}</View> : null}
            <Txt variant="button">{label}</Txt>
          </>
        )}
      </View>
    </Press>
  );
}

/** A quiet secondary action: text on the page, no surface of its own. */
export function GhostButton({
  label,
  onPress,
  tone = 'default',
}: {
  label: string;
  onPress: () => void;
  tone?: 'default' | 'danger';
}) {
  return (
    <Press onPress={onPress} accessibilityLabel={label} style={styles.ghost}>
      <Txt variant="label" color={tone === 'danger' ? color.ink : color.inkMuted}>
        {label}
      </Txt>
    </Press>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: color.fill,
    borderRadius: radius.pill,
    minHeight: 62,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    ...shadow.raised,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  icon: {
    marginTop: -1,
  },
  ghost: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.base,
  },
});
