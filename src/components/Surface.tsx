import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { color, radius, shadow, space } from '@/design/tokens';
import { Press, type PressProps } from './Press';

/** The raised white card every screen is built from. */
export function Card({ style, children }: { style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** The same card, pressable. Kept as one component so the two can never drift. */
export function CardPress({ style, children, ...rest }: PressProps) {
  return (
    <Press scale={0.985} style={[styles.card, style]} {...rest}>
      {children}
    </Press>
  );
}

/**
 * The recessed circle a category icon sits in. Its diameter drives the icon
 * size, so the optical weight of the glyph inside stays constant across sizes.
 */
export function Medallion({
  size = 84,
  children,
  style,
}: {
  size?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color.sunken,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/**
 * The dashed rule under a card heading.
 *
 * Drawn in SVG rather than with `borderStyle: 'dashed'`, which Android renders
 * inconsistently at hairline widths and iOS renders with a different dash
 * rhythm — the two platforms would not match.
 */
export function DashedRule({ style, color: c = color.hairline }: { style?: StyleProp<ViewStyle>; color?: string }) {
  return (
    <View style={[styles.rule, style]}>
      <Svg width="100%" height={1.5}>
        <Line
          x1="0"
          y1="0.75"
          x2="100%"
          y2="0.75"
          stroke={c}
          strokeWidth={1.5}
          strokeDasharray="3 4"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

/** A vertical hairline between two side-by-side stats. */
export function VRule({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.vrule, style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    ...shadow.card,
  },
  rule: {
    height: 1.5,
    width: '100%',
  },
  vrule: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: color.hairline,
  },
});
