import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ja as jaLocale, enUS } from 'date-fns/locale';

import { Screen, Header, SCREEN_PADDING } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Press } from '@/components/Press';
import { PrimaryButton } from '@/components/Button';
import { FieldLabel, NoteField } from '@/components/LogFields';
import { ChevronRightIcon, CloseIcon, SparkHeartIcon, TrashIcon } from '@/icons';
import { color, radius, shadow, space } from '@/design/tokens';
import { text } from '@/design/type';
import { useApp } from '@/store/app';
import { useLive } from '@/db/live';
import { createGrowth, deleteGrowth, getGrowth, updateGrowth } from '@/db/repo';
import type { Growth } from '@/db/types';

/**
 * Values are held as strings while editing and only parsed on save.
 *
 * Parsing per keystroke fights the user: "3." is not a number, and coercing it
 * to one would delete the decimal point they just typed.
 */
export default function GrowthLog() {
  const router = useRouter();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const { t, lang, baby, haptic, celebrate } = useApp();
  const params = useLocalSearchParams<{ id?: string }>();

  const editId = params.id ? Number(params.id) : null;

  const { data: existing } = useLive<Growth | null>(
    async (d) => (editId ? getGrowth(d, editId) : null),
    [editId],
    null,
    ['growth'],
  );

  const [measuredAt, setMeasuredAt] = useState(() => Date.now());
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [head, setHead] = useState('');
  const [note, setNote] = useState('');
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load the record into the form exactly once; after that the form is
  // authoritative, or a live-query refresh would overwrite what is being typed.
  if (existing && !hydrated) {
    setHydrated(true);
    setMeasuredAt(existing.measuredAt);
    if (existing.weightG != null) setWeight((existing.weightG / 1000).toFixed(2));
    if (existing.heightMm != null) setHeight((existing.heightMm / 10).toFixed(1));
    if (existing.headMm != null) setHead((existing.headMm / 10).toFixed(1));
    setNote(existing.note ?? '');
  }

  const parse = (v: string) => {
    const n = Number(v.replace(',', '.').trim());
    return v.trim() === '' || !Number.isFinite(n) || n <= 0 ? null : n;
  };

  const weightG = parse(weight) != null ? Math.round(parse(weight)! * 1000) : null;
  const heightMm = parse(height) != null ? Math.round(parse(height)! * 10) : null;
  const headMm = parse(head) != null ? Math.round(parse(head)! * 10) : null;
  const anyValue = weightG != null || heightMm != null || headMm != null;

  const dismiss = () => router.back();

  const save = async () => {
    if (!baby || !anyValue || busy) return;
    setBusy(true);
    try {
      const record = {
        measuredAt,
        weightG,
        heightMm,
        headMm,
        note: note.trim() || null,
      };
      if (existing) await updateGrowth(db, existing.id, record);
      else await createGrowth(db, baby.id, record);
      haptic.success();
      celebrate();
      dismiss();
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    if (!existing) return;
    Alert.alert(t.growth.deleteConfirm, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: async () => {
          await deleteGrowth(db, existing.id);
          haptic.warn();
          dismiss();
        },
      },
    ]);
  };

  if (!baby) return <Screen />;

  const dateLabel =
    lang === 'ja'
      ? format(measuredAt, 'yyyy年M月d日', { locale: jaLocale })
      : format(measuredAt, 'd MMM yyyy', { locale: enUS });

  return (
    <Screen>
      <Header
        title={existing ? t.growth.editTitle : t.growth.addTitle}
        left={
          existing
            ? {
                icon: (
                  <View style={styles.round}>
                    <TrashIcon size={20} />
                  </View>
                ),
                onPress: confirmDelete,
                label: t.common.delete,
              }
            : undefined
        }
        right={{
          icon: (
            <View style={styles.round}>
              <CloseIcon size={19} />
            </View>
          ),
          onPress: dismiss,
          label: t.a11y.close,
        }}
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
          <FieldLabel>{t.growth.measuredOn}</FieldLabel>
          <Press
            style={styles.dateRow}
            onPress={() => setPicking((p) => !p)}
            accessibilityLabel={t.growth.measuredOn}
          >
            <Txt variant="label">{dateLabel}</Txt>
            <ChevronRightIcon size={17} color={color.inkFaint} />
          </Press>
          {picking ? (
            <DateTimePicker
              value={new Date(measuredAt)}
              mode="date"
              maximumDate={new Date()}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onValueChange={(_event, date) => {
                if (Platform.OS !== 'ios') setPicking(false);
                if (!date) return;
                setMeasuredAt(date.getTime());
              }}
              onDismiss={() => setPicking(false)}
            />
          ) : null}

          <Measure
            label={t.growth.weight}
            unit={t.units.kg}
            value={weight}
            onChange={setWeight}
            placeholder="3.20"
          />
          <Measure
            label={t.growth.height}
            unit={t.units.cm}
            value={height}
            onChange={setHeight}
            placeholder="50.0"
          />
          <Measure
            label={t.growth.head}
            unit={t.units.cm}
            value={head}
            onChange={setHead}
            placeholder="34.0"
          />

          <FieldLabel hint={t.common.optional}>{t.log.note}</FieldLabel>
          <NoteField value={note} onChange={setNote} placeholder={t.log.notePlaceholder} />

          {!anyValue ? (
            <Txt variant="caption" center style={styles.hint}>
              {t.growth.needOne}
            </Txt>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.base) }]}>
          <PrimaryButton
            label={t.common.save}
            icon={<SparkHeartIcon size={24} color={color.onFill} />}
            onPress={save}
            disabled={!anyValue}
            busy={busy}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Measure({
  label,
  unit,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <>
      <FieldLabel>{label}</FieldLabel>
      <View style={styles.measureRow}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={color.inkFaint}
          keyboardType="decimal-pad"
          style={[text.metric, styles.measureInput]}
          maxLength={6}
          accessibilityLabel={label}
        />
        <Txt variant="support">{unit}</Txt>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: space.lg,
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: color.sunken,
    borderRadius: radius.lg,
    paddingHorizontal: space.base,
    minHeight: 60,
  },
  measureRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.sm,
    backgroundColor: color.sunken,
    borderRadius: radius.lg,
    paddingHorizontal: space.base,
    paddingVertical: space.md,
  },
  measureInput: {
    flex: 1,
    paddingVertical: space.xs,
  },
  hint: {
    marginTop: space.base,
  },
  footer: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: space.md,
    backgroundColor: color.bg,
  },
});
