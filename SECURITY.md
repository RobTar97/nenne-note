# Security Policy

## Supported versions

This project is pre-1.0 in practice: only the latest commit on `main` is
supported. Fixes land there rather than being backported.

## Reporting a vulnerability

**Please do not open a public issue for a security problem.**

Report it privately through GitHub's
[private vulnerability reporting](https://github.com/RobTar97/nenne-note/security/advisories/new),
or by email to robert.tarczynski97@gmail.com.

Please include what you found, how to reproduce it, and what an attacker could
achieve. You will get an acknowledgement within a few days. This is a personal
project maintained in spare time, so please be realistic about response times —
there is no bounty, and no SLA.

## What is actually in scope

The threat model here is narrow, and worth stating plainly so you do not waste
your time:

**ねんねノート stores everything in a local SQLite database on the device. It
has no backend, no account system, no analytics, and makes no network requests
at runtime.** There is no server to attack and no data in transit to intercept.

In scope:

- Anything that lets another app on the device read the log database.
- A path traversal or injection through user-entered text (a baby's name, a
  note) that escapes the parameterised queries in `src/db/repo.ts`.
- A dependency in `package.json` with a known exploitable vulnerability that is
  actually reachable from this app's code.
- Anything that causes the app to transmit user data anywhere.

Out of scope:

- An attacker who already has a rooted device, or physical access to an
  unlocked phone. The database is not encrypted at rest and does not claim to
  be — see below.
- Vulnerabilities in Expo, React Native or Android themselves. Report those
  upstream.
- Missing hardening that has no exploit path (for example "the APK is not
  obfuscated").

## A note on at-rest encryption

The SQLite database is stored in the app's private directory, which Android and
iOS isolate from other apps, and is covered by the device's full-disk
encryption when the user has a passcode set. It is **not** separately encrypted
by this app.

That is a deliberate trade-off, not an oversight: adding a passphrase would mean
a parent has to unlock the app before logging a feed at 3am, which defeats the
entire point of it. If you need stronger guarantees for your own fork,
`expo-sqlite` supports SQLCipher.
