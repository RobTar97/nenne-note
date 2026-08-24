# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] — 2026-08-24

First public release.

### Added

- **Logging** — diapers (pee / poop / both), bottle feeds with a volume
  stepper, and live timers for nursing and sleep. A running session survives
  the app being killed.
- **Home** — greeting, age, last event per category, and quick-add. Shows a
  live timer in place of the last-event value while a session is running.
- **Today** — a filterable timeline of the day; tap a row to edit it.
- **Daily summary** — per-category totals and a sleep ring.
- **Trends** — 7- and 30-day bar charts, plus a median-based read of the baby's
  own rhythm (time between feeds, nap length, next feed likely).
- **Growth** — weight, height and head circumference over time with a chart.
- **Firsts** — a 16-item milestone checklist grouped by rough age band.
- **Reminders** — optional local notifications for an overdue feed and a
  forgotten timer.
- **Onboarding** — an animated welcome with three feature cards, then baby name
  and birthday.
- Japanese and English, written natively rather than translated.
- An animated mascot: it breathes, peeks every few seconds, and reacts to taps
  and to saved logs.

### Notes

- The app icon and splash are still the Expo template.
- No growth percentile curves are included; this is deliberate — see the README.

[Unreleased]: https://github.com/RobTar97/nenne-note/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/RobTar97/nenne-note/releases/tag/v1.0.0
