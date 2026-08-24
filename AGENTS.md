# Notes for coding agents

Read [CONTRIBUTING.md](CONTRIBUTING.md) first — it is written for humans but
every rule in it applies here.

## Before writing code

- **Expo SDK 57 / React Native 0.86.** APIs move fast; check the versioned docs
  at <https://docs.expo.dev/versions/v57.0.0/> rather than relying on training
  data. Several things in this project needed exactly that: `expo-notifications`
  throws on *import* in Expo Go, `DateTimePicker`'s `onChange` is deprecated in
  favour of `onValueChange` + `onDismiss`, and `newArchEnabled` /
  `edgeToEdgeEnabled` were removed from the config schema.
- `npm run typecheck` must be clean before you claim anything works.
- Install native packages with `npx expo install`, never plain `npm install` —
  it resolves the version matching the SDK.

## Landmines already hit here

Documented so nobody rediscovers them the hard way:

- **`SQLiteProvider` captures its `children` at mount** and does not re-render
  them when its parent re-renders. Any state living *above* it silently hands
  stale props to everything below. All boot state lives in `Boot`, underneath
  the provider.
- **`useLive` must be given the tables it reads.** Without that, one insert
  re-runs every query in the app and churns the app-wide context.
- **Worklets cannot call plain JS helpers.** Timing configs are pre-built in
  `src/design/motion.ts` as `timings.*` rather than constructed inside a
  `useDerivedValue`, and a worklet cannot resolve a default parameter that
  points at another module's export.
- **The bear's eyes are cross-faded via `animatedProps`,** not swapped by state.
- **Editing an entry must not reuse the create payload** — that path once
  collapsed naps to zero length and rewrote nursing sessions as bottles.

## Verifying

Emulator screenshots are the baseline check, but be careful: a stale Metro
process will happily serve an old bundle and make correct code look broken. If
something you just wrote appears to do nothing, confirm the bundle actually
reloaded before debugging the code.

Motion feel, haptic timing and spring settle cannot be judged from an emulator
or a screenshot. Say so rather than claiming they are verified.
