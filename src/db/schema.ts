import type { SQLiteDatabase } from 'expo-sqlite';

export const DB_NAME = 'nenne.db';

/**
 * Schema migrations, applied in order and tracked with `PRAGMA user_version`.
 *
 * Rules for adding one: append, never edit a shipped migration, and make it
 * re-runnable. `user_version` only advances after a migration completes, so a
 * migration interrupted halfway is retried from the start on next launch —
 * which is why every statement is `IF NOT EXISTS`.
 */
const MIGRATIONS: ((db: SQLiteDatabase) => Promise<void>)[] = [
  // v1 — babies, entries, growth, milestones, settings
  async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS baby (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT    NOT NULL,
        birthday    TEXT    NOT NULL,
        created_at  INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS entry (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        baby_id     INTEGER NOT NULL REFERENCES baby(id) ON DELETE CASCADE,
        kind        TEXT    NOT NULL CHECK (kind IN ('diaper','feed','sleep')),
        started_at  INTEGER NOT NULL,
        ended_at    INTEGER,
        note        TEXT,

        diaper_kind TEXT    CHECK (diaper_kind IN ('pee','poop','both')),

        feed_kind   TEXT    CHECK (feed_kind IN ('bottle','breast','solid')),
        amount_ml   REAL,
        left_sec    INTEGER NOT NULL DEFAULT 0,
        right_sec   INTEGER NOT NULL DEFAULT 0,
        active_side TEXT    CHECK (active_side IN ('left','right')),
        side_since  INTEGER,

        created_at  INTEGER NOT NULL,
        updated_at  INTEGER NOT NULL
      );

      -- Every list and stat query is "this baby, this time range, newest first".
      CREATE INDEX IF NOT EXISTS entry_baby_started ON entry (baby_id, started_at DESC);
      -- Finding the one running session must never scan the table.
      CREATE INDEX IF NOT EXISTS entry_running ON entry (baby_id, ended_at) WHERE ended_at IS NULL;

      CREATE TABLE IF NOT EXISTS growth (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        baby_id     INTEGER NOT NULL REFERENCES baby(id) ON DELETE CASCADE,
        measured_at INTEGER NOT NULL,
        weight_g    INTEGER,
        height_mm   INTEGER,
        head_mm     INTEGER,
        note        TEXT
      );
      CREATE INDEX IF NOT EXISTS growth_baby_at ON growth (baby_id, measured_at DESC);

      CREATE TABLE IF NOT EXISTS milestone (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        baby_id      INTEGER NOT NULL REFERENCES baby(id) ON DELETE CASCADE,
        key          TEXT    NOT NULL,
        achieved_at  INTEGER NOT NULL,
        note         TEXT,
        UNIQUE (baby_id, key)
      );

      CREATE TABLE IF NOT EXISTS setting (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  },
];

export async function migrate(db: SQLiteDatabase) {
  // WAL keeps reads from blocking the write a save is doing, which is what stops
  // the save animation stuttering on a slow device.
  //
  // Switching journal mode needs exclusive access, so it fails with "database is
  // locked" whenever another connection is still open — which happens routinely
  // during a Fast Refresh reload. It is an optimisation, not a correctness
  // requirement: log it and carry on with the default rollback journal.
  try {
    await db.execAsync('PRAGMA journal_mode = WAL');
  } catch (e) {
    console.warn('[db] could not enable WAL, continuing in rollback-journal mode', e);
  }

  await db.execAsync('PRAGMA foreign_keys = ON');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;

  for (let v = current; v < MIGRATIONS.length; v++) {
    await MIGRATIONS[v](db);
    // PRAGMA can't be parameterised; `v` is a loop index, never user input.
    await db.execAsync(`PRAGMA user_version = ${v + 1}`);
  }
}
