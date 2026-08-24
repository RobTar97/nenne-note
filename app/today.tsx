import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ja as jaLocale, enUS } from 'date-fns/locale';

import { Screen, Header, SCREEN_PADDING } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { CardPress, Medallion } from '@/components/Surface';
import { FilterPills } from '@/components/FilterPills';
import { PeekBear } from '@/icons/PeekBear';
import {
  BabyIcon,
  BottleIcon,
  ChevronRightIcon,
  DiaperIcon,
  GearIcon,
  HeartIcon,
  SleepIcon,
} from '@/icons';
import { color, space } from '@/design/tokens';
import { useApp } from '@/store/app';
import { useLive } from '@/db/live';
import { elapsedSec, listEntries } from '@/db/repo';
import type { Entry, EntryKind } from '@/db/types';
import { dayEnd, dayStart, formatClock } from '@/utils/time';
import { formatDuration } from '@/i18n';
import { useTicker } from '@/utils/useTicker';

type Filter = 'all' | EntryKind;

export default function Today() {
  const router = useRouter();
  const { t, lang, baby, haptic, settings } = useApp();
  const params = useLocalSearchParams<{ filter?: string }>();

  const [filter, setFilter] = useState<Filter>(
    params.filter === 'diaper' || params.filter === 'feed' || params.filter === 'sleep'
      ? params.filter
      : 'all',
  );

  const babyId = baby?.id ?? 0;
  const today = Date.now();

  const { data: entries } = useLive<Entry[]>(
    async (db) =>
      babyId ? listEntries(db, babyId, dayStart(today), dayEnd(today)) : [],
    [babyId],
    [],
    ['entry'],
  );

  const visible = useMemo(
    () => (filter === 'all' ? entries : entries.filter((e) => e.kind === filter)),
    [entries, filter],
  );

  const options = useMemo(
    () => [
      { value: 'all' as const, label: t.common.all },
      {
        value: 'diaper' as const,
        label: t.kind.diaper,
        icon: (on: boolean) => <DiaperIcon size={20} color={on ? color.onFill : color.inkMuted} />,
      },
      {
        value: 'feed' as const,
        label: t.kind.feed,
        icon: (on: boolean) => <BottleIcon size={19} color={on ? color.onFill : color.inkMuted} />,
      },
      {
        value: 'sleep' as const,
        label: t.kind.sleep,
        icon: (on: boolean) => <SleepIcon size={20} color={on ? color.onFill : color.inkMuted} />,
      },
    ],
    [t],
  );

  if (!baby) return <Screen />;

  const dateLabel =
    lang === 'ja'
      ? format(today, 'M月d日(E)', { locale: jaLocale })
      : format(today, 'EEEE, MMM d', { locale: enUS });

  return (
    <Screen>
      <Header
        title={t.today.title}
        subtitle={dateLabel}
        left={{ icon: <BabyIcon size={30} />, onPress: () => router.back(), label: t.a11y.home }}
        right={{ icon: <GearIcon size={26} />, onPress: () => router.push('/settings'), label: t.a11y.settings }}
      />

      <View style={styles.filters}>
        <FilterPills options={options} value={filter} onChange={setFilter} onHaptic={haptic.select} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {visible.length === 0 ? (
          <View style={styles.empty}>
            <PeekBear width={148} eyes="awake" hearts={false} color={color.inkFaint} />
            <Txt variant="support" center style={styles.emptyText}>
              {t.today.empty}
            </Txt>
            <Txt variant="caption" center>
              {t.today.emptyHint}
            </Txt>
          </View>
        ) : (
          visible.map((e, i) => (
            <TimelineRow
              key={e.id}
              entry={e}
              first={i === 0}
              last={i === visible.length - 1}
              onPress={() => router.push({ pathname: '/log', params: { id: String(e.id) } })}
            />
          ))
        )}

        <View style={styles.footer}>
          <PeekBear width={132} />
          <View style={styles.footerText}>
            <Txt variant="support" center>
              {t.today.encouragement(t.caregiver[settings.caregiver])}
            </Txt>
            <HeartIcon size={14} color={color.ink} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

/**
 * One event on the day's timeline.
 *
 * The connector is drawn per row rather than as a single line behind the list,
 * so it stays correct when rows have different heights and when the filter
 * changes the number of rows — no measurement, nothing to keep in sync.
 */
function TimelineRow({
  entry,
  first,
  last,
  onPress,
}: {
  entry: Entry;
  first: boolean;
  last: boolean;
  onPress: () => void;
}) {
  const { t, lang } = useApp();
  const running = entry.endedAt === null;
  // Only subscribe to the clock while this row is actually counting.
  const now = useTicker(1000, running);

  const { title, sub, icon } = describe(entry, t, lang, now);

  return (
    <View style={styles.row}>
      <View style={styles.timeCol}>
        <Txt variant="metricSm">{formatClock(entry.startedAt)}</Txt>
      </View>

      <View style={styles.railCol}>
        <View style={[styles.rail, first && styles.railTop, last && styles.railBottom]} />
        <View style={[styles.dot, running && styles.dotOn]} />
      </View>

      <CardPress onPress={onPress} accessibilityLabel={title} style={styles.card}>
        <Medallion size={62}>{icon}</Medallion>
        <View style={styles.cardBody}>
          <Txt variant="heading" numberOfLines={1}>
            {title}
          </Txt>
          {sub ? (
            <Txt variant="support" numberOfLines={1}>
              {sub}
            </Txt>
          ) : null}
        </View>
        <ChevronRightIcon size={18} color={color.inkFaint} />
      </CardPress>
    </View>
  );
}

function describe(
  e: Entry,
  t: ReturnType<typeof useApp>['t'],
  lang: 'ja' | 'en',
  now: number,
) {
  if (e.kind === 'diaper') {
    const title =
      e.diaperKind === 'poop' ? t.diaper.poop : e.diaperKind === 'both' ? t.diaper.both : t.diaper.pee;
    return { title, sub: e.note ?? '', icon: <DiaperIcon size={34} /> };
  }

  if (e.kind === 'feed') {
    const bits: string[] = [];
    if (e.feedKind === 'breast') {
      const total = e.leftSec + e.rightSec;
      if (e.leftSec > 0) bits.push(`${t.feed.left} ${formatDuration(e.leftSec, lang, t)}`);
      if (e.rightSec > 0) bits.push(`${t.feed.right} ${formatDuration(e.rightSec, lang, t)}`);
      if (bits.length === 0 && total === 0) bits.push(t.feed.breast);
    }
    if (e.amountMl != null) bits.push(`${e.amountMl}${t.units.ml}`);
    if (e.endedAt === null) bits.unshift(formatDuration(elapsedSec(e, now), lang, t));
    return { title: t.kind.feed, sub: bits.join(' ・ '), icon: <BottleIcon size={32} /> };
  }

  const secs = elapsedSec(e, now);
  return {
    title: t.kind.sleep,
    sub: e.endedAt === null ? `${t.home.sleeping} ・ ${formatDuration(secs, lang, t)}` : formatDuration(secs, lang, t),
    icon: <SleepIcon size={34} />,
  };
}

const RAIL = 34;
const DOT = 13;

const styles = StyleSheet.create({
  filters: {
    marginTop: space.base,
    marginBottom: space.md,
  },
  scroll: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: space.xxxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  timeCol: {
    width: 58,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  railCol: {
    width: RAIL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rail: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1.4,
    backgroundColor: color.hairline,
  },
  railTop: {
    top: '50%',
  },
  railBottom: {
    bottom: '50%',
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 1.6,
    borderColor: color.inkFaint,
    backgroundColor: color.bg,
  },
  dotOn: {
    backgroundColor: color.ink,
    borderColor: color.ink,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    marginVertical: space.xs,
  },
  cardBody: {
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
  footer: {
    alignItems: 'center',
    marginTop: space.xxl,
  },
  footerText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: space.md,
  },
});
