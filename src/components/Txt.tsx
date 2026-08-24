import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';
import { text, type TextVariant } from '@/design/type';

export type TxtProps = TextProps & {
  variant?: TextVariant;
  color?: string;
  /** Centre without reaching for a one-off style. */
  center?: boolean;
};

/**
 * Every piece of text in the app goes through here, so no screen can quietly
 * introduce a font size, weight or tracking that isn't in the scale.
 *
 * `allowFontScaling` is left on: the app has to survive 200% type, which is why
 * nothing in the layout is a hardcoded height.
 */
export function Txt({ variant = 'body', color, center, style, ...rest }: TxtProps) {
  return (
    <Text
      {...rest}
      style={StyleSheet.compose(
        [text[variant], color ? { color } : null, center ? styles.center : null],
        style,
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
});
