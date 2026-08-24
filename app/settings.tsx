import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ja as jaLocale, enUS } from 'date-fns/locale';
import Constants from 'expo-constants';

import { Screen, Header, SCREEN_PADDING } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Press } from '@/components/Press';
import { Card } from '@/components/Surface';
import { ChevronLeftIcon, ChevronRightIcon, GlobeIcon, GrowthIcon, SparkleIcon } from '@/icons';
import { color, radius, space } from '@/design/tokens';
import { text } from '@/design/type';
import { useApp } from '@/store/app';
import { updateBaby, wipeAll } from '@/db/repo';
import { dayKey, parseDayKey } from '@/utils/time';
import { FEED_INTERVALS, type Caregiver } from '@/db/types';
import { remindersAvailable, requestPermission } from '@/notifications/reminders';

export default function Settings() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { t, lang, baby, settings, update, haptic } = useApp();

  const [name, setName] = useState(baby?.name ?? '');
  const [pickingDate, setPickingDate] = useState(false);

  if (!baby) return <Screen />;

  const commitName = () => {
    const next = name.trim();
    if (!next || next === baby.name) {
      setName(baby.name);
      return;
    }
    updateBaby(db, baby.id, next, baby.birthday);
  };

  const birthdayLabel =
    lang === 'ja'
      ? format(parseDayKey(baby.birthday), 'yyyy年M月d日', { locale: jaLocale })
      : format(parseDayKey(baby.birthday), 'd MMM yyyy', { locale: enUS });

  /**
   * Permission is requested at the moment the user asks for the reminder, not
   * at launch: a prompt that arrives before anyone has expressed interest is
   * the fastest route to a permanent denial, and a denial cannot be undone
   * from inside the app.
   */
  const enableReminder = async (key: 'remindFeed' | 'remindTimer', on: boolean) => {
    if (!on) {
      update(key, false);
      return;
    }
    if (!remindersAvailable()) {
      haptic.warn();
      Alert.alert(t.reminders.unavailable);
      return;
    }
    const granted = await requestPermission();
    if (!granted) {
      haptic.warn();
      Alert.alert(t.reminders.denied);
      return;
    }
    haptic.tap();
    update(key, true);
  };

  const confirmReset = () => {
    Alert.alert(t.settings.reset, t.settings.resetConfirm, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: async () => {
          await wipeAll(db);
          await update('onboarded', false);
          haptic.warn();
        },
      },
    ]);
  };

  return (
    <Screen>
      <Header
        title={t.settings.title}
        left={{ icon: <ChevronLeftIcon size={24} />, onPress: () => router.back(), label: t.common.back }}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Section title={t.settings.babySection}>
          <Row label={t.settings.name}>
            <TextInput
              value={name}
              onChangeText={setName}
              onBlur={commitName}
              onSubmitEditing={commitName}
              style={[text.label, styles.input]}
              textAlign="right"
              maxLength={24}
              returnKeyType="done"
              accessibilityLabel={t.settings.name}
            />
          </Row>
          <Divider />
          <Press
            style={styles.row}
            onPress={() => setPickingDate((v) => !v)}
            accessibilityLabel={t.settings.birthday}
          >
            <Txt variant="label">{t.settings.birthday}</Txt>
            <View style={styles.rowRight}>
              <Txt variant="support">{birthdayLabel}</Txt>
              <ChevronRightIcon size={16} color={color.inkFaint} />
            </View>
          </Press>
          {pickingDate ? (
            <DateTimePicker
              value={new Date(parseDayKey(baby.birthday))}
              mode="date"
              maximumDate={new Date()}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onValueChange={(_event, date) => {
                if (Platform.OS !== 'ios') setPickingDate(false);
                if (!date) return;
                updateBaby(db, baby.id, baby.name, dayKey(date.getTime()));
              }}
              onDismiss={() => setPickingDate(false)}
            />
          ) : null}
          <Divider />
          <Link
            label={t.growth.title}
            icon={<GrowthIcon size={20} color={color.inkMuted} />}
            onPress={() => router.push('/growth')}
          />
          <Divider />
          <Link
            label={t.milestones.title}
            icon={<SparkleIcon size={16} color={color.inkMuted} />}
            onPress={() => router.push('/milestones')}
          />
        </Section>

        <Section title={t.settings.appSection}>
          <Row label={t.settings.language} icon={<GlobeIcon size={20} color={color.inkMuted} />}>
            <Choices
              value={settings.language}
              options={[
                { value: 'ja' as const, label: '日本語' },
                { value: 'en' as const, label: 'English' },
              ]}
              onChange={(v) => {
                haptic.select();
                update('language', v);
              }}
            />
          </Row>
          <Divider />
          <Row label={t.settings.callMe}>
            <Choices
              value={settings.caregiver}
              options={[
                { value: 'mama' as Caregiver, label: t.caregiver.mama || 'Mama' },
                { value: 'papa' as Caregiver, label: t.caregiver.papa || 'Papa' },
                { value: 'none' as Caregiver, label: lang === 'ja' ? 'なし' : 'Off' },
              ]}
              onChange={(v) => {
                haptic.select();
                update('caregiver', v);
              }}
            />
          </Row>
          <Divider />
          <Row label={t.settings.haptics}>
            <Switch
              value={settings.haptics}
              onValueChange={(v) => {
                // Fire the feedback as it turns on, so the setting demonstrates itself.
                if (v) haptic.tap();
                update('haptics', v);
              }}
              trackColor={{ false: color.hairline, true: color.ink }}
              thumbColor={color.surface}
              ios_backgroundColor={color.hairline}
            />
          </Row>
        </Section>

        <Section title={t.reminders.section}>
          <Row label={t.reminders.feed}>
            <Switch
              value={settings.remindFeed}
              onValueChange={(v) => enableReminder('remindFeed', v)}
              trackColor={{ false: color.hairline, true: color.ink }}
              thumbColor={color.surface}
              ios_backgroundColor={color.hairline}
            />
          </Row>
          {settings.remindFeed ? (
            <>
              <Divider />
              <Row label={t.reminders.feedHint}>
                <Choices
                  value={String(settings.remindFeedMin)}
                  options={FEED_INTERVALS.map((m) => ({
                    value: String(m),
                    label: t.reminders.every(m),
                  }))}
                  onChange={(v) => {
                    haptic.select();
                    update('remindFeedMin', Number(v));
                  }}
                />
              </Row>
            </>
          ) : null}
          <Divider />
          <Row label={t.reminders.timer}>
            <Switch
              value={settings.remindTimer}
              onValueChange={(v) => enableReminder('remindTimer', v)}
              trackColor={{ false: color.hairline, true: color.ink }}
              thumbColor={color.surface}
              ios_backgroundColor={color.hairline}
            />
          </Row>
          <Txt variant="caption" style={styles.sectionNote}>
            {t.reminders.timerHint}
          </Txt>
        </Section>

        <Section title={t.settings.dataSection}>
          <Press style={styles.row} onPress={confirmReset} accessibilityLabel={t.settings.reset}>
            <Txt variant="label">{t.settings.reset}</Txt>
            <ChevronRightIcon size={16} color={color.inkFaint} />
          </Press>
        </Section>

        <View style={styles.about}>
          <Txt variant="caption" center>
            {t.settings.version} {Constants.expoConfig?.version ?? '1.0.0'}
          </Txt>
        </View>
      </ScrollView>
    </Screen>
  );
}

/* --------------------------------------------------------------- pieces */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Txt variant="caption" style={styles.sectionTitle}>
        {title}
      </Txt>
      <Card style={styles.card}>{children}</Card>
    </View>
  );
}

function Row({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        {icon}
        <Txt variant="label">{label}</Txt>
      </View>
      <View style={styles.rowRight}>{children}</View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

/** A settings row that navigates somewhere. */
function Link({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Press style={styles.row} onPress={onPress} accessibilityLabel={label}>
      <View style={styles.rowLeft}>
        {icon}
        <Txt variant="label">{label}</Txt>
      </View>
      <ChevronRightIcon size={16} color={color.inkFaint} />
    </Press>
  );
}

/** A compact inline choice group for settings that have two or three options. */
function Choices<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.choices}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Press
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityState={{ selected: on }}
            accessibilityLabel={o.label}
            scale={0.94}
            style={[styles.choice, on ? styles.choiceOn : null]}
          >
            <Txt variant="caption" color={on ? color.onFill : color.inkMuted}>
              {o.label}
            </Txt>
          </Press>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: space.base,
    paddingBottom: space.xxxl,
  },
  section: {
    marginBottom: space.xl,
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
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexShrink: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexShrink: 1,
  },
  input: {
    minWidth: 120,
    paddingVertical: space.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: color.hairline,
  },
  choices: {
    flexDirection: 'row',
    gap: 6,
  },
  choice: {
    paddingHorizontal: space.md,
    minHeight: 34,
    borderRadius: radius.pill,
    borderWidth: 1.3,
    borderColor: color.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceOn: {
    backgroundColor: color.fill,
    borderColor: 'transparent',
  },
  about: {
    marginTop: space.base,
  },
  sectionNote: {
    paddingBottom: space.md,
    paddingTop: space.xs,
  },
});
