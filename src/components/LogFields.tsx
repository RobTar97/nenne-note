import React, { useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { color, radius, space } from '@/design/tokens';
import { text } from '@/design/type';
import { ChevronRightIcon, ClockIcon, PencilIcon, PlusIcon } from '@/icons';
import { formatClock } from '@/utils/time';
import { useApp } from '@/store/app';
import { Press } from './Press';
import { Txt } from './Txt';

/** A section label above a field, as in the mockups. */
export function FieldLabel({ children, hint }: { children: string; hint?: string }) {
  return (
    <View style={styles.labelRow}>
      <Txt variant="label">{children}</Txt>
      {hint ? <Txt variant="caption">（{hint}）</Txt> : null}
    </View>
  );
}

/**
 * The "when" row.
 *
 * Defaults to now and says so, because at 3am the overwhelmingly common case is
 * "this just happened" — the picker exists for the times you're logging after
 * the fact, and it stays one tap away rather than in the way.
 */
export function TimeRow({ value, onChange }: { value: number; onChange: (ts: number) => void }) {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const isNow = Math.abs(Date.now() - value) < 60_000;

  const picker = (
    <DateTimePicker
      value={new Date(value)}
      mode="time"
      is24Hour
      display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
      onValueChange={(_event, date) => {
        if (Platform.OS !== 'ios') setOpen(false);
        if (!date) return;
        // The picker only carries a time; keep it on the same calendar day, and
        // if that lands in the future assume it was yesterday evening.
        const next = new Date(value);
        next.setHours(date.getHours(), date.getMinutes(), 0, 0);
        const ts = next.getTime();
        onChange(ts > Date.now() + 60_000 ? ts - 86_400_000 : ts);
      }}
      onDismiss={() => setOpen(false)}
    />
  );

  return (
    <View>
      <Press style={styles.row} onPress={() => setOpen((o) => !o)} accessibilityLabel={formatClock(value)}>
        <ClockIcon size={21} color={color.inkMuted} />
        <Txt variant="label" style={styles.rowText}>
          {isNow ? `${t.common.now} ・ ${formatClock(value)}` : formatClock(value)}
        </Txt>
        <ChevronRightIcon size={17} color={color.inkFaint} />
      </Press>
      {open && Platform.OS === 'ios' ? <View style={styles.inlinePicker}>{picker}</View> : null}
      {open && Platform.OS !== 'ios' ? picker : null}
    </View>
  );
}

export function NoteField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.row}>
      <PencilIcon size={20} color={color.inkMuted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={color.inkFaint}
        style={[text.label, styles.input]}
        maxLength={140}
        returnKeyType="done"
      />
    </View>
  );
}

const AMOUNT_STEP = 10;
const AMOUNT_MAX = 500;
const PRESETS = [60, 100, 140, 180];

/**
 * Bottle volume.
 *
 * A stepper rather than a text field: it can be driven one-handed with a
 * sleeping baby in the other arm, and it can't produce an invalid number. The
 * presets cover the common pours so most feeds are a single tap.
 */
export function AmountStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { t, haptic } = useApp();

  const step = (delta: number) => {
    const next = Math.max(0, Math.min(AMOUNT_MAX, value + delta));
    if (next === value) return;
    haptic.select();
    onChange(next);
  };

  return (
    <View style={styles.amountWrap}>
      <View style={styles.amountRow}>
        <Press
          onPress={() => step(-AMOUNT_STEP)}
          accessibilityLabel={`-${AMOUNT_STEP}${t.units.ml}`}
          style={styles.stepBtn}
          scale={0.92}
        >
          <View style={styles.minus} />
        </Press>

        <View style={styles.amountValue}>
          <Txt variant="display">{value}</Txt>
          <Txt variant="support" style={styles.amountUnit}>
            {t.units.ml}
          </Txt>
        </View>

        <Press
          onPress={() => step(AMOUNT_STEP)}
          accessibilityLabel={`+${AMOUNT_STEP}${t.units.ml}`}
          style={styles.stepBtn}
          scale={0.92}
        >
          <PlusIcon size={22} />
        </Press>
      </View>

      <View style={styles.presets}>
        {PRESETS.map((p) => {
          const active = p === value;
          return (
            <Press
              key={p}
              onPress={() => {
                if (!active) haptic.select();
                onChange(p);
              }}
              accessibilityLabel={`${p}${t.units.ml}`}
              accessibilityState={{ selected: active }}
              scale={0.94}
              style={[styles.preset, active ? styles.presetOn : null]}
            >
              <Txt variant="caption" color={active ? color.onFill : color.inkMuted}>
                {p}
              </Txt>
            </Press>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: space.md,
    marginTop: space.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.sunken,
    borderRadius: radius.lg,
    paddingHorizontal: space.base,
    minHeight: 60,
  },
  rowText: {
    flex: 1,
  },
  input: {
    flex: 1,
    paddingVertical: space.base,
  },
  inlinePicker: {
    marginTop: space.sm,
    backgroundColor: color.sunken,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  amountWrap: {
    gap: space.md,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: color.sunken,
    borderRadius: radius.lg,
    paddingHorizontal: space.sm,
    paddingVertical: space.md,
  },
  stepBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minus: {
    width: 18,
    height: 1.9,
    borderRadius: 1,
    backgroundColor: color.ink,
  },
  amountValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  amountUnit: {
    marginBottom: 2,
  },
  presets: {
    flexDirection: 'row',
    gap: space.sm,
    justifyContent: 'center',
  },
  preset: {
    minWidth: 58,
    minHeight: 40,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1.4,
    borderColor: color.hairline,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetOn: {
    backgroundColor: color.fill,
    borderColor: 'transparent',
  },
});
