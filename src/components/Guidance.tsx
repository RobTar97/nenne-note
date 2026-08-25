import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, DashedRule } from './Surface';
import { Txt } from './Txt';
import { InfoIcon } from '@/icons';
import { color, space } from '@/design/tokens';

/**
 * Age-based typical ranges.
 *
 * Three deliberate constraints, because this is the one place in the app that
 * touches anything health-adjacent:
 *
 * - It is always a **range**, never a single number. A single number reads as
 *   a target, and a parent whose baby is below it will feel they are failing.
 * - It never mentions *this* baby's figures, so there is nothing to compare
 *   against and no implied verdict. The totals are on the same screen; the
 *   parent can draw their own conclusions.
 * - The disclaimer is not optional and is not visually buried — it is part of
 *   the component, so no screen can render the numbers without it.
 */
export function Guidance({
  title,
  lines,
  disclaimer,
}: {
  title: string;
  lines: string[];
  disclaimer: string;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <InfoIcon size={19} color={color.inkMuted} />
        <Txt variant="label" color={color.inkMuted}>
          {title}
        </Txt>
      </View>
      <DashedRule style={styles.rule} />

      <View style={styles.lines}>
        {lines.map((l) => (
          <Txt key={l} variant="support">
            {l}
          </Txt>
        ))}
      </View>

      <Txt variant="caption" style={styles.disclaimer}>
        {disclaimer}
      </Txt>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    // Quieter than the data cards around it: this is context, not a reading.
    backgroundColor: color.surfaceAlt,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  rule: {
    marginTop: space.sm,
    marginBottom: space.md,
  },
  lines: {
    gap: 2,
  },
  disclaimer: {
    marginTop: space.md,
  },
});
