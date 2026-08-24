import React, { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ja as jaLocale, enUS } from 'date-fns/locale';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import { Screen, Header, SCREEN_PADDING } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Press } from '@/components/Press';
import { Card } from '@/components/Surface';
import { PeekBear } from '@/icons/PeekBear';
import { CheckIcon, ChevronLeftIcon, SparkleIcon } from '@/icons';
import { timings } from '@/design/motion';
import { color, radius, space } from '@/design/tokens';
import { useApp } from '@/store/app';
import { useLive } from '@/db/live';
import { listMilestones, toggleMilestone } from '@/db/repo';
import type { Milestone } from '@/db/types';
import {
  MILESTONE_BANDS,
  MILESTONES,
  bandLabel,
  milestoneLabel,
  type MilestoneDef,
} from '@/data/milestones';

export default function Milestones() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { t, lang, baby, haptic, celebrate } = useApp();
  const [picking, setPicking] = useState<string | null>(null);

  const babyId = baby?.id ?? 0;
  const { data: rows } = useLive<Milestone[]>(
    async (d) => (babyId ? listMilestones(d, babyId) : []),
    [babyId],
    [],
    ['milestone'],
  );

  const achieved = useMemo(
    () => new Map(rows.map((r) => [r.key, r.achievedAt])),
    [rows],
  );

  if (!baby) return <Screen />;

  const toggle = (m: MilestoneDef) => {
    const on = achieved.has(m.key);
    if (on) {
      haptic.select();
      toggleMilestone(db, baby.id, m.key, null);
    } else {
      // A first is a rare, genuinely happy moment — the one place a success
      // haptic and the bear's hop are earned outside of saving a log.
      haptic.success();
      celebrate();
      toggleMilestone(db, baby.id, m.key, Date.now());
    }
  };

  const dateLabel = (ts: number) =>
    lang === 'ja'
      ? format(ts, 'yyyy年M月d日', { locale: jaLocale })
      : format(ts, 'd MMM yyyy', { locale: enUS });

  const pickingAt = picking ? achieved.get(picking) : undefined;

  return (
    <Screen>
      <Header
        title={t.milestones.title}
        subtitle={t.milestones.progress(achieved.size, MILESTONES.length)}
        left={{ icon: <ChevronLeftIcon size={24} />, onPress: () => router.back(), label: t.common.back }}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <PeekBear width={148} eyes={achieved.size > 0 ? 'happy' : 'awake'} alive celebration={achieved.size} pressable />
          <Txt variant="caption" center style={styles.hint}>
            {t.milestones.hint}
          </Txt>
        </View>

        {MILESTONE_BANDS.map((band) => {
          const items = MILESTONES.filter((m) => m.band === band.band);
          if (items.length === 0) return null;
          return (
            <View key={band.band} style={styles.section}>
              <Txt variant="caption" style={styles.sectionTitle}>
                {bandLabel(band, lang)}
              </Txt>
              <Card style={styles.card}>
                {items.map((m, i) => (
                  <React.Fragment key={m.key}>
                    {i > 0 ? <View style={styles.divider} /> : null}
                    <Row
                      label={milestoneLabel(m, lang)}
                      achievedAt={achieved.get(m.key) ?? null}
                      dateLabel={dateLabel}
                      onToggle={() => toggle(m)}
                      onEditDate={() => setPicking(m.key)}
                      editHint={t.milestones.tapDate}
                    />
                  </React.Fragment>
                ))}
              </Card>
            </View>
          );
        })}
      </ScrollView>

      {picking && pickingAt != null ? (
        <DateTimePicker
          value={new Date(pickingAt)}
          mode="date"
          maximumDate={new Date()}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onValueChange={(_event, date) => {
            const key = picking;
            setPicking(null);
            if (!date || !key) return;
            toggleMilestone(db, baby.id, key, date.getTime());
          }}
          onDismiss={() => setPicking(null)}
        />
      ) : null}
    </Screen>
  );
}

/**
 * One milestone.
 *
 * The tick grows from 0.7 rather than appearing, and the label darkens as it
 * lands — this is a moment a parent chose to record, and it is rare enough that
 * a little acknowledgement is the right call rather than noise.
 */
function Row({
  label,
  achievedAt,
  dateLabel,
  onToggle,
  onEditDate,
  editHint,
}: {
  label: string;
  achievedAt: number | null;
  dateLabel: (ts: number) => string;
  onToggle: () => void;
  onEditDate: () => void;
  editHint: string;
}) {
  const on = achievedAt != null;

  /**
   * The box fills from a plain style and only the tick animates.
   *
   * An animated `backgroundColor` is a paint on every frame for a two-state
   * toggle that reads perfectly well as an instant change — and the tick
   * growing in is the part that actually carries the moment.
   */
  const p = useDerivedValue(() => withTiming(on ? 1 : 0, timings.micro), [on]);
  const tick = useAnimatedStyle(() => ({
    opacity: p.get(),
    transform: [{ scale: 0.7 + p.get() * 0.3 }],
  }));

  return (
    <View style={styles.row}>
      <Press
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: on }}
        accessibilityLabel={label}
        style={styles.rowMain}
        scale={0.98}
      >
        <View style={[styles.box, on ? styles.boxOn : null]}>
          <Animated.View style={tick}>
            <CheckIcon size={15} color={color.onFill} penWidth={2.2} />
          </Animated.View>
        </View>
        <Txt variant="label" color={on ? color.ink : color.inkMuted} style={styles.rowLabel}>
          {label}
        </Txt>
      </Press>

      {on && achievedAt != null ? (
        <Press onPress={onEditDate} accessibilityLabel={editHint} style={styles.dateChip} scale={0.94}>
          <SparkleIcon size={11} color={color.inkMuted} />
          <Txt variant="caption">{dateLabel(achievedAt)}</Txt>
        </Press>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: space.xxxl,
  },
  hero: {
    alignItems: 'center',
    marginTop: space.sm,
    marginBottom: space.lg,
  },
  hint: {
    marginTop: space.sm,
  },
  section: {
    marginBottom: space.lg,
  },
  sectionTitle: {
    marginLeft: space.xs,
    marginBottom: space.sm,
  },
  card: {
    paddingVertical: space.xs,
    paddingHorizontal: space.base,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    minHeight: 56,
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    flex: 1,
    paddingVertical: space.sm,
  },
  box: {
    width: 26,
    height: 26,
    borderRadius: 9,
    borderWidth: 1.6,
    borderColor: color.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: {
    backgroundColor: color.fill,
    borderColor: color.fill,
  },
  rowLabel: {
    flexShrink: 1,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: space.md,
    minHeight: 34,
    borderRadius: radius.pill,
    backgroundColor: color.sunken,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: color.hairline,
  },
});
