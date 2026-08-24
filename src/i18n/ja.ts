/**
 * 日本語 — the app's primary language.
 *
 * Written natively, not translated from the English mockups. Register is warm
 * and plain (です/ます is dropped in labels, kept in full sentences), kanji for
 * content words (授乳・記録・設定) and hiragana for the soft nursery words
 * (おむつ・ねんね・おしっこ) — which is how Japanese parenting apps actually read.
 */
export const ja = {
  common: {
    save: '記録する',
    cancel: 'キャンセル',
    delete: '削除',
    close: 'とじる',
    back: 'もどる',
    done: '完了',
    edit: '編集',
    today: '今日',
    now: 'いま',
    all: 'すべて',
    none: 'まだありません',
    optional: '任意',
    start: 'はじめる',
    stop: 'おわり',
    pause: '一時停止',
    resume: 'さいかい',
  },

  kind: {
    diaper: 'おむつ',
    feed: '授乳',
    sleep: 'ねんね',
  },

  diaper: {
    pee: 'おしっこ',
    poop: 'うんち',
    both: '両方',
  },

  feed: {
    bottle: 'ミルク',
    breast: '母乳',
    solid: 'りにゅう食',
    left: '左',
    right: '右',
    amount: 'りょう',
    side: 'どちら',
    nursing: '授乳中',
  },

  greeting: {
    morning: 'おはよう',
    afternoon: 'こんにちは',
    evening: 'こんばんは',
    night: 'おつかれさま',
  },

  caregiver: {
    mama: 'ママ',
    papa: 'パパ',
    none: '',
  },

  home: {
    title: 'ねんねノート',
    ageDays: (n: number) => `生後${n}日`,
    ageMonths: (m: number, d: number) => (d > 0 ? `${m}か月${d}日` : `${m}か月`),
    lastDiaper: 'さいごのおむつ',
    lastFeed: 'さいごの授乳',
    lastSleep: 'さいごのねんね',
    quickAdd: 'さっと記録',
    noRecord: 'まだ記録がありません',
    sleeping: 'ねんね中',
    nursing: '授乳中',
    tapToStop: 'タップしておわり',
  },

  log: {
    title: '記録',
    editTitle: '記録をなおす',
    what: 'どうだった？',
    when: 'いつ？',
    note: 'メモ',
    notePlaceholder: 'メモをのこす',
    saved: '記録しました',
    amountPlaceholder: '120',
    ml: 'ml',
    startNursing: '授乳をはじめる',
    startSleep: 'ねんねをはじめる',
    running: 'すすんでいます',
    deleteConfirm: 'この記録を削除しますか？',
  },

  today: {
    title: '今日',
    empty: 'まだ今日の記録はありません',
    emptyHint: '下のボタンから記録できます',
    encouragement: (who: string) => (who ? `今日もよくがんばってるね、${who}` : '今日もよくがんばってるね'),
  },

  summary: {
    title: '今日のまとめ',
    subtitle: (name: string) => `${name}・今日`,
    diaperTitle: 'おむつ',
    feedTitle: '授乳',
    sleepTitle: 'ねんね',
    totalFeeds: '授乳回数',
    lastFeeding: '最後の授乳',
    totalSleep: 'ねんね合計',
    lastNap: '最後のねんね',
    todaySuffix: '今日',
    times: (n: number) => `${n}回`,
    allGood: '今日もいいかんじ',
    quiet: 'まだ静かな一日',
  },

  stats: {
    title: 'きろくのながれ',
    week: '7日間',
    month: '30日間',
    feedsPerDay: '1日の授乳',
    sleepPerDay: '1日のねんね',
    diapersPerDay: '1日のおむつ',
    rhythm: 'この子のリズム',
    feedGap: '授乳のかんかく',
    napLength: 'おひるねのながさ',
    nextFeed: 'つぎの授乳のめやす',
    notEnough: 'あと数日記録すると、リズムが見えてきます',
    aroundTime: (t: string) => `${t}ごろ`,
    everyMinutes: (m: number) => (m >= 60 ? `${Math.floor(m / 60)}時間${m % 60 || ''}${m % 60 ? '分' : ''}おき` : `${m}分おき`),
  },

  growth: {
    title: 'せいちょう',
    weight: 'たいじゅう',
    height: 'しんちょう',
    head: 'あたま',
    add: '記録をふやす',
    addTitle: 'せいちょうの記録',
    editTitle: '記録をなおす',
    empty: 'まだ記録がありません',
    emptyHint: 'たいじゅうやしんちょうを記録すると、\nここにグラフが出ます',
    latest: 'さいしん',
    sincePrev: (v: string) => `まえの記録から ${v}`,
    measuredOn: 'いつ？',
    deleteConfirm: 'この記録を削除しますか？',
    needOne: 'どれかひとつ入力してください',
    noReference: '成長曲線（パーセンタイル）は入っていません。心配なことは小児科でご相談ください。',
  },

  milestones: {
    title: 'はじめて',
    progress: (n: number, total: number) => `${n} / ${total}`,
    hint: 'タップして記録できます',
    tapDate: '日づけをなおす',
  },

  reminders: {
    section: 'おしらせ',
    feed: '授乳のリマインダー',
    feedHint: 'かんかく',
    every: (m: number) =>
      m % 60 === 0 ? `${m / 60}時間` : `${Math.floor(m / 60)}時間${m % 60}分`,
    timer: 'タイマーの止め忘れ',
    timerHint: '4時間つづいたらおしらせします',
    denied: '通知がオフになっています。端末の設定からオンにしてください。',
    unavailable: 'この環境では通知を使えません。',
    feedTitle: 'そろそろ授乳かな？',
    feedBody: (name: string, since: string) => `${name}のさいごの授乳から${since}たちました`,
    timerTitle: 'タイマーが動いています',
    timerBody: (kind: string) => `${kind}のタイマーがずっと動いています。とめ忘れていませんか？`,
  },

  settings: {
    title: '設定',
    babySection: 'あかちゃん',
    name: 'なまえ',
    birthday: 'たんじょうび',
    appSection: 'アプリ',
    language: '言語',
    haptics: '振動フィードバック',
    callMe: 'よびかた',
    dataSection: 'データ',
    reset: 'すべての記録を消す',
    resetConfirm: 'すべての記録を消します。もとにもどせません。',
    about: 'このアプリについて',
    version: 'バージョン',
  },

  onboarding: {
    welcome: 'ねんねノートへ',
    lead: 'おむつ・授乳・ねんねを\nさっと記録できます',
    namePrompt: 'あかちゃんのなまえは？',
    namePlaceholder: 'なまえ',
    birthdayPrompt: 'たんじょうびは？',
    ready: (name: string) => `${name}の記録をはじめよう`,
    next: 'つぎへ',
    begin: 'はじめる',
    setupTitle: 'あかちゃんのこと',
    setupLead: 'あとから設定でかえられます',
    step: (n: number, total: number) => `${n} / ${total}`,
    cards: {
      diaperTitle: 'おむつ',
      diaperBody: 'おしっこも うんちも ワンタップ',
      feedTitle: '授乳',
      feedBody: 'ミルクの量も 母乳の時間も',
      sleepTitle: 'ねんね',
      sleepBody: 'タイマーで ねむった時間を記録',
    },
  },

  units: {
    hour: '時間',
    minute: '分',
    second: '秒',
    ml: 'ml',
    kg: 'kg',
    cm: 'cm',
  },

  a11y: {
    settings: '設定をひらく',
    home: 'ホームにもどる',
    summary: '今日のまとめをひらく',
    close: 'とじる',
    quickLog: (kind: string) => `${kind}を記録する`,
  },
};

export type Dictionary = typeof ja;
