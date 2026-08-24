# Contributing to ねんねノート

Thanks for being here. This is a small, opinionated app, and the fastest way to
get a change merged is to understand what it is trying to be before you open a
pull request.

## What this project is

A baby log that gets out of the way. A parent uses it one-handed, at 3am, with a
baby in the other arm. Every decision serves that: two taps to log something,
no account, no network, no colour, nothing that needs reading twice.

**Good contributions** make an existing flow faster, fix something wrong, add a
translation, or improve accessibility.

**Contributions that will probably be declined**, however well built:

- A feature that adds a step to logging a diaper, a feed or a sleep.
- Cloud sync, accounts, or anything that sends a baby's data off the device.
  This is a deliberate product boundary, not a missing feature.
- Analytics, telemetry, crash reporting that phones home, or ads.
- Colour. The app is monochrome on purpose — the personality lives in the line
  art and the motion.
- A dependency that replaces something already solved in ~100 lines here.

If you are unsure whether an idea fits, **open an issue before writing code.**
Nobody enjoys having a finished pull request turned down.

## Getting set up

```bash
git clone https://github.com/RobTar97/nenne-note.git
cd nenne-note
npm install
npx expo start --android    # or --ios
```

Everything the app uses works in Expo Go, so you do not need a development build
to start. You *will* need one to work on reminders — `expo-notifications`
refuses to load in Expo Go (see [`README`](README.md#reminders)).

```bash
npm run typecheck    # tsc --noEmit — must be clean
npx expo-doctor      # must be 21/21
```

## Before you open a pull request

1. `npm run typecheck` is clean. CI runs it and will block the merge.
2. `npx expo-doctor` passes.
3. You ran the app and used the thing you changed. Screenshots or a screen
   recording in the PR description are always welcome and often decide it.
4. If you touched motion, read the rules below.
5. If you added user-facing text, **both** `src/i18n/ja.ts` and
   `src/i18n/en.ts` are updated. Japanese is the primary language; `en.ts` is
   typed against it, so a missing key fails the typecheck.

## House rules

### Style

There is no linter argument to have — match the file you are editing. Two
things the codebase does care about:

- **Comments explain *why*, never *what*.** If a comment restates the code,
  delete it. If a line looks wrong but is deliberate, a comment is mandatory.
- **No magic numbers in screens.** Colours, spacing, radii, durations, springs
  and type all come from `src/design/`. If you need a value that isn't there,
  add it there rather than inlining it.

### Data

- Times are epoch milliseconds. Dates that are dates (a birthday) are
  `YYYY-MM-DD` strings in local time.
- Migrations in `src/db/schema.ts` are **append-only**. Never edit a shipped
  migration, and keep every statement re-runnable (`IF NOT EXISTS`) — a
  migration interrupted halfway is retried from the start on next launch.
- Statistics are derived on read, never stored. A stale total is worse than a
  slow query.
- Anything reading the database goes through `useLive`, and **must declare the
  tables it reads**. Skipping that re-runs every query in the app on every
  write.

### Motion

Read [the motion rules in the README](README.md#motion-rules-this-codebase-follows)
first. The short version:

- **Frequency gates the animation.** Something seen dozens of times a day gets
  no entrance. If you cannot name the purpose in one word — feedback, spatial
  consistency, state indication, preventing a jarring change — do not build it.
- Only `transform` and `opacity`, unless the element is absolutely positioned
  and childless.
- A finger means a spring; everything else is a timing curve.
- Reduced motion ships **with** the animation, not as a follow-up.
- One haptic per commit, never as the only feedback.

### Accessibility

- Every interactive element has an `accessibilityLabel`.
- Touch targets are at least 48dp — use `hitSlop` rather than growing the
  visual.
- Text scales. Never animate to a hardcoded height; measure or animate a
  transform.

## Translations

New languages are very welcome. Copy `src/i18n/en.ts`, translate it, and
register it in `src/i18n/index.ts`. Two things to watch:

- `en.ts` is typed as `Dictionary`, derived from `ja.ts`, so the compiler tells
  you about any key you missed.
- Some strings are functions because word order differs between languages.
  Translate the *sentence*, do not concatenate fragments.

Check your language at 200% system font size before opening the PR — the
two-column summary cards are the first place long labels break.

## Commits and pull requests

Plain, descriptive commit subjects in the imperative mood: `fix nap collapsing
to zero length on edit`. No strict convention is enforced.

One logical change per pull request. A PR that fixes a bug *and* refactors two
components is much harder to review and much slower to merge.

## Reporting bugs

Use the bug template. The single most useful thing you can include is **what
you expected to happen**, because for a lot of this app's behaviour there is a
deliberate choice behind it and the disagreement is usually about the choice
rather than the code.

## Security

Do not open a public issue for a security problem. See [SECURITY.md](SECURITY.md).

## Code of Conduct

By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
