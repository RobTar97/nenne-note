/**
 * The milestone catalogue.
 *
 * Keys are stable identifiers stored in the `milestone` table — renaming one
 * orphans every record that used it, so add new keys rather than editing these.
 *
 * `band` is a loose grouping for the list, not a target. Babies reach these at
 * wildly different times and a parent comparing their child against a schedule
 * is exactly the anxiety this app should not create, so the UI shows the bands
 * as headings and never as "due" or "late".
 */

export type MilestoneBand = 'newborn' | 'early' | 'middle' | 'late';

export type MilestoneDef = {
  key: string;
  ja: string;
  en: string;
  band: MilestoneBand;
};

export const MILESTONE_BANDS: { band: MilestoneBand; ja: string; en: string }[] = [
  { band: 'newborn', ja: '生まれてすぐ', en: 'The first weeks' },
  { band: 'early', ja: '3〜6か月ごろ', en: 'Around 3–6 months' },
  { band: 'middle', ja: '6〜12か月ごろ', en: 'Around 6–12 months' },
  { band: 'late', ja: '1歳ごろ〜', en: 'Around 1 year and beyond' },
];

export const MILESTONES: MilestoneDef[] = [
  { key: 'first_smile', ja: 'はじめての笑顔', en: 'First smile', band: 'newborn' },
  { key: 'first_bath', ja: 'はじめてのおふろ', en: 'First bath', band: 'newborn' },
  { key: 'first_outing', ja: 'はじめてのおでかけ', en: 'First outing', band: 'newborn' },
  { key: 'cord_off', ja: 'へそのおがとれた', en: 'Cord stump came off', band: 'newborn' },

  { key: 'holds_head', ja: '首がすわった', en: 'Holds head up', band: 'early' },
  { key: 'laughs', ja: '声を出して笑った', en: 'First laugh', band: 'early' },
  { key: 'rolls_over', ja: '寝返りができた', en: 'Rolled over', band: 'early' },
  { key: 'first_solids', ja: '離乳食デビュー', en: 'First solid food', band: 'early' },

  { key: 'sits', ja: 'おすわりができた', en: 'Sat up', band: 'middle' },
  { key: 'first_tooth', ja: 'はじめての歯', en: 'First tooth', band: 'middle' },
  { key: 'crawls', ja: 'ハイハイができた', en: 'Crawled', band: 'middle' },
  { key: 'pulls_up', ja: 'つかまり立ちができた', en: 'Pulled up to stand', band: 'middle' },
  { key: 'sleeps_through', ja: '夜通し寝られた', en: 'Slept through the night', band: 'middle' },

  { key: 'first_word', ja: 'はじめてのことば', en: 'First word', band: 'late' },
  { key: 'walks', ja: 'はじめてのあんよ', en: 'First steps', band: 'late' },
  { key: 'first_birthday', ja: '1歳のたんじょうび', en: 'First birthday', band: 'late' },
];

export const milestoneLabel = (m: MilestoneDef, lang: 'ja' | 'en') =>
  lang === 'ja' ? m.ja : m.en;

export const bandLabel = (b: (typeof MILESTONE_BANDS)[number], lang: 'ja' | 'en') =>
  lang === 'ja' ? b.ja : b.en;
