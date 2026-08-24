import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ja as jaLocale, enUS } from 'date-fns/locale';

import { Screen, Header, SCREEN_PADDING } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Press } from '@/components/Press';
import { Card, DashedRule } from '@/components/Surface';
import { BarChart, type Bar } from '@/components/BarChart';
import { BottleIcon, ChevronLeftIcon, DiaperIcon, SleepIcon, TimerIcon } from '@/icons';
import { color, radius, space } from '@/design/tokens';
import { useApp } from '@/store/app';
import { useLive } from '@/db/live';
import { daySeries, rhythm, type DaySummary, type Rhythm } from '@/db/stats';
import { formatClock } from '@/utils/time';

type Focus = 'diaper' | 'feed' | 'sleep';

const EMPTY: { series: DaySummary[]; r: Rhythm } = {
  series: [],
  r: {
    feedGapMin: null,
    nextFeedAt: null,
    napMin: null,
    sleepHoursPerDay: null,
    feedsPerDay: null,
    sampleDays: 0,
  },
};

/** Below three days of logs, a "rhythm" is noise dressed up as insight. */
const MIN_SAMPLE_DAYS = 3;

export default function Stats() {
  const router = useRouter();
  const { t, lang, baby } = useApp();
  const params = useLocalSearchParams<{ focus?: string }>();
  const [days, setDays] = useState<7 | 30>(7);

  const babyId = baby?.id ?? 0;
  const { data } = useLive(
    async (db) => {
      if (!babyId) return EMPTY;
      const [series, r] = await Promise.all([
        daySeries(db, babyId, days),
        rhythm(db, babyId, Math.max(days, 7)),
      ]);
      return { series, r };
    },
    [babyId, days],
    EMPTY,
    ['entry'],
  );

  const focus: Focus =
    params.focus === 'feed' || params.focus === 'sleep' ? params.focus : 'diaper';

  const label = (d: DaySummary) =>
    lang === 'ja'
      ? format(d.dayStart, 'd', { locale: jaLocale })
      : format(d.dayStart, 'd', { locale: enUS });

  const charts = useMemo(() => {
    const last = data.series.length - 1;
    const mk = (pick: (d: DaySummary) => number): Bar[] =>
      data.series.map((d, i) => ({ label: label(d), value: pick(d), emphasis: i === last }));

    const all: Record<Focus, { title: string; icon: React.ReactNode; bars: Bar[]; unit: string }> = {
      diaper: {
        title: t.stats.diapersPerDay,
        icon: <DiaperIcon size={24} />,
        bars: mk((d) => d.diaperTotal),
        unit: lang === 'ja' ? '回' : '',
      },
      feed: {
        title: t.stats.feedsPerDay,
        icon: <BottleIcon size={22} />,
        bars: mk((d) => d.feeds),
        unit: lang === 'ja' ? '回' : '',
      },
      sleep: {
        title: t.stats.sleepPerDay,
        icon: <SleepIcon size={24} />,
        bars: mk((d) => Math.round((d.sleepSec / 3600) * 10) / 10),
        unit: lang === 'ja' ? '時間' : 'h',
      },
    };

    // The card the user tapped through from leads.
    const order: Focus[] = [focus, ...(['diaper', 'feed', 'sleep'] as Focus[]).filter((k) => k !== focus)];
    return order.map((k) => ({ key: k, ...all[k] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.series, focus, t, lang]);

  if (!baby) return <Screen />;

  const r = data.r;
  const enough = r.sampleDays >= MIN_SAMPLE_DAYS;

  return (
    <Screen>
      <Header
        title={t.stats.title}
        left={{ icon: <ChevronLeftIcon size={24} />, onPress: () => router.back(), label: t.common.back }}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.ranges}>
          {([7, 30] as const).map((d) => {
            const on = d === days;
            return (
              <Press
                key={d}
                onPress={() => setDays(d)}
                accessibilityState={{ selected: on }}
                accessibilityLabel={d === 7 ? t.stats.week : t.stats.month}
                scale={0.95}
                style={[styles.range, on ? styles.rangeOn : null]}
              >
                <Txt variant="label" color={on ? color.onFill : color.inkMuted}>
                  {d === 7 ? t.stats.week : t.stats.month}
                </Txt>
              </Press>
            );
          })}
        </View>

        <Card style={styles.rhythm}>
          <View style={styles.rhythmHead}>
            <TimerIcon size={22} />
            <Txt variant="heading">{t.stats.rhythm}</Txt>
          </View>
          <DashedRule style={styles.rule} />

          {enough ? (
            <View style={styles.rhythmRows}>
              <RhythmRow
                label={t.stats.feedGap}
                value={r.feedGapMin ? t.stats.everyMinutes(r.feedGapMin) : '—'}
              />
              <RhythmRow
                label={t.stats.napLength}
                value={r.napMin ? `${r.napMin}${t.units.minute}` : '—'}
              />
              <RhythmRow
                label={t.stats.nextFeed}
                value={r.nextFeedAt ? t.stats.aroundTime(formatClock(r.nextFeedAt)) : '—'}
                emphasis
              />
            </View>
          ) : (
            <Txt variant="support">{t.stats.notEnough}</Txt>
          )}
        </Card>

        {charts.map((c) => (
          <Card key={c.key} style={styles.chartCard}>
            <View style={styles.chartHead}>
              {c.icon}
              <Txt variant="heading">{c.title}</Txt>
            </View>
            <DashedRule style={styles.rule} />
            <BarChart bars={c.bars} formatValue={(v) => `${v}${c.unit}`} />
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

function RhythmRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <View style={styles.rhythmRow}>
      <Txt variant="support">{label}</Txt>
      <Txt variant={emphasis ? 'metricSm' : 'label'}>{value}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: space.md,
    paddingBottom: space.xxxl,
    gap: space.md,
  },
  ranges: {
    flexDirection: 'row',
    gap: space.sm,
  },
  range: {
    paddingHorizontal: space.base,
    minHeight: 40,
    borderRadius: radius.pill,
    borderWidth: 1.4,
    borderColor: color.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeOn: {
    backgroundColor: color.fill,
    borderColor: 'transparent',
  },
  rhythm: {},
  rhythmHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  rule: {
    marginTop: space.sm,
    marginBottom: space.base,
  },
  rhythmRows: {
    gap: space.md,
  },
  rhythmRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space.md,
  },
  chartCard: {},
  chartHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
});
