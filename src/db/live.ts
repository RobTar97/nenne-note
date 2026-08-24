import { useCallback, useEffect, useRef, useState } from 'react';
import { addDatabaseChangeListener, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';

/** Tables a live query can depend on. */
export type Table = 'baby' | 'entry' | 'growth' | 'milestone' | 'setting';

/**
 * A query that re-runs when one of the tables it reads changes.
 *
 * SQLite reports every write through `addDatabaseChangeListener`, so a save on
 * one screen refreshes every other screen without any manual invalidation —
 * there is no cache to get out of sync with the source of truth.
 *
 * `tables` is not optional on purpose. Without it, saving one log re-ran every
 * live query in the app — including `getSettings`, whose freshly-built object
 * changed the app-wide context value and re-rendered every screen that consumes
 * it. Declaring the dependency turns that into the two or three queries that
 * actually read the table that changed.
 *
 * Requires `enableChangeListener` on the provider (see `app/_layout.tsx`).
 */
export function useLive<T>(
  run: (db: SQLiteDatabase) => Promise<T>,
  deps: readonly unknown[],
  initial: T,
  tables: readonly Table[],
) {
  const db = useSQLiteContext();
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  // The query closure changes identity every render; hold it in a ref so the
  // subscription is created once instead of being torn down each frame.
  const runRef = useRef(run);
  runRef.current = run;

  const tableKey = tables.join(',');

  const refresh = useCallback(async () => {
    const result = await runRef.current(db);
    setData(result);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    let alive = true;
    const watched = new Set(tableKey.split(','));

    const tick = () => {
      runRef.current(db)
        .then((r) => {
          if (!alive) return;
          setData(r);
          setError(null);
          setLoading(false);
        })
        .catch((e) => {
          if (!alive) return;
          // A rejected query must still clear `loading`. Leaving it set is how a
          // screen ends up waiting on a promise that already failed — the app
          // sits on the splash forever with nothing in the logs to explain it.
          console.warn('[db] query failed', e);
          setError(e);
          setLoading(false);
        });
    };

    tick();
    const sub = addDatabaseChangeListener((event) => {
      if (watched.has(event.tableName)) tick();
    });
    return () => {
      alive = false;
      sub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, tableKey, ...deps]);

  return { data, loading, error, refresh };
}
