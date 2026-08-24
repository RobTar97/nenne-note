import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ja as jaLocale, enUS } from 'date-fns/locale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen, Header, SCREEN_PADDING } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Card, CardPress, DashedRule } from '@/components/Surface';
import { FilterPills } from '@/components/FilterPills';
import { LineChart, type Point } from '@/components/LineChart';
import { PrimaryButton } from '@/components/Button';
import { PeekBear } from '@/icons/PeekBear';
import { ChevronLeftIcon, ChevronRightIcon, GrowthIcon, PlusIcon } from '@/icons';
import { color, space } from '@/design/tokens';
import { useApp } from '@/store/app';
import { useLive } from '@/db/live';
import { listGrowth } from '@/db/repo';
import type { Growth } from '@/db/types';

type Metric = 'weight' | 'height' | 'head';

/**
 * Stored as integers (grams, millimetres) and shown in the units a parent
 * actually reads off the scale. Kept in one place so the list, the chart, the
 * delta and the editor can never disagree about precision.
 */
const METRIC = {
  weight: { from: (g: Growth) => g.weightG, toDisplay: (v: number) => v / 1000, digits: 2, unit: 'kg' },
  height: { from: (g: Growth) => g.heightMm, toDisplay: (v: number) => v / 10, digits: 1, unit: 'cm' },
  head: { from: (g: Growth) => g.headMm, toDisplay: (v: number) => v / 10, digits: 1, unit: 'cm' },
} as const;

export default function GrowthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, lang, baby } = useApp();
  const [metric, setMetric] = useState<Metric>('weight');

  const babyId = baby?.id ?? 0;
  const { data: rows } = useLive<Growth[]>(
    async (db) => (babyId ? listGrowth(db, babyId) : []),
    [babyId],
    [],
    ['growth'],
  );

  const spec = METRIC[metric];

  // `listGrowth` returns newest first; a chart reads oldest to newest.
  const series = useMemo(() => {
    const withValue = rows
      .filter((r) => spec.from(r) != null)
      .sort((a, b) => a.measuredAt - b.measuredAt);
    return withValue.map<Point>((r) => ({
      x: r.measuredAt,
      y: spec.toDisplay(spec.from(r) as number),
    }));
  }, [rows, spec]);

  const options = useMemo(
    () => [
      { value: 'weight' as const, label: t.growth.weight },
      { value: 'height' as const, label: t.growth.height },
      { value: 'head' as const, label: t.growth.head },
    ],
    [t],
  );

  if (!baby) return <Screen />;

  const fmt = (v: number) => `${v.toFixed(spec.digits)}${spec.unit}`;
  const latest = series.at(-1);
  const previous = series.at(-2);
  const delta = latest && previous ? latest.y - previous.y : null;

  const dateLabel = (ts: number) =>
    lang === 'ja'
      ? format(ts, 'M月d日', { locale: jaLocale })
      : format(ts, 'd MMM', { locale: enUS });

  return (
    <Screen>
      <Header
        title={t.growth.title}
        left={{ icon: <ChevronLeftIcon size={24} />, onPress: () => router.back(), label: t.common.back }}
      />

      <View style={styles.pills}>
        <FilterPills options={options} value={metric} onChange={setMetric} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {rows.length === 0 ? (
          <View style={styles.empty}>
            <PeekBear width={148} eyes="awake" hearts={false} color={color.inkFaint} />
            <Txt variant="support" center style={styles.emptyText}>
              {t.growth.empty}
            </Txt>
            <Txt variant="caption" center>
              {t.growth.emptyHint}
            </Txt>
          </View>
        ) : (
          <>
            <Card>
              <View style={styles.cardHead}>
                <GrowthIcon size={22} />
                <Txt variant="heading">{options.find((o) => o.value === metric)?.label}</Txt>
              </View>
              <DashedRule style={styles.rule} />

              {latest ? (
                <View style={styles.latestRow}>
                  <View>
                    <Txt variant="caption">{t.growth.latest}</Txt>
                    <Txt variant="display">{fmt(latest.y)}</Txt>
                  </View>
                  {delta != null ? (
                    <Txt variant="support">
                      {t.growth.sincePrev(
                        `${delta >= 0 ? '+' : '−'}${Math.abs(delta).toFixed(spec.digits)}${spec.unit}`,
                      )}
                    </Txt>
                  ) : null}
                </View>
              ) : (
                <Txt variant="support">{t.growth.empty}</Txt>
              )}

              {/* One reading is not a trend. The number above already says
                  everything a single point could, and an empty plot with one
                  dot and a min that equals its max reads as a broken chart. */}
              {series.length > 1 ? (
                <View style={styles.chart}>
                  <LineChart points={series} formatValue={fmt} />
                </View>
              ) : null}
            </Card>

            <View style={styles.list}>
              {rows.map((r) => (
                <CardPress
                  key={r.id}
                  style={styles.row}
                  accessibilityLabel={dateLabel(r.measuredAt)}
                  onPress={() => router.push({ pathname: '/growth-log', params: { id: String(r.id) } })}
                >
                  <Txt variant="label" style={styles.rowDate}>
                    {dateLabel(r.measuredAt)}
                  </Txt>
                  <Txt variant="support" numberOfLines={1} style={styles.rowValues}>
                    {describe(r, t)}
                  </Txt>
                  <ChevronRightIcon size={16} color={color.inkFaint} />
                </CardPress>
              ))}
            </View>

            <Txt variant="caption" center style={styles.disclaimer}>
              {t.growth.noReference}
            </Txt>
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.base) }]}>
        <PrimaryButton
          label={t.growth.add}
          icon={<PlusIcon size={22} color={color.onFill} />}
          onPress={() => router.push('/growth-log')}
        />
      </View>
    </Screen>
  );
}

function describe(g: Growth, t: ReturnType<typeof useApp>['t']) {
  const bits: string[] = [];
  if (g.weightG != null) bits.push(`${(g.weightG / 1000).toFixed(2)}${t.units.kg}`);
  if (g.heightMm != null) bits.push(`${(g.heightMm / 10).toFixed(1)}${t.units.cm}`);
  if (g.headMm != null) bits.push(`${t.growth.head} ${(g.headMm / 10).toFixed(1)}${t.units.cm}`);
  return bits.join(' ・ ');
}

const styles = StyleSheet.create({
  pills: {
    marginTop: space.base,
    marginBottom: space.md,
  },
  scroll: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: space.lg,
    gap: space.md,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  rule: {
    marginTop: space.sm,
    marginBottom: space.base,
  },
  latestRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: space.md,
  },
  chart: {
    marginTop: space.base,
  },
  list: {
    gap: space.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.base,
  },
  rowDate: {
    minWidth: 76,
  },
  rowValues: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    paddingTop: space.xxl,
    gap: space.xs,
  },
  emptyText: {
    marginTop: space.base,
  },
  disclaimer: {
    marginTop: space.sm,
    paddingHorizontal: space.base,
  },
  footer: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: space.md,
    backgroundColor: color.bg,
  },
});
