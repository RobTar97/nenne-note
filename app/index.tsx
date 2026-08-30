import React, { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Screen, Header, SCREEN_PADDING } from '@/components/Screen';
import { LongScroll } from '@/components/LongScroll';
import { Txt } from '@/components/Txt';
import { Press } from '@/components/Press';
import { CardStat, LastCard } from '@/components/LastCard';
import { DashedRule, VRule } from '@/components/Surface';
import { PeekBear } from '@/icons/PeekBear';
import {
  BabyIcon,
  BottleIcon,
  DiaperIcon,
  DropIcon,
  GearIcon,
  HeartIcon,
  PoopIcon,
  SleepIcon,
  StopIcon,
} from '@/icons';
import { color, radius, space } from '@/design/tokens';
import { spring, timings } from '@/design/motion';
import { useApp } from '@/store/app';
import { useLive } from '@/db/live';
import { elapsedSec, lastEntry, runningEntry, stopRunning } from '@/db/repo';
import type { Entry } from '@/db/types';
import { ageInDays, formatClock } from '@/utils/time';
import { formatDuration } from '@/i18n';
import { useTicker } from '@/utils/useTicker';
import { useDayStart } from '@/utils/useDayStart';

type HomeData = {
  pee: Entry | null;
  poop: Entry | null;
  feed: Entry | null;
  sleep: Entry | null;
  running: Entry | null;
};

const EMPTY: HomeData = { pee: null, poop: null, feed: null, sleep: null, running: null };

export default function Home() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { t, lang, baby, settings, haptic, celebration, celebrate } = useApp();
  const today = useDayStart();
  const [stopping, setStopping] = useState(false);

  const babyId = baby?.id ?? 0;
  const { data } = useLive<HomeData>(
    async (db) => {
      if (!babyId) return EMPTY;
      const [pee, poop, feed, sleep, running] = await Promise.all([
        lastEntry(db, babyId, 'diaper', ['pee', 'both']),
        lastEntry(db, babyId, 'diaper', ['poop', 'both']),
        lastEntry(db, babyId, 'feed'),
        lastEntry(db, babyId, 'sleep'),
        runningEntry(db, babyId),
      ]);
      return { pee, poop, feed, sleep, running };
    },
    [babyId],
    EMPTY,
    ['entry'],
  );

  if (!baby) return <Screen />;

  const days = ageInDays(baby.birthday, today);
  // Nothing logged yet, ever. Used for a single in-place hint above the
  // quick-add row rather than a tutorial wall — and it disappears by itself the
  // moment the first log lands, so there is nothing to dismiss.
  const isNew =
    !data.pee && !data.poop && !data.feed && !data.sleep && !data.running;
  const who = t.caregiver[settings.caregiver];
  const greeting = greetingFor(new Date().getHours(), t);

  const goSummary = () => router.push('/summary');
  const goSettings = () => router.push('/settings');
  const goToday = (filter?: string) =>
    router.push(filter ? { pathname: '/today', params: { filter } } : '/today');
  /**
   * Stopping a timer from the card it appears on.
   *
   * Previously the only way to stop was to open the quick-log modal and find
   * the button there — three taps to end a nap, while holding a baby. The
   * running card is where the parent is already looking.
  */
  const stop = async () => {
    if (!data.running || stopping) return;
    setStopping(true);
    try {
      await stopRunning(db, data.running);
      haptic.commit();
      celebrate();
    } catch (e) {
      console.warn('[log] stop failed', e);
      Alert.alert(t.errors.timerTitle, t.errors.timerBody, [
        { text: t.common.cancel, style: 'cancel' },
        { text: t.common.retry, onPress: () => void stop() },
      ]);
    } finally {
      setStopping(false);
    }
  };

  const quickLog = (kind: 'diaper' | 'feed' | 'sleep') => {
    haptic.tap();
    router.push({ pathname: '/log', params: { kind } });
  };

  return (
    <Screen>
      <Header
        title={t.home.title}
        left={{ icon: <BabyIcon size={30} />, onPress: goSummary, label: t.a11y.summary }}
        right={{ icon: <GearIcon size={26} />, onPress: goSettings, label: t.a11y.settings }}
      />

      <LongScroll
        backToTopLabel={t.common.backToTop}
        contentContainerStyle={styles.scroll}
        // The bear should not be nailed to the top of a bouncing scroll view.
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <View style={styles.greetingRow}>
              <Txt variant="support">{who ? `${greeting}、${who}` : greeting}</Txt>
              <HeartIcon size={14} color={color.ink} />
            </View>
            <View style={styles.nameRow}>
              <Txt variant="display" style={styles.name}>
                {baby.name}
              </Txt>
              <Txt variant="support" style={styles.age}>
                {t.home.ageDays(days)}
              </Txt>
            </View>
          </View>
          <CelebratingBear token={celebration} />
        </View>

        <View style={styles.cards}>
          <LastCard
            title={t.home.lastDiaper}
            accessibilityLabel={cardA11y(t.home.lastDiaper, [
              `${t.diaper.pee}: ${data.pee ? formatClock(data.pee.startedAt) : '—'}`,
              `${t.diaper.poop}: ${data.poop ? formatClock(data.poop.startedAt) : '—'}`,
            ])}
            icon={<DiaperIcon size={46} />}
            onPress={() => goToday('diaper')}
          >
            <View style={styles.split}>
              <CardStat
                icon={<DropIcon size={17} color={color.inkMuted} />}
                label={t.diaper.pee}
                value={data.pee ? formatClock(data.pee.startedAt) : '—'}
              />
              <VRule />
              <View style={styles.splitRight}>
                <CardStat
                  icon={<PoopIcon size={17} color={color.inkMuted} />}
                  label={t.diaper.poop}
                  value={data.poop ? formatClock(data.poop.startedAt) : '—'}
                />
              </View>
            </View>
          </LastCard>

          <LastCard
            title={t.home.lastFeed}
            accessibilityLabel={cardA11y(t.home.lastFeed, [
              data.running?.kind === 'feed'
                ? t.home.nursing
                : data.feed
                  ? `${formatClock(data.feed.startedAt)} — ${feedDetail(data.feed, t, lang)}`
                  : t.home.noRecord,
            ])}
            icon={<BottleIcon size={44} />}
            onPress={() =>
              data.running?.kind === 'feed'
                ? router.push({ pathname: '/log', params: { kind: 'feed' } })
                : goToday('feed')
            }
          >
            {data.running?.kind === 'feed' ? (
              <RunningRow entry={data.running} label={t.home.nursing} onStop={stop} busy={stopping} />
            ) : data.feed ? (
              <>
                <Txt variant="metric">{formatClock(data.feed.startedAt)}</Txt>
                <Txt variant="support">{feedDetail(data.feed, t, lang)}</Txt>
              </>
            ) : (
              <Txt variant="support">{t.home.noRecord}</Txt>
            )}
          </LastCard>

          <LastCard
            title={t.home.lastSleep}
            accessibilityLabel={cardA11y(t.home.lastSleep, [
              data.running?.kind === 'sleep'
                ? t.home.sleeping
                : data.sleep
                  ? `${formatClock(data.sleep.startedAt)} — ${formatDuration(
                      Math.round(((data.sleep.endedAt ?? data.sleep.startedAt) - data.sleep.startedAt) / 1000),
                      lang,
                      t,
                    )}`
                  : t.home.noRecord,
            ])}
            icon={<SleepIcon size={46} />}
            onPress={() =>
              data.running?.kind === 'sleep'
                ? router.push({ pathname: '/log', params: { kind: 'sleep' } })
                : goToday('sleep')
            }
          >
            {data.running?.kind === 'sleep' ? (
              <RunningRow entry={data.running} label={t.home.sleeping} onStop={stop} busy={stopping} />
            ) : data.sleep ? (
              <>
                <Txt variant="metric">{formatClock(data.sleep.startedAt)}</Txt>
                <Txt variant="support">
                  {formatDuration(
                    Math.round(((data.sleep.endedAt ?? data.sleep.startedAt) - data.sleep.startedAt) / 1000),
                    lang,
                    t,
                  )}
                </Txt>
              </>
            ) : (
              <Txt variant="support">{t.home.noRecord}</Txt>
            )}
          </LastCard>
        </View>

        <View style={styles.quickHeader}>
          <HeartIcon size={13} color={color.inkFaint} />
          <DashedRule style={styles.quickRule} />
          <Txt variant="label" color={color.ink}>
            {t.home.quickAdd}
          </Txt>
          <DashedRule style={styles.quickRule} />
          <HeartIcon size={13} color={color.inkFaint} />
        </View>

        {isNew ? (
          <Txt variant="caption" center style={styles.firstHint}>
            {t.home.firstHint}
          </Txt>
        ) : null}

        <View style={styles.quickRow}>
          <QuickAdd
            label={t.kind.diaper}
            icon={<DiaperIcon size={40} />}
            onPress={() => quickLog('diaper')}
            a11y={t.a11y.quickLog(t.kind.diaper)}
          />
          <QuickAdd
            label={t.kind.feed}
            icon={<BottleIcon size={38} />}
            onPress={() => quickLog('feed')}
            a11y={t.a11y.quickLog(t.kind.feed)}
          />
          <QuickAdd
            label={t.kind.sleep}
            icon={<SleepIcon size={40} />}
            onPress={() => quickLog('sleep')}
            a11y={t.a11y.quickLog(t.kind.sleep)}
          />
        </View>
      </LongScroll>
    </Screen>
  );
}

/* --------------------------------------------------------------- pieces */

function greetingFor(hour: number, t: ReturnType<typeof useApp>['t']) {
  if (hour >= 5 && hour < 11) return t.greeting.morning;
  if (hour >= 11 && hour < 18) return t.greeting.afternoon;
  if (hour >= 18 && hour < 23) return t.greeting.evening;
  return t.greeting.night;
}

function feedDetail(e: Entry, t: ReturnType<typeof useApp>['t'], lang: 'ja' | 'en') {
  const parts: string[] = [];
  if (e.feedKind === 'breast') {
    const total = e.leftSec + e.rightSec;
    if (e.leftSec > 0 && e.rightSec === 0) parts.push(t.feed.left);
    else if (e.rightSec > 0 && e.leftSec === 0) parts.push(t.feed.right);
    if (total > 0) parts.push(formatDuration(total, lang, t));
  }
  if (e.amountMl != null) parts.push(`${e.amountMl}${t.units.ml}`);
  return parts.length ? parts.join(' ・ ') : t.kind.feed;
}

/** A live session shown in place of the last-event value. */
function RunningRow({
  entry,
  label,
  onStop,
  busy,
}: {
  entry: Entry;
  label: string;
  onStop: () => void;
  busy?: boolean;
}) {
  const { t } = useApp();
  const now = useTicker(1000);
  return (
    <View style={styles.runningRow}>
      <View style={styles.runningText}>
        <Txt variant="metric" style={styles.tabular}>
          {stopwatch(elapsedSec(entry, now))}
        </Txt>
        <Txt variant="support">{label}</Txt>
      </View>
      <Press
        disabled={busy}
        onPress={onStop}
        accessibilityRole="button"
        accessibilityLabel={`${label} — ${t.home.stop}`}
        style={styles.stopBtn}
        scale={0.94}
      >
        <StopIcon size={15} color={color.onFill} />
        <Txt variant="caption" color={color.onFill}>
          {t.home.stop}
        </Txt>
      </Press>
    </View>
  );
}

function stopwatch(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

/**
 * The bear acknowledges a save with a single hop.
 *
 * The gate: home is opened dozens of times a day, so it gets no entrance
 * animation at all — this fires only on the `celebration` token changing, which
 * happens once per saved log. Purpose is state indication: the log landed.
 */
function CelebratingBear({ token }: { token: number }) {
  const y = useSharedValue(0);
  const reduced = useReducedMotion();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    y.set(withSequence(withTiming(-9, timings.press), withSpring(0, spring.snap)));
  }, [token, reduced, y]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));

  return (
    <Animated.View style={style}>
      <PeekBear width={132} alive celebration={token} pressable />
    </Animated.View>
  );
}

function QuickAdd({
  label,
  icon,
  onPress,
  a11y,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  a11y: string;
}) {
  return (
    <Press onPress={onPress} accessibilityLabel={a11y} style={styles.quick} scale={0.94}>
      {icon}
      <Txt variant="label">{label}</Txt>
    </Press>
  );
}

function cardA11y(title: string, details: Array<string | null | undefined>) {
  return [title, ...details].filter(Boolean).join(' — ');
}

const QUICK = 104;

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: space.xxxl,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.base,
    marginBottom: space.lg,
    gap: space.sm,
  },
  heroText: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  name: {
    flexShrink: 1,
  },
  age: {
    flexShrink: 0,
  },
  cards: {
    gap: space.md,
  },
  runningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  runningText: {
    flexShrink: 1,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: space.md,
    minHeight: 48,
    borderRadius: radius.pill,
    backgroundColor: color.fill,
  },
  split: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: space.base,
  },
  splitRight: {
    flex: 1,
  },
  quickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.xxl,
    marginBottom: space.lg,
  },
  quickRule: {
    flex: 1,
  },
  firstHint: {
    marginBottom: space.md,
    marginTop: -space.sm,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space.md,
  },
  quick: {
    flex: 1,
    // A circle, not a pill: the width is whatever three of them plus their gaps
    // come to, and the height follows it.
    aspectRatio: 1,
    maxHeight: QUICK,
    borderRadius: radius.pill,
    borderWidth: 1.4,
    borderColor: color.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    backgroundColor: color.bg,
  },
});
