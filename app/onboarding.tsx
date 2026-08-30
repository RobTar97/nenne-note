import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ja as jaLocale, enUS } from 'date-fns/locale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Screen, SCREEN_PADDING } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Press } from '@/components/Press';
import { Rise } from '@/components/Rise';
import { PrimaryButton } from '@/components/Button';
import { Medallion } from '@/components/Surface';
import { PeekBear } from '@/icons/PeekBear';
import {
  BottleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DiaperIcon,
  LockIcon,
  SleepIcon,
  SparkHeartIcon,
} from '@/icons';
import { HIT_TARGET, color, hitSlop as makeHitSlop, radius, shadow, space } from '@/design/tokens';
import { text } from '@/design/type';
import { duration, ease } from '@/design/motion';
import { useTimeline } from '@/design/timeline';
import { useApp } from '@/store/app';
import { createBaby } from '@/db/repo';
import { dayKey, parseDayKey } from '@/utils/time';

/**
 * The welcome cascade, in milliseconds on a single authored clock.
 *
 * One second end to end. The reference welcome screens this was studied against
 * run two to three times longer; that reads as a brand moment, and this app's
 * whole promise is that it gets out of the way — so the cascade is trimmed to
 * the point where it still reads as choreography and no further.
 */
const T = {
  bear: [0, 460],
  title: [180, 520],
  lead: [260, 600],
  card1: [380, 720],
  card2: [460, 800],
  card3: [540, 880],
  cta: [700, 1000],
} as const;

const TIMELINE_MS = 1000;

export default function Onboarding() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const { t, lang, update, haptic } = useApp();

  const [step, setStep] = useState<0 | 1>(0);
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState(() => dayKey(Date.now()));
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);

  const trimmed = name.trim();

  const begin = async () => {
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await createBaby(db, trimmed, birthday);
      await update('onboarded', true);
      haptic.success();
      // The gate in the root layout takes it from here.
    } finally {
      setBusy(false);
    }
  };

  const birthdayLabel =
    lang === 'ja'
      ? format(parseDayKey(birthday), 'yyyy年M月d日', { locale: jaLocale })
      : format(parseDayKey(birthday), 'd MMM yyyy', { locale: enUS });

  return (
    <Screen>
      <Header
        step={step}
        onBack={() => {
          haptic.select();
          setStep(0);
        }}
        lang={lang}
        backLabel={t.common.back}
        onLang={(l) => {
          haptic.select();
          update('language', l);
        }}
        stepLabel={t.onboarding.step(step + 1, 2)}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top}
      >
        <StepFrame step={step}>
          {step === 0 ? (
            <WelcomeStep />
          ) : (
            <ScrollView
              contentContainerStyle={[styles.scroll, styles.setupScroll]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
            >
              <Txt variant="title" center style={styles.setupTitle}>
                {t.onboarding.setupTitle}
              </Txt>
              <Txt variant="support" center style={styles.lead}>
                {t.onboarding.setupLead}
              </Txt>

              <View style={styles.block}>
                <Txt variant="label" style={styles.prompt}>
                  {t.onboarding.namePrompt}
                </Txt>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={t.onboarding.namePlaceholder}
                  placeholderTextColor={color.inkFaint}
                  style={[text.display, styles.nameInput]}
                  maxLength={24}
                  returnKeyType="done"
                  accessibilityLabel={t.onboarding.namePrompt}
                />
              </View>

              <View style={styles.block}>
                <Txt variant="label" style={styles.prompt}>
                  {t.onboarding.birthdayPrompt}
                </Txt>
                <Press
                  style={styles.dateRow}
                  onPress={() => setPicking((p) => !p)}
                  accessibilityLabel={t.onboarding.birthdayPrompt}
                >
                  <Txt variant="label">{birthdayLabel}</Txt>
                  <ChevronRightIcon size={17} color={color.inkFaint} />
                </Press>
                {picking ? (
                  <DateTimePicker
                    value={new Date(parseDayKey(birthday))}
                    mode="date"
                    maximumDate={new Date()}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onValueChange={(_event, date) => {
                      if (Platform.OS !== 'ios') setPicking(false);
                      if (!date) return;
                      setBirthday(dayKey(date.getTime()));
                    }}
                    onDismiss={() => setPicking(false)}
                  />
                ) : null}
              </View>
            </ScrollView>
          )}
        </StepFrame>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.base) }]}>
          {step === 0 ? (
            <PrimaryButton
              label={t.onboarding.begin}
              icon={<SparkHeartIcon size={24} color={color.onFill} />}
              onPress={() => {
                haptic.tap();
                setStep(1);
              }}
            />
          ) : (
            <PrimaryButton
              label={trimmed ? t.onboarding.ready(trimmed) : t.onboarding.begin}
              icon={<SparkHeartIcon size={24} color={color.onFill} />}
              onPress={begin}
              disabled={!trimmed}
              busy={busy}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/* ------------------------------------------------------------------ step 1 */

/**
 * The welcome step.
 *
 * Every element reads its entrance off one clock (`src/design/timeline.ts`), so
 * the cascade is retimed by editing `T` above and nothing else — and under
 * reduced motion the clock starts at the end, which puts the whole screen in
 * its final state on the first frame rather than animating a gentler version.
 */
function WelcomeStep() {
  const { t } = useApp();
  const clock = useTimeline(TIMELINE_MS);

  const cards = [
    {
      icon: <DiaperIcon size={30} />,
      title: t.onboarding.cards.diaperTitle,
      body: t.onboarding.cards.diaperBody,
      window: T.card1,
    },
    {
      icon: <BottleIcon size={28} />,
      title: t.onboarding.cards.feedTitle,
      body: t.onboarding.cards.feedBody,
      window: T.card2,
    },
    {
      icon: <SleepIcon size={30} />,
      title: t.onboarding.cards.sleepTitle,
      body: t.onboarding.cards.sleepBody,
      window: T.card3,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Rise clock={clock} from={T.bear[0]} to={T.bear[1]} distance={10} scaleFrom={0.94}>
        <PeekBear width={188} alive pressable />
      </Rise>

      <Rise clock={clock} from={T.title[0]} to={T.title[1]}>
        <Txt variant="title" center style={styles.welcome}>
          {t.onboarding.welcome}
        </Txt>
      </Rise>

      <Rise clock={clock} from={T.lead[0]} to={T.lead[1]}>
        <Txt variant="support" center style={styles.lead}>
          {t.onboarding.lead}
        </Txt>
      </Rise>

      <View style={styles.cards}>
        {cards.map((c) => (
          <Rise
            key={c.title}
            clock={clock}
            from={c.window[0]}
            to={c.window[1]}
            distance={18}
            style={styles.cardWrap}
          >
            <View style={styles.card}>
              <Medallion size={54}>{c.icon}</Medallion>
              <View style={styles.cardBody}>
                <Txt variant="label">{c.title}</Txt>
                <Txt variant="caption">
                  {c.body}
                </Txt>
              </View>
            </View>
          </Rise>
        ))}
      </View>

      {/* The single most reassuring thing this app can say to a new parent,
          so it is on the first screen rather than buried in a policy. */}
      <Rise clock={clock} from={T.cta[0]} to={T.cta[1]} style={styles.privacy}>
        <View style={styles.privacyRow}>
          <LockIcon size={15} color={color.inkMuted} />
          <Txt variant="caption">{t.onboarding.privacy}</Txt>
        </View>
        <Txt variant="caption" center>
          {t.onboarding.privacyBody}
        </Txt>
      </Rise>
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ chrome */

function Header({
  step,
  onBack,
  lang,
  backLabel,
  onLang,
  stepLabel,
}: {
  step: 0 | 1;
  onBack: () => void;
  lang: 'ja' | 'en';
  backLabel: string;
  onLang: (l: 'ja' | 'en') => void;
  stepLabel: string;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {step > 0 ? (
          <Press
            onPress={onBack}
            accessibilityLabel={backLabel}
            hitSlop={makeHitSlop(40)}
            style={styles.round}
          >
            <ChevronLeftIcon size={20} />
          </Press>
        ) : null}
      </View>

      <Txt
        variant="caption"
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 1, max: 2, now: step + 1, text: stepLabel }}
      >
        {stepLabel}
      </Txt>

      <View style={[styles.headerSide, styles.headerRight]}>
        {(['ja', 'en'] as const).map((l) => {
          const on = lang === l;
          return (
            <Press
              key={l}
              onPress={() => onLang(l)}
              accessibilityState={{ selected: on }}
              accessibilityLabel={l === 'ja' ? '日本語' : 'English'}
              hitSlop={makeHitSlop(32)}
              scale={0.94}
              style={[styles.lang, on ? styles.langOn : null]}
            >
              <Txt variant="caption" color={on ? color.onFill : color.inkMuted}>
                {l === 'ja' ? '日本語' : 'EN'}
              </Txt>
            </Press>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Slides the active step in from the side it came from.
 *
 * A shared value rather than `entering`/`exiting` builders: the outgoing step
 * unmounts immediately (its keyboard and date picker go with it) and only the
 * arriving one animates, which is both simpler to reason about and impossible
 * to leave half-mounted mid-transition.
 */
function StepFrame({ step, children }: { step: number; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const enter = useSharedValue(1);
  const previous = useRef(step);

  const direction = step >= previous.current ? 1 : -1;
  previous.current = step;

  useEffect(() => {
    if (reduced) {
      enter.set(1);
      return;
    }
    enter.set(0);
    enter.set(withTiming(1, { duration: duration.medium, easing: ease.out }));
  }, [step, reduced, enter]);

  const style = useAnimatedStyle(() => ({
    opacity: enter.get(),
    transform: [{ translateX: (1 - enter.get()) * 26 * direction }],
  }));

  return <Animated.View style={[styles.flex, style]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: space.sm,
    minHeight: 48,
  },
  headerSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 92,
  },
  headerRight: {
    justifyContent: 'flex-end',
  },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  scroll: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: space.xl,
    alignItems: 'center',
  },
  setupScroll: {
    paddingBottom: space.xxxl,
  },
  welcome: {
    marginTop: space.base,
  },
  lead: {
    marginTop: space.sm,
  },
  cards: {
    alignSelf: 'stretch',
    marginTop: space.xl,
    gap: space.md,
  },
  privacy: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: space.xl,
    gap: 2,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardWrap: {
    alignSelf: 'stretch',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.base,
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.base,
    ...shadow.card,
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  setupTitle: {
    marginTop: space.xxl,
  },
  block: {
    alignSelf: 'stretch',
  },
  prompt: {
    alignSelf: 'flex-start',
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  nameInput: {
    alignSelf: 'stretch',
    minHeight: HIT_TARGET,
    borderBottomWidth: 1.6,
    borderBottomColor: color.hairline,
    paddingBottom: space.sm,
  },
  dateRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: color.sunken,
    borderRadius: radius.lg,
    paddingHorizontal: space.base,
    minHeight: 60,
  },
  footer: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: space.md,
    backgroundColor: color.bg,
  },
  lang: {
    paddingHorizontal: space.md,
    minHeight: 32,
    borderRadius: radius.pill,
    borderWidth: 1.3,
    borderColor: color.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langOn: {
    backgroundColor: color.fill,
    borderColor: 'transparent',
  },
});
