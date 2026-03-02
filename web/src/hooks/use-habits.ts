'use client';

import { useQuery } from '@tanstack/react-query';
import { db, type Habit } from '@/db/dexie';
import { getDeviceId } from '@/lib/device-id';

/**
 * Read all habits from IndexedDB (Dexie is the single source of truth).
 * TanStack Query is used for caching and reactivity, NOT for network fetching.
 */
export function useHabits() {
  return useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: async () => {
      const deviceId = getDeviceId();
      const habits = await db.habits
        .where('deviceId')
        .equals(deviceId)
        .and((h) => !h.isArchived)
        .toArray();
      return habits;
    },
    // Refetch when window gains focus (user may have been in another tab)
    refetchOnWindowFocus: true,
    // Keep data fresh — but source is local, so this is cheap
    staleTime: 0,
  });
}

/**
 * Get a single habit by ID from IndexedDB.
 */
export function useHabit(id: string) {
  return useQuery<Habit | undefined>({
    queryKey: ['habits', id],
    queryFn: async () => {
      return await db.habits.get(id);
    },
    enabled: !!id,
  });
}

