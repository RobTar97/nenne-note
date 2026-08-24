import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen, Header, SCREEN_PADDING } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { CardStat, LastCard } from '@/components/LastCard';
import { VRule } from '@/components/Surface';
import { Ring } from '@/components/Ring';
import { PeekBear } from '@/icons/PeekBear';
import {
  BottleIcon,
  DiaperIcon,
  DropIcon,
  GearIcon,
  HomeIcon,
  PoopIcon,
  SleepIcon,
  SparkHeartIcon,
} from '@/icons';
import { color, space } from '@/design/tokens';
import { useApp } from '@/store/app';
import { useLive } from '@/db/live';
import { daySummary, type DaySummary } from '@/db/stats';
import { formatClock } from '@/utils/time';
import { durationParts } from '@/i18n';

const EMPTY: DaySummary = {
  dayStart: 0,
  pee: 0,
  poop: 0,
  diaperTotal: 0,
  feeds: 0,
  bottleMl: null,
  nursingSec: 0,
  lastFeedAt: null,
  lastFeedMl: null,
  sleepSec: 0,
  naps: 0,
  lastSleepStart: null,
  lastSleepSec: null,
};

/** A full day of sleep is never 24h; 16h is a healthy newborn's day. */
const SLEEP_TARGET_SEC = 16 * 3600;

export default function Summary() {
  const router = useRouter();
  const { t, lang, baby } = useApp();
  const babyId = baby?.id ?? 0;

  const { data: s } = useLive<DaySummary>(
    async (db) => (babyId ? daySummary(db, babyId) : EMPTY),
    [babyId],
    EMPTY,
    ['entry'],
  );

  if (!baby) return <Screen />;

  const anything = s.diaperTotal > 0 || s.feeds > 0 || s.sleepSec > 0;
  const sleep = durationParts(s.sleepSec, lang, t);

  const goStats = (focus: string) => router.push({ pathname: '/stats', params: { focus } });

  return (
    <Screen>
      <Header
        title={t.summary.title}
        subtitle={t.summary.subtitle(baby.name)}
        left={{ icon: <HomeIcon size={28} />, onPress: () => router.back(), label: t.a11y.home }}
        right={{ icon: <GearIcon size={26} />, onPress: () => router.push('/settings'), label: t.a11y.settings }}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.bear}>
          <PeekBear width={172} eyes="awake" />
        </View>

        <View style={styles.cards}>
          <LastCard
            title={t.summary.diaperTitle}
            accessibilityLabel={t.summary.diaperTitle}
            icon={<DiaperIcon size={46} />}
            onPress={() => goStats('diaper')}
          >
            <View style={styles.split}>
              <CardStat
                icon={<DropIcon size={17} color={color.inkMuted} />}
                label={t.diaper.pee}
                value={String(s.pee)}
                sub={t.summary.todaySuffix}
              />
              <VRule />
              <View style={styles.splitRight}>
                <CardStat
                  icon={<PoopIcon size={17} color={color.inkMuted} />}
                  label={t.diaper.poop}
                  value={String(s.poop)}
                  sub={t.summary.todaySuffix}
                />
              </View>
            </View>
          </LastCard>

          <LastCard
            title={t.summary.feedTitle}
            accessibilityLabel={t.summary.feedTitle}
            icon={<BottleIcon size={44} />}
            onPress={() => goStats('feed')}
          >
            <View style={styles.split}>
              <CardStat
                label={t.summary.totalFeeds}
                value={String(s.feeds)}
                sub={t.summary.todaySuffix}
              />
              <VRule />
              <View style={styles.splitRight}>
                <CardStat
                  label={t.summary.lastFeeding}
                  value={s.lastFeedAt ? formatClock(s.lastFeedAt) : '—'}
                  sub={s.lastFeedMl != null ? `${s.lastFeedMl}${t.units.ml}` : undefined}
                />
              </View>
            </View>
          </LastCard>

          <LastCard
            title={t.summary.sleepTitle}
            accessibilityLabel={t.summary.sleepTitle}
            icon={<SleepIcon size={46} />}
            onPress={() => goStats('sleep')}
          >
            <View style={styles.split}>
              <View style={styles.sleepCol}>
                <Txt variant="caption" numberOfLines={1} style={styles.sleepLabel}>
                  {t.summary.totalSleep}
                </Txt>
                <Ring size={98} progress={s.sleepSec / SLEEP_TARGET_SEC}>
                  <View style={styles.ringText}>
                    <View style={styles.ringRow}>
                      {sleep.map((p) => (
                        <View key={p.unit} style={styles.ringRow}>
                          <Txt variant="metricSm">{p.value}</Txt>
                          <Txt variant="caption">{p.unit}</Txt>
                        </View>
                      ))}
                    </View>
                    <Txt variant="caption">{t.summary.todaySuffix}</Txt>
                  </View>
                </Ring>
              </View>
              <VRule />
              <View style={styles.splitRight}>
                <CardStat
                  label={t.summary.lastNap}
                  value={s.lastSleepStart ? formatClock(s.lastSleepStart) : '—'}
                  sub={
                    s.lastSleepSec != null
                      ? durationParts(s.lastSleepSec, lang, t)
                          .map((p) => `${p.value}${p.unit}`)
                          .join('')
                      : undefined
                  }
                />
              </View>
            </View>
          </LastCard>
        </View>

        <View style={styles.footer}>
          <SparkHeartIcon size={30} />
          <Txt variant="support" center style={styles.footerText}>
            {anything ? t.summary.allGood : t.summary.quiet}
          </Txt>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: space.xxxl,
  },
  bear: {
    alignItems: 'center',
    marginTop: space.sm,
    marginBottom: space.lg,
  },
  cards: {
    gap: space.md,
  },
  split: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: space.base,
  },
  splitRight: {
    flex: 1,
    justifyContent: 'center',
  },
  sleepCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
  sleepLabel: {
    marginBottom: space.sm,
  },
  ringText: {
    alignItems: 'center',
  },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  footer: {
    alignItems: 'center',
    marginTop: space.xxl,
    gap: space.sm,
  },
  footerText: {
    marginTop: 2,
  },
});
