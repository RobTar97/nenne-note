import React from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen, Header, SCREEN_PADDING } from '@/components/Screen';
import { LongScroll } from '@/components/LongScroll';
import { Txt } from '@/components/Txt';
import { CardPress } from '@/components/Surface';
import { PeekBear } from '@/icons/PeekBear';
import { ChevronLeftIcon, ChevronRightIcon, HeartIcon, SparkHeartIcon } from '@/icons';
import { color, space } from '@/design/tokens';
import { useApp } from '@/store/app';
import { activeSupportLinks, type SupportLinkKey } from '@/data/support';

/**
 * Supporting the project.
 *
 * Deliberately a quiet room rather than a sales page: it is reached only from
 * a Settings row, it never interrupts, and it says plainly that everything
 * stays free either way. An app a parent opens at 3am has not earned the right
 * to ask them for anything mid-task.
 */
export default function Support() {
  const router = useRouter();
  const { t, haptic } = useApp();
  const links = activeSupportLinks();

  const open = async (url: string) => {
    haptic.tap();
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(t.support.openFail, url);
    }
  };

  const label: Record<SupportLinkKey, string> = {
    kofi: t.support.kofi,
    github: t.support.github,
    bmc: t.support.bmc,
  };

  return (
    <Screen>
      <Header
        title={t.support.title}
        left={{
          icon: <ChevronLeftIcon size={24} />,
          onPress: () => router.back(),
          label: t.common.back,
        }}
      />

      <LongScroll backToTopLabel={t.common.backToTop} contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <PeekBear width={156} alive pressable />
        </View>

        <Txt variant="support" center style={styles.lead}>
          {t.support.lead}
        </Txt>
        <Txt variant="caption" center style={styles.body}>
          {t.support.body}
        </Txt>

        <View style={styles.links}>
          {links.map((l) => (
            <CardPress
              key={l.key}
              onPress={() => open(l.url)}
              accessibilityRole="link"
              accessibilityLabel={label[l.key]}
              style={styles.row}
            >
              <HeartIcon size={17} color={color.ink} />
              <Txt variant="label" style={styles.rowLabel}>
                {label[l.key]}
              </Txt>
              <ChevronRightIcon size={16} color={color.inkFaint} />
            </CardPress>
          ))}
        </View>

        <View style={styles.footer}>
          <SparkHeartIcon size={26} />
          <Txt variant="caption" center style={styles.thanks}>
            {t.support.thanks}
          </Txt>
        </View>
      </LongScroll>
    </Screen>
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
  lead: {
    marginBottom: space.sm,
  },
  body: {
    marginBottom: space.xl,
  },
  links: {
    gap: space.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.base,
    paddingHorizontal: space.base,
  },
  rowLabel: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: space.xxl,
    gap: space.sm,
  },
  thanks: {
    marginTop: 2,
  },
});
