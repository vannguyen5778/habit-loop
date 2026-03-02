'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { type Habit } from '@/db/dexie';

/**
 * Fires a confetti burst when ALL habits are completed for today.
 * Only fires once per "all complete" event — won't re-fire if already triggered.
 */
export function useConfetti(habits: Habit[] | undefined) {
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (!habits || habits.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const completedCount = habits.filter((h) =>
      h.completedDates.includes(today),
    ).length;

    const allDone = completedCount === habits.length;

    if (allDone && !hasFiredRef.current) {
      hasFiredRef.current = true;

      // Fire a celebratory burst
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#22c55e', '#10b981', '#34d399', '#6ee7b7'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#22c55e', '#10b981', '#34d399', '#6ee7b7'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }

    // Reset the flag if the user unchecks a habit
    if (!allDone) {
      hasFiredRef.current = false;
    }
  }, [habits]);
}

