import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';

import { Screen, Header, SCREEN_PADDING } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Press } from '@/components/Press';
import { PrimaryButton } from '@/components/Button';
import { Segmented } from '@/components/Segmented';
import { ChoiceCard } from '@/components/ChoiceCard';
import { AmountStepper, FieldLabel, NoteField, TimeRow } from '@/components/LogFields';
import { PeekBear, PeekBearMini } from '@/icons/PeekBear';
import {
  BottleIcon,
  CloseIcon,
  ChevronLeftIcon,
  DiaperIcon,
  DropIcon,
  PoopIcon,
  SleepIcon,
  SparkHeartIcon,
  StopIcon,
  TimerIcon,
  TrashIcon,
} from '@/icons';
import { color, radius, shadow, space } from '@/design/tokens';
import { ease } from '@/design/motion';
import { useApp } from '@/store/app';
import { useLive } from '@/db/live';
import {
  createEntry,
  deleteEntry,
  elapsedSec,
  getEntry,
  runningEntry,
  setNursingSide,
  startNursing,
  startSleep,
  stopRunning,
  updateEntry,
} from '@/db/repo';
import type { DiaperKind, Entry, EntryKind, Side } from '@/db/types';
import { useTicker } from '@/utils/useTicker';
import { formatDuration } from '@/i18n';

type FeedMode = 'bottle' | 'breast';

/**
 * Switching type swaps the entire field block. Without a transition the new
 * fields snap in and the change reads as a glitch rather than as a response.
 *
 * Opacity only, deliberately: the block's height genuinely differs between
 * types, and animating that would run a layout pass for the whole scroll view
 * on every frame. The height lands at once and the content fades onto it —
 * honest about what actually moved, and free.
 *
 * Built at module scope; a builder rebuilt in render costs on every keystroke
 * in the note field.
 */
const FIELDS_IN = FadeIn.duration(160).easing(ease.out).reduceMotion(ReduceMotion.System);

export default function LogScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { t, lang, baby, haptic, celebrate } = useApp();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ kind?: string; id?: string }>();

  const editId = params.id ? Number(params.id) : null;
  const babyId = baby?.id ?? 0;

  const { data: existing } = useLive<Entry | null>(
    async (d) => (editId ? getEntry(d, editId) : null),
    [editId],
    null,
    ['entry'],
  );
  const { data: running } = useLive<Entry | null>(
    async (d) => (babyId ? runningEntry(d, babyId) : null),
    [babyId],
    null,
    ['entry'],
  );

  const [kind, setKind] = useState<EntryKind>(
    params.kind === 'feed' || params.kind === 'sleep' ? params.kind : 'diaper',
  );
  const [diaperKind, setDiaperKind] = useState<DiaperKind>('pee');
  const [feedMode, setFeedMode] = useState<FeedMode>('bottle');
  const [side, setSide] = useState<Side>('left');
  const [amount, setAmount] = useState(120);
  const [when, setWhen] = useState(() => Date.now());
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Pull an existing log into the form exactly once; after that the form is
  // authoritative, or typing would be overwritten by the live query refreshing.
  if (existing && !hydrated) {
    setHydrated(true);
    setKind(existing.kind);
    if (existing.diaperKind) setDiaperKind(existing.diaperKind);
    if (existing.feedKind === 'breast') setFeedMode('breast');
    if (existing.amountMl != null) setAmount(existing.amountMl);
    setWhen(existing.startedAt);
    setNote(existing.note ?? '');
  }

  const editing = !!existing;
  const showLive = !editing && !!running && running.kind === kind;

  const segments = useMemo(
    () => [
      { value: 'diaper' as const, label: t.kind.diaper, icon: <DiaperIcon size={30} /> },
      { value: 'feed' as const, label: t.kind.feed, icon: <BottleIcon size={28} /> },
      { value: 'sleep' as const, label: t.kind.sleep, icon: <SleepIcon size={30} /> },
    ],
    [t],
  );

  const dismiss = () => router.back();

  const confirmDelete = () => {
    if (!existing) return;
    Alert.alert(t.log.deleteConfirm, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: async () => {
          await deleteEntry(db, existing.id);
          haptic.warn();
          dismiss();
        },
      },
    ]);
  };

  /* -------------------------------------------------------------- actions */

  const save = async () => {
    if (!babyId || busy) return;
    setBusy(true);
    try {
      if (existing) {
        /**
         * Editing touches only the fields the form actually showed for *this*
         * entry's kind.
         *
         * Reusing the create payload here would be silent data loss: it writes
         * `endedAt = startedAt`, which collapses a nap or a nursing session to
         * zero length, and `feedKind: 'bottle'`, which rewrites a nursing entry
         * as a bottle with an invented volume. A parent correcting the time on
         * last night's nap must not lose the nap.
         */
        const patch: Parameters<typeof updateEntry>[2] = {
          startedAt: when,
          note: note.trim() || null,
        };
        if (existing.kind === 'diaper') patch.diaperKind = diaperKind;
        if (existing.kind === 'feed' && existing.feedKind === 'bottle') patch.amountMl = amount;
        await updateEntry(db, existing.id, patch);
      } else {
        await createEntry(db, babyId, {
          kind,
          startedAt: when,
          // A diaper or a bottle is an instant, so it starts and ends together.
          // Sessions never reach this path — they go through `beginTimer`.
          endedAt: when,
          note: note.trim() || null,
          diaperKind: kind === 'diaper' ? diaperKind : null,
          feedKind: kind === 'feed' ? ('bottle' as const) : null,
          amountMl: kind === 'feed' ? amount : null,
        });
      }

      haptic.success();
      celebrate();
      dismiss();
    } finally {
      setBusy(false);
    }
  };

  const beginTimer = async () => {
    if (!babyId || busy) return;
    setBusy(true);
    try {
      // Only one session runs at a time: a baby cannot be asleep and nursing at
      // once, so starting one closes the other at this moment rather than
      // leaving two open sessions to reconcile later.
      if (running) await stopRunning(db, running);
      if (kind === 'sleep') await startSleep(db, babyId, when);
      else await startNursing(db, babyId, side, when);
      haptic.commit();
      dismiss();
    } finally {
      setBusy(false);
    }
  };

  if (!baby) return <Screen />;

  /* ---------------------------------------------------------------- view */

  const isTimerFlow = !editing && (kind === 'sleep' || (kind === 'feed' && feedMode === 'breast'));

  return (
    <Screen>
      <Header
        title={editing ? t.log.editTitle : t.log.title}
        left={
          editing
            ? { icon: <RoundIcon><TrashIcon size={20} /></RoundIcon>, onPress: confirmDelete, label: t.common.delete }
            : { icon: <RoundIcon><ChevronLeftIcon size={20} /></RoundIcon>, onPress: dismiss, label: t.common.back }
        }
        right={{ icon: <RoundIcon><CloseIcon size={19} /></RoundIcon>, onPress: dismiss, label: t.a11y.close }}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 8}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bear}>
            <PeekBear width={168} eyes={showLive ? 'happy' : 'awake'} />
          </View>

          {!editing ? (
            <Segmented options={segments} value={kind} onChange={setKind} onHaptic={haptic.select} />
          ) : null}

          <Animated.View key={showLive ? 'live' : `${kind}-${feedMode}`} entering={FIELDS_IN}>
          {showLive && running ? (
            <LiveSession entry={running} />
          ) : (
            <>
              {kind === 'diaper' ? (
                <>
                  <FieldLabel>{t.log.what}</FieldLabel>
                  <View style={styles.choices}>
                    <ChoiceCard
                      label={t.diaper.pee}
                      icon={<DropIcon size={34} />}
                      selected={diaperKind === 'pee'}
                      onPress={() => setDiaperKind('pee')}
                      onHaptic={haptic.select}
                    />
                    <ChoiceCard
                      label={t.diaper.poop}
                      icon={<PoopIcon size={34} />}
                      selected={diaperKind === 'poop'}
                      onPress={() => setDiaperKind('poop')}
                      onHaptic={haptic.select}
                    />
                    <ChoiceCard
                      label={t.diaper.both}
                      icon={
                        <View style={styles.bothIcon}>
                          <DropIcon size={26} />
                          <Txt variant="support">+</Txt>
                          <PoopIcon size={26} />
                        </View>
                      }
                      selected={diaperKind === 'both'}
                      onPress={() => setDiaperKind('both')}
                      onHaptic={haptic.select}
                    />
                  </View>
                </>
              ) : null}

              {kind === 'feed' && !editing ? (
                <>
                  <FieldLabel>{t.log.what}</FieldLabel>
                  <View style={styles.duo}>
                    <ChoiceCard
                      label={t.feed.bottle}
                      icon={<BottleIcon size={32} />}
                      selected={feedMode === 'bottle'}
                      onPress={() => setFeedMode('bottle')}
                      onHaptic={haptic.select}
                    />
                    <ChoiceCard
                      label={t.feed.breast}
                      icon={<TimerIcon size={32} />}
                      selected={feedMode === 'breast'}
                      onPress={() => setFeedMode('breast')}
                      onHaptic={haptic.select}
                    />
                  </View>
                </>
              ) : null}

              {kind === 'feed' && feedMode === 'bottle' ? (
                <>
                  <FieldLabel>{t.feed.amount}</FieldLabel>
                  <AmountStepper value={amount} onChange={setAmount} />
                </>
              ) : null}

              {kind === 'feed' && feedMode === 'breast' && !editing ? (
                <>
                  <FieldLabel>{t.feed.side}</FieldLabel>
                  <View style={styles.duo}>
                    <ChoiceCard
                      label={t.feed.left}
                      icon={<SideMark side="left" />}
                      selected={side === 'left'}
                      onPress={() => setSide('left')}
                      onHaptic={haptic.select}
                    />
                    <ChoiceCard
                      label={t.feed.right}
                      icon={<SideMark side="right" />}
                      selected={side === 'right'}
                      onPress={() => setSide('right')}
                      onHaptic={haptic.select}
                    />
                  </View>
                </>
              ) : null}

              <FieldLabel>{t.log.when}</FieldLabel>
              <TimeRow value={when} onChange={setWhen} />

              <FieldLabel hint={t.common.optional}>{t.log.note}</FieldLabel>
              <NoteField value={note} onChange={setNote} placeholder={t.log.notePlaceholder} />
            </>
          )}
          </Animated.View>

        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.base) }]}>
          {/* Lives in the footer rather than at the end of the scroll content so
              the scroll position can never clip it in half. */}
          <View style={styles.footerBear}>
            <PeekBearMini width={84} color={color.inkFaint} />
          </View>
          {showLive && running ? (
            <PrimaryButton
              label={t.common.stop}
              icon={<StopIcon size={20} color={color.onFill} />}
              onPress={async () => {
                await stopRunning(db, running);
                haptic.commit();
                celebrate();
                dismiss();
              }}
              busy={busy}
            />
          ) : isTimerFlow ? (
            <PrimaryButton
              label={kind === 'sleep' ? t.log.startSleep : t.log.startNursing}
              icon={<TimerIcon size={22} color={color.onFill} />}
              onPress={beginTimer}
              busy={busy}
            />
          ) : (
            <PrimaryButton
              label={t.common.save}
              icon={<SparkHeartIcon size={24} color={color.onFill} />}
              onPress={save}
              busy={busy}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/* --------------------------------------------------------------- pieces */

function RoundIcon({ children }: { children: React.ReactNode }) {
  return <View style={styles.round}>{children}</View>;
}

/** A left/right mark for the nursing side, drawn from the type scale. */
function SideMark({ side }: { side: Side }) {
  return (
    <View style={[styles.sideMark, side === 'right' ? styles.sideMarkRight : null]}>
      <View style={styles.sideDot} />
    </View>
  );
}

/**
 * A running nursing or sleep session.
 *
 * The elapsed readout re-renders once a second — a second is not a frame, and
 * confining the tick to this component means nothing else on the screen
 * re-renders with it.
 */
function LiveSession({ entry }: { entry: Entry }) {
  const db = useSQLiteContext();
  const { t, lang, haptic } = useApp();
  const now = useTicker(1000);
  const seconds = elapsedSec(entry, now);

  return (
    <View style={styles.live}>
      <Txt variant="support" center>
        {entry.kind === 'sleep' ? t.home.sleeping : t.feed.nursing}
      </Txt>
      <Txt variant="display" center style={styles.liveClock}>
        {formatStopwatch(seconds)}
      </Txt>

      {entry.kind === 'feed' ? (
        <View style={styles.liveSides}>
          {(['left', 'right'] as const).map((s) => {
            const active = entry.activeSide === s;
            const accrued = s === 'left' ? entry.leftSec : entry.rightSec;
            return (
              <Press
                key={s}
                onPress={() => {
                  haptic.select();
                  setNursingSide(db, entry, active ? null : s);
                }}
                accessibilityState={{ selected: active }}
                accessibilityLabel={s === 'left' ? t.feed.left : t.feed.right}
                style={[styles.sideBtn, active ? styles.sideBtnOn : null]}
                scale={0.95}
              >
                <Txt variant="label" color={active ? color.onFill : color.ink}>
                  {s === 'left' ? t.feed.left : t.feed.right}
                </Txt>
                <Txt variant="caption" color={active ? color.onFill : color.inkMuted}>
                  {formatDuration(accrued, lang, t)}
                </Txt>
              </Press>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function formatStopwatch(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: space.lg,
  },
  bear: {
    alignItems: 'center',
    marginTop: space.sm,
    marginBottom: space.lg,
  },
  choices: {
    flexDirection: 'row',
    gap: space.sm,
  },
  duo: {
    flexDirection: 'row',
    gap: space.md,
  },
  bothIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  footer: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: space.md,
    backgroundColor: color.bg,
  },
  footerBear: {
    alignItems: 'center',
    marginBottom: space.xs,
  },
  live: {
    marginTop: space.xl,
    gap: space.xs,
  },
  liveClock: {
    fontVariant: ['tabular-nums'],
  },
  liveSides: {
    flexDirection: 'row',
    gap: space.md,
    marginTop: space.lg,
  },
  sideBtn: {
    flex: 1,
    minHeight: 68,
    borderRadius: radius.lg,
    borderWidth: 1.4,
    borderColor: color.hairline,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  sideBtnOn: {
    backgroundColor: color.fill,
    borderColor: 'transparent',
  },
  sideMark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.7,
    borderColor: color.ink,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  sideMarkRight: {
    alignItems: 'flex-end',
  },
  sideDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: color.ink,
  },
});
