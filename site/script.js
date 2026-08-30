(() => {
  'use strict';

  const translations = {
    ja: {
      metaTitle: 'ねんねノート — 片手で使える赤ちゃんの記録',
      metaDescription: 'ねんねノートは、おむつ・授乳・ねんねを2タップで記録できる、端末保存の赤ちゃんログです。',
      skip: '本文へ',
      brandName: 'ねんねノート',
      brandAlt: 'ねんねノートのロゴ',
      navLabel: 'メインメニュー',
      navHow: '使い方',
      navScreens: '画面',
      navPrivacy: 'プライバシー',
      navFaq: 'よくある質問',
      github: 'GitHub',
      toggle: 'English',
      toggleLabel: '英語に切り替える',
      eyebrow: 'ねんねノート / NENNE NOTE',
      heroTitle: '片手で、さっと残せる\n赤ちゃんの記録',
      heroLead: 'おむつ・授乳・ねんねを、夜中でも2タップで。アカウントも通信もありません。',
      heroPrimary: '使い方を見る',
      heroSecondary: 'GitHubで見る',
      heroNote: '無料。記録はこの端末に保存されます。',
      heroVisualLabel: 'アプリのホーム画面',
      heroAlt: '赤ちゃんの名前と、おむつ・授乳・ねんねのカードが並ぶホーム画面',
      featuresEyebrow: '必要なものだけ',
      featuresTitle: '眠い時間のための、静かな道具。',
      featureOneTitle: '2タップで記録',
      featureOneBody: 'おしっこ、うんち、ミルク、ねんね。迷う画面を増やさず、よく使う操作を近くに置きました。',
      featureTwoTitle: '端末の中だけ',
      featureTwoBody: 'アカウントもクラウドもありません。ログは端末のローカルデータベースに保存されます。',
      featureThreeTitle: '今日が見える',
      featureThreeBody: 'タイムライン、今日のまとめ、記録の流れ。細かく分析するより、次に必要なことが分かります。',
      howEyebrow: 'HOW IT WORKS',
      howTitle: '開いて、選んで、戻る。',
      howLead: '記録のために、生活を止めなくていいように。',
      stepOneTitle: '起きたことを選ぶ',
      stepOneBody: 'おむつ、授乳、ねんねから選びます。',
      stepTwoTitle: '必要な分だけ記録する',
      stepTwoBody: 'ミルクは量、母乳とねんねはタイマー。メモや時刻はあとからでも大丈夫です。',
      stepThreeTitle: '今日の流れに戻る',
      stepThreeBody: '保存したらホームへ。今日の記録と、赤ちゃん自身のリズムを見られます。',
      screensEyebrow: 'THE SCREENS',
      screensTitle: '必要な情報を、必要な場所に。',
      screenQuickTitle: 'クイックログ',
      screenQuickBody: 'よく使う記録を、片手で。',
      screenQuickAlt: 'おむつ・授乳・ねんねを選ぶクイックログ画面',
      screenTodayTitle: '今日',
      screenTodayBody: '一日の流れをひと目で。',
      screenTodayAlt: '時刻順に並んだ今日のタイムライン',
      screenSummaryTitle: '今日のまとめ',
      screenSummaryBody: '合計と目安を、静かに。',
      screenSummaryAlt: 'おむつ・授乳・ねんねの今日のまとめ',
      screenStatsTitle: '記録の流れ',
      screenStatsBody: 'この子のリズムを見る。',
      screenStatsAlt: '7日間と30日間の記録の流れ',
      privacyEyebrow: 'PRIVATE BY DEFAULT',
      privacyTitle: '赤ちゃんの記録は、端末の中に。',
      privacyBody: 'ねんねノートはローカルのSQLiteデータベースを使います。アカウントも、ログをサーバーへ送る同期もありません。',
      privacyOne: 'アカウント不要',
      privacyTwo: 'クラウド同期なし',
      privacyThree: '広告・アクセス解析なし',
      privacyFour: '自動バックアップなし。端末だけに保存',
      faqEyebrow: 'FAQ',
      faqTitle: '気になること。',
      faqOneQuestion: 'オフラインで使えますか？',
      faqOneAnswer: 'はい。記録と閲覧は端末内で完結します。ネットワークを使うのは、選んで開いたサポートリンクだけです。',
      faqTwoQuestion: '何を記録できますか？',
      faqTwoAnswer: 'おむつ（おしっこ・うんち）、ミルク、母乳、ねんねを記録できます。成長の計測や「はじめて」の記録もあります。',
      faqThreeQuestion: 'どこから試せますか？',
      faqThreeAnswer: 'ソースコードとセットアップ方法をGitHubで公開しています。ストア向けの署名済みビルドが用意できたら、このページにインストールリンクを追加します。',
      faqFourQuestion: '医療アプリですか？',
      faqFourAnswer: 'いいえ。表示する目安は一般的な参考情報です。心配なことは小児科にご相談ください。',
      ctaEyebrow: 'READY WHEN YOU ARE',
      ctaTitle: 'まずは、記録をひとつ。',
      ctaBody: '使い方とソースコードをGitHubで確認できます。',
      ctaButton: 'ソースとセットアップを見る',
      footerRepo: 'GitHub',
      footerPrivacy: 'プライバシー',
    },
    en: {
      metaTitle: 'Nenne Note — A baby log for one free hand',
      metaDescription: 'Nenne Note is a local-first baby log for diapers, feeds and sleep, designed to be used in two taps.',
      skip: 'Skip to content',
      brandName: 'Nenne Note',
      brandAlt: 'Nenne Note logo',
      navLabel: 'Main navigation',
      navHow: 'How it works',
      navScreens: 'Screens',
      navPrivacy: 'Privacy',
      navFaq: 'FAQ',
      github: 'GitHub',
      toggle: '日本語',
      toggleLabel: 'Switch to Japanese',
      eyebrow: 'NENNE NOTE / ねんねノート',
      heroTitle: 'A baby log for the hours\nwhen you only have one hand free.',
      heroLead: 'Diapers, feeds and sleep in two taps—even at 3am. No account, no network.',
      heroPrimary: 'See how it works',
      heroSecondary: 'View on GitHub',
      heroNote: 'Free to use. Logs stay on this device.',
      heroVisualLabel: 'The app home screen',
      heroAlt: 'The home screen with a baby name and diaper, feeding and sleep cards',
      featuresEyebrow: 'ONLY WHAT HELPS',
      featuresTitle: 'A quiet tool for the sleepy hours.',
      featureOneTitle: 'Two-tap logging',
      featureOneBody: 'Pee, poop, bottle and sleep. Common actions stay close, without adding a maze of screens.',
      featureTwoTitle: 'On this device',
      featureTwoBody: 'No account and no cloud. Logs live in a local database on the device you use.',
      featureThreeTitle: 'Know today',
      featureThreeBody: 'A timeline, a daily summary and trends. Enough context to know what comes next.',
      howEyebrow: 'HOW IT WORKS',
      howTitle: 'Open, choose, get back.',
      howLead: 'Logging should not make you stop living the moment.',
      stepOneTitle: 'Choose what happened',
      stepOneBody: 'Pick diaper, feeding or sleep.',
      stepTwoTitle: 'Log only what you need',
      stepTwoBody: 'Add bottle volume, or start a nursing or sleep timer. Notes and times can wait.',
      stepThreeTitle: 'Return to today',
      stepThreeBody: 'Save and go back home. See today’s logs and your baby’s own rhythm when you want it.',
      screensEyebrow: 'THE SCREENS',
      screensTitle: 'The right detail in the right place.',
      screenQuickTitle: 'Quick log',
      screenQuickBody: 'Common logs, one-handed.',
      screenQuickAlt: 'The quick log screen for diapers, feeding and sleep',
      screenTodayTitle: 'Today',
      screenTodayBody: 'The day at a glance.',
      screenTodayAlt: 'Today’s timeline arranged by time',
      screenSummaryTitle: 'Daily summary',
      screenSummaryBody: 'Totals and context, quietly.',
      screenSummaryAlt: 'Today’s diaper, feeding and sleep summary',
      screenStatsTitle: 'Trends',
      screenStatsBody: 'See their rhythm.',
      screenStatsAlt: 'Seven-day and thirty-day activity trends',
      privacyEyebrow: 'PRIVATE BY DEFAULT',
      privacyTitle: 'Your baby’s logs stay on the device.',
      privacyBody: 'Nenne Note uses a local SQLite database. There is no account and no sync that sends logs to a server.',
      privacyOne: 'No account',
      privacyTwo: 'No cloud sync',
      privacyThree: 'No ads or analytics',
      privacyFour: 'No automatic backup. Stored on this device',
      faqEyebrow: 'FAQ',
      faqTitle: 'A few honest answers.',
      faqOneQuestion: 'Does it work offline?',
      faqOneAnswer: 'Yes. Logging and browsing happen on the device. The only intentional network action is opening an optional support link.',
      faqTwoQuestion: 'What can I track?',
      faqTwoAnswer: 'Diapers, bottles, nursing and sleep, plus growth measurements and firsts.',
      faqThreeQuestion: 'Where can I try it?',
      faqThreeAnswer: 'The source and setup instructions are on GitHub. Install links will be added here when signed store-ready builds are available.',
      faqFourQuestion: 'Is it a medical app?',
      faqFourAnswer: 'No. Any ranges shown are general reference information. Talk to your paediatrician about concerns.',
      ctaEyebrow: 'READY WHEN YOU ARE',
      ctaTitle: 'Start with one log.',
      ctaBody: 'Read the setup instructions and source on GitHub.',
      ctaButton: 'See source and setup',
      footerRepo: 'GitHub',
      footerPrivacy: 'Privacy',
    },
  };

  const languageKey = 'nenne-note-language';
  const toggle = document.querySelector('#language-toggle');

  function getInitialLanguage() {
    try {
      const saved = window.localStorage.getItem(languageKey);
      if (saved === 'ja' || saved === 'en') return saved;
    } catch {
      // Private browsing can deny storage; the browser preference is enough.
    }
    return navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en';
  }

  let language = getInitialLanguage();

  function renderLanguage() {
    const copy = translations[language];
    document.documentElement.lang = language;
    document.title = copy.metaTitle;

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.dataset.i18n;
      if (key && copy[key] !== undefined) element.textContent = copy[key];
    });

    document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
      const [attribute, key] = element.dataset.i18nAttr.split(':');
      if (attribute && key && copy[key] !== undefined) element.setAttribute(attribute, copy[key]);
    });

    if (toggle) {
      toggle.textContent = copy.toggle;
      toggle.setAttribute('aria-label', copy.toggleLabel);
      toggle.setAttribute('aria-pressed', String(language === 'en'));
    }
  }

  toggle?.addEventListener('click', () => {
    language = language === 'ja' ? 'en' : 'ja';
    try {
      window.localStorage.setItem(languageKey, language);
    } catch {
      // The page still works when storage is unavailable.
    }
    renderLanguage();
    toggle.focus();
  });

  renderLanguage();
})();
