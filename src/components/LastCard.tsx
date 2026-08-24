import React from 'react';
import { StyleSheet, View } from 'react-native';
import { color, space } from '@/design/tokens';
import { ChevronRightIcon } from '@/icons';
import { CardPress } from './Surface';
import { Medallion } from './Surface';
import { DashedRule } from './Surface';
import { Txt } from './Txt';

/**
 * The "last X" card on the home screen.
 *
 * One component for all three categories so the medallion size, the dashed
 * rule and the chevron can never drift apart between them — the alignment of
 * these three cards is most of what makes the home screen feel composed.
 */
export function LastCard({
  title,
  icon,
  onPress,
  accessibilityLabel,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
}) {
  return (
    <CardPress onPress={onPress} accessibilityLabel={accessibilityLabel} style={styles.card}>
      <Medallion size={82}>{icon}</Medallion>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Txt variant="heading" numberOfLines={1} style={styles.title}>
            {title}
          </Txt>
          <ChevronRightIcon size={18} color={color.inkFaint} />
        </View>
        <DashedRule style={styles.rule} />
        {children}
      </View>
    </CardPress>
  );
}

/** A stat inside a card: a small labelled icon over a value. */
export function CardStat({
  icon,
  label,
  value,
  sub,
  align = 'flex-start',
}: {
  icon?: React.ReactNode;
  label?: string;
  value: string;
  sub?: string;
  align?: 'flex-start' | 'center';
}) {
  return (
    <View style={{ flex: 1, alignItems: align }}>
      {label ? (
        <View style={styles.statLabel}>
          {icon}
          <Txt variant="caption" numberOfLines={1}>
            {label}
          </Txt>
        </View>
      ) : null}
      <Txt variant="metricSm">{value}</Txt>
      {sub ? <Txt variant="caption">{sub}</Txt> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.base,
  },
  body: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  title: {
    flexShrink: 1,
  },
  rule: {
    marginTop: space.sm,
    marginBottom: space.md,
  },
  statLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
});
