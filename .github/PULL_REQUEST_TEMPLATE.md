## What this changes

<!-- One or two sentences. If it fixes an issue, "Fixes #123". -->

## Why

<!-- What problem does this solve? If it changes a product decision rather than
     fixing a bug, say which decision and why the new one is better. -->

## How it was tested

<!-- Which device or emulator, and what you actually did with it.
     Screenshots or a screen recording are very welcome. -->

## Checklist

- [ ] `npm run typecheck` is clean
- [ ] `npx expo-doctor` passes
- [ ] I ran the app and used the thing I changed
- [ ] User-facing text is in **both** `src/i18n/ja.ts` and `src/i18n/en.ts`
- [ ] New values come from `src/design/` rather than being inlined
- [ ] Any new animation respects reduced motion and can name its purpose
- [ ] Interactive elements have an `accessibilityLabel` and a 48dp target
