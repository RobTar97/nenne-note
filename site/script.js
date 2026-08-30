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
      languageStatus: '日本語に切り替えました',
      heroKicker: '端末保存の赤ちゃんログ',
      heroTitle: '片手で、\nさっと残せる。\n赤ちゃんの記録',
      heroLead: 'おむつ・授乳・ねんねを、夜中でも2タップで。アカウントもクラウドもありません。',
      heroPrimary: '使い方を見る',
      heroSecondary: 'GitHubで見る',
      heroFactsLabel: 'アプリの特徴',
      heroFactOneValue: '2タップ',
      heroFactOneLabel: 'で記録',
      heroFactTwoValue: '端末内',
      heroFactTwoLabel: 'に保存',
      heroFactThreeValue: 'アカウント',
      heroFactThreeLabel: '登録不要',
      heroVisualMetaOne: '今日 / 03:14',
      heroVisualMetaTwo: '端末に保存',
      heroVisualNoteOne: '片手で',
      heroVisualNoteTwo: 'クラウドなし',
      heroAlt: '赤ちゃんの名前と、おむつ・授乳・ねんねのカードが並ぶホーム画面',
      heroVisualCaption: 'ねんねノートのホーム画面',
      featuresTitle: '静かであることを、機能にする。',
      featuresLead: '眠い時間に必要なのは、考えることを増やすアプリではありません。よく使う記録を近くに置き、あとで今日の流れが分かるようにしました。',
      featureOneTitle: 'よく使う記録を、親指の近くに。',
      featureOneBody: 'おむつ、ミルク、母乳、ねんね。迷う画面を増やさず、起きたことをすぐ残せます。',
      featureOneSide: 'おむつ・授乳・ねんね',
      featureTwoTitle: '記録は、この端末の中だけに。',
      featureTwoBody: 'アカウントもクラウドもありません。ローカルのデータベースに保存される、シンプルな記録です。',
      featureTwoSide: 'ローカルSQLite',
      featureThreeTitle: '今日と、いつものリズムを見やすく。',
      featureThreeBody: '今日のタイムライン、まとめ、7日間と30日間の傾向。比べるためではなく、次に必要なことを知るために。',
      featureThreeSide: '今日・傾向',
      howMarker: '3つだけ。あとは日常へ',
      howTitle: '開いて、選んで、戻る。',
      howLead: '記録のために、生活を止めなくていいように。',
      stepOneTitle: '起きたことを選ぶ',
      stepOneBody: 'クイックログを開いて、おむつ・授乳・ねんねから選びます。',
      stepTwoTitle: '必要な分だけ残す',
      stepTwoBody: 'ミルクは量、母乳とねんねはタイマー。メモや時刻は、あとからでも大丈夫です。',
      stepThreeTitle: '今日に戻る',
      stepThreeBody: '保存したらホームへ。今日の記録と、赤ちゃん自身のリズムを見られます。',
      screensTitle: '必要な情報を、すぐ近くに。',
      screensLead: '入口はクイックログ。そこから、今日の流れとこの子のリズムへ自然につながります。',
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
      privacyLabel: '端末保存が基本',
      privacyTitle: '赤ちゃんの記録は、端末の中に。',
      privacyBody: 'ねんねノートはローカルのSQLiteデータベースを使います。アカウントも、ログをサーバーへ送る同期もありません。',
      privacyLink: 'プライバシーについて、よくある質問を見る',
      privacyOne: 'アカウント不要',
      privacyTwo: 'クラウド同期なし',
      privacyThree: '広告・アクセス解析なし',
      privacyFour: '自動バックアップなし。端末だけに保存',
      faqTitle: '気になることを、先に。',
      faqLead: '記録の中身と、できること・できないことを簡潔にまとめました。',
      faqOneQuestion: 'オフラインで使えますか？',
      faqOneAnswer: 'はい。記録と閲覧は端末内で完結します。ネットワークを使うのは、選んで開いたサポートリンクだけです。',
      faqTwoQuestion: '何を記録できますか？',
      faqTwoAnswer: 'おむつ（おしっこ・うんち）、ミルク、母乳、ねんねを記録できます。成長の計測や「はじめて」の記録もあります。リマインダーは任意で、端末内の通知です。',
      faqThreeQuestion: 'どこから試せますか？',
      faqThreeAnswer: 'ソースコードとセットアップ方法をGitHubで公開しています。ストア向けの署名済みビルドが用意できたら、このページにインストールリンクを追加します。',
      faqFourQuestion: '医療アプリですか？',
      faqFourAnswer: 'いいえ。表示する目安は一般的な参考情報です。心配なことは小児科にご相談ください。',
      ctaTitle: 'まずは、記録をひとつ。',
      ctaBody: 'アプリの使い方とソースコードをGitHubで確認できます。',
      ctaButton: 'ソースとセットアップを見る',
      footerBrand: 'ねんねノート',
      footerMeta: '端末保存の赤ちゃんログ · MIT License',
      footerRepo: 'GitHub',
      footerPrivacy: 'プライバシー',
    },
    en: {
      metaTitle: 'Nenne Note — A baby log for the one hand you have free',
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
      languageStatus: 'Switched to English',
      heroKicker: 'LOCAL BABY LOG',
      heroTitle: 'A baby log.\nOne hand free.',
      heroLead: 'Diapers, feeds and sleep in two taps—even at 3am. No account, no cloud.',
      heroPrimary: 'See how it works',
      heroSecondary: 'View on GitHub',
      heroFactsLabel: 'App highlights',
      heroFactOneValue: '2 taps',
      heroFactOneLabel: 'to log',
      heroFactTwoValue: 'On-device',
      heroFactTwoLabel: 'storage',
      heroFactThreeValue: 'No account',
      heroFactThreeLabel: 'to create',
      heroVisualMetaOne: 'TODAY / 03:14',
      heroVisualMetaTwo: 'SAVED LOCALLY',
      heroVisualNoteOne: 'ONE HAND',
      heroVisualNoteTwo: 'NO CLOUD',
      heroAlt: 'The home screen with a baby name and diaper, feeding and sleep cards',
      heroVisualCaption: 'The Nenne Note home screen',
      featuresTitle: 'Quiet by design.',
      featuresLead: 'At 3am, a useful app should not ask you to think harder. Common logs stay close; the rest of the day becomes easier to see later.',
      featureOneTitle: 'Keep the common log near your thumb.',
      featureOneBody: 'Diaper, bottle, nursing and sleep. Choose what happened without walking through a maze of screens.',
      featureOneSide: 'DIAPER · FEED · SLEEP',
      featureTwoTitle: 'The log stays on this device.',
      featureTwoBody: 'No sign-in and no cloud. A local database keeps the record where you use it.',
      featureTwoSide: 'LOCAL SQLITE',
      featureThreeTitle: 'See today, then notice their rhythm.',
      featureThreeBody: 'Today’s timeline, a daily summary, and seven- and thirty-day trends. Context, not a scoreboard.',
      featureThreeSide: 'TODAY · TRENDS',
      howMarker: 'Three steps, then back to life',
      howTitle: 'Open, choose, get back.',
      howLead: 'Logging should not make you stop living the moment.',
      stepOneTitle: 'Choose what happened',
      stepOneBody: 'Open Quick log and pick diaper, feeding or sleep.',
      stepTwoTitle: 'Log only what matters',
      stepTwoBody: 'Add bottle volume, or start the nursing or sleep timer. Notes and times can wait.',
      stepThreeTitle: 'Return to today',
      stepThreeBody: 'Save and go back home. See today’s logs and your baby’s own rhythm when you want it.',
      screensTitle: 'The detail you need, close at hand.',
      screensLead: 'Start with Quick log. From there, the app leads naturally to today’s flow and their rhythm over time.',
      screenQuickTitle: 'Quick log',
      screenQuickBody: 'Common logs, one-handed.',
      screenQuickAlt: 'The quick log screen for diapers, feeding and sleep',
      screenTodayTitle: 'Today',
      screenTodayBody: 'The day at a glance.',
      screenTodayAlt: 'Today’s timeline arranged by time',
      screenSummaryTitle: 'Daily summary',
      screenSummaryBody: 'Totals with context, quietly.',
      screenSummaryAlt: 'Today’s diaper, feeding and sleep summary',
      screenStatsTitle: 'Trends',
      screenStatsBody: 'See their rhythm.',
      screenStatsAlt: 'Seven-day and thirty-day activity trends',
      privacyLabel: 'PRIVATE BY DEFAULT',
      privacyTitle: 'Your baby’s logs stay on the device.',
      privacyBody: 'Nenne Note stores logs in a local SQLite database. There is no account and no sync service sending logs to a server.',
      privacyLink: 'Read the privacy questions',
      privacyOne: 'No account',
      privacyTwo: 'No cloud sync',
      privacyThree: 'No ads or analytics',
      privacyFour: 'No automatic backup. Stored on this device',
      faqTitle: 'A few honest answers.',
      faqLead: 'What the app keeps, what it does, and where its boundaries are.',
      faqOneQuestion: 'Does it work offline?',
      faqOneAnswer: 'Yes. Logging and browsing happen on-device. The only intentional network action is opening an optional support link.',
      faqTwoQuestion: 'What can I track?',
      faqTwoAnswer: 'Diapers, bottles, nursing and sleep, plus growth measurements and firsts. Reminders are optional and local.',
      faqThreeQuestion: 'Where can I try it?',
      faqThreeAnswer: 'The source and setup instructions are on GitHub. This page does not pretend there is a store build: signed store links will appear only when available.',
      faqFourQuestion: 'Is it a medical app?',
      faqFourAnswer: 'No. Any ranges shown are general reference information. Talk to your paediatrician about concerns.',
      ctaTitle: 'Start with one log.',
      ctaBody: 'Read the app setup instructions and source on GitHub.',
      ctaButton: 'See source and setup',
      footerBrand: 'Nenne Note',
      footerMeta: 'local-first baby log · MIT licence',
      footerRepo: 'GitHub',
      footerPrivacy: 'Privacy',
    },
  };

  const languageKey = 'nenne-note-language';
  const toggle = document.querySelector('#language-toggle');
  const status = document.querySelector('#language-status');

  function validLanguage(value) {
    return value === 'ja' || value === 'en' ? value : null;
  }

  function getInitialLanguage() {
    const requested = validLanguage(new URLSearchParams(window.location.search).get('lang'));
    if (requested) return requested;

    try {
      const saved = validLanguage(window.localStorage.getItem(languageKey));
      if (saved) return saved;
    } catch {
      // The browser preference is enough when storage is unavailable.
    }

    return navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en';
  }

  let language = getInitialLanguage();

  function renderLanguage(announce = false) {
    const copy = translations[language];
    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;
    document.title = copy.metaTitle;

    const openGraphLocale = document.querySelector('meta[property="og:locale"]');
    const alternateLocale = document.querySelector('meta[property="og:locale:alternate"]');
    if (openGraphLocale) openGraphLocale.setAttribute('content', language === 'ja' ? 'ja_JP' : 'en_US');
    if (alternateLocale) alternateLocale.setAttribute('content', language === 'ja' ? 'en_US' : 'ja_JP');

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.dataset.i18n;
      if (key && copy[key] !== undefined) element.textContent = copy[key];
    });

    document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
      const [attribute, key] = element.dataset.i18nAttr.split(':');
      if (attribute && key && copy[key] !== undefined) {
        element.setAttribute(attribute, copy[key]);
      }
    });

    if (toggle) {
      toggle.setAttribute('aria-label', copy.toggleLabel);
      toggle.setAttribute('aria-pressed', String(language === 'en'));
    }

    if (announce && status) status.textContent = copy.languageStatus;
  }

  toggle?.addEventListener('click', () => {
    language = language === 'ja' ? 'en' : 'ja';
    try {
      window.localStorage.setItem(languageKey, language);
    } catch {
      // The page still works when storage is unavailable.
    }
    renderLanguage(true);
    toggle.focus();
  });

  renderLanguage();
})();
