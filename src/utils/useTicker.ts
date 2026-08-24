import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * A clock that re-renders its component every `intervalMs`.
 *
 * Used only where a running timer's digits are on screen. One render per second
 * for a small subtree is not the thing that costs frames — a render *per frame*
 * from a gesture or scroll handler is, and this is neither.
 *
 * The interval is torn down when the app backgrounds and the value re-syncs on
 * return, so a phone in a pocket for three hours doesn't wake up to a queue of
 * timer ticks, and the display is correct the instant it's visible again.
 */
export function useTicker(intervalMs = 1000, active = true) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;

    let id: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      setNow(Date.now());
      id = setInterval(() => setNow(Date.now()), intervalMs);
    };
    const stop = () => {
      if (id) clearInterval(id);
      id = undefined;
    };

    start();
    const sub = AppState.addEventListener('change', (state) => {
      stop();
      if (state === 'active') start();
    });

    return () => {
      stop();
      sub.remove();
    };
  }, [intervalMs, active]);

  return now;
}
