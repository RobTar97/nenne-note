import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { dayEnd, dayStart } from './time';

/**
 * The current local calendar day, refreshed at the next local midnight.
 *
 * This is intentionally scheduled from `dayEnd()` rather than with a fixed
 * 24-hour interval, so daylight-saving transitions cannot leave a screen
 * showing yesterday. When the app returns from the background it recalculates
 * immediately, which also covers a phone that slept through midnight.
 */
export function useDayStart() {
  const [currentDayStart, setCurrentDayStart] = useState(() => dayStart(Date.now()));

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let alive = true;

    const clear = () => {
      if (timeout) clearTimeout(timeout);
      timeout = undefined;
    };

    const schedule = () => {
      clear();
      if (!alive) return;

      const now = Date.now();
      const next = dayStart(now);
      setCurrentDayStart((previous) => (previous === next ? previous : next));

      const delay = Math.max(1_000, dayEnd(now) - now + 50);
      timeout = setTimeout(schedule, delay);
    };

    const onAppStateChange = (state: string) => {
      clear();
      if (state === 'active') schedule();
    };

    schedule();
    const subscription = AppState.addEventListener('change', onAppStateChange);

    return () => {
      alive = false;
      clear();
      subscription.remove();
    };
  }, []);

  return currentDayStart;
}
