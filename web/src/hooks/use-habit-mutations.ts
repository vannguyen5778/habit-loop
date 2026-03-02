'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { db, type Habit, type SyncLog } from '@/db/dexie';
import { getDeviceId } from '@/lib/device-id';
import { syncManager } from '@/lib/sync-manager';
import { getTodayDate, nowISO } from '@/lib/utils';

/**
 * All mutations write to IndexedDB first (< 10ms), then queue a background sync.
 * TanStack Query invalidation causes the UI to re-read from Dexie.
 */
export function useHabitMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['habits'] });
  };

  // ─── Create Habit ───────────────────────────────────────────
  const createHabit = useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      frequency?: 'daily' | 'weekly';
    }) => {
      const now = nowISO();
      const deviceId = getDeviceId();
      const habit: Habit = {
        id: uuidv4(),
        deviceId,
        name: input.name,
        description: input.description,
        frequency: input.frequency || 'daily',
        completedDates: [],
        createdAt: now,
        updatedAt: now,
        isArchived: false,
      };

      // Write to IndexedDB immediately
      await db.habits.put(habit);

      // Queue sync
      const syncEntry: SyncLog = {
        id: uuidv4(),
        habitId: habit.id,
        action: 'create',
        payload: habit,
        timestamp: now,
        status: 'pending',
      };
      await syncManager.queueChange(syncEntry);

      return habit;
    },
    onSuccess: () => invalidate(),
  });

  // ─── Toggle Today's Completion ──────────────────────────────
  const toggleHabit = useMutation({
    mutationFn: async (habitId: string) => {
      const habit = await db.habits.get(habitId);
      if (!habit) throw new Error('Habit not found');

      const today = getTodayDate();
      const now = nowISO();
      const isCompleted = habit.completedDates.includes(today);

      const newCompletedDates = isCompleted
        ? habit.completedDates.filter((d) => d !== today)
        : [...habit.completedDates, today];

      const updatedHabit: Habit = {
        ...habit,
        completedDates: newCompletedDates,
        updatedAt: now,
      };

      // Write to IndexedDB immediately
      await db.habits.put(updatedHabit);

      // Queue sync
      const syncEntry: SyncLog = {
        id: uuidv4(),
        habitId: habit.id,
        action: 'toggle',
        payload: {
          completedDates: newCompletedDates,
          updatedAt: now,
        },
        timestamp: now,
        status: 'pending',
      };
      await syncManager.queueChange(syncEntry);

      return updatedHabit;
    },
    onSuccess: () => invalidate(),
  });

  // ─── Update Habit ───────────────────────────────────────────
  const updateHabit = useMutation({
    mutationFn: async (input: {
      id: string;
      name?: string;
      description?: string;
      frequency?: 'daily' | 'weekly';
    }) => {
      const habit = await db.habits.get(input.id);
      if (!habit) throw new Error('Habit not found');

      const now = nowISO();
      const updatedHabit: Habit = {
        ...habit,
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.frequency !== undefined && { frequency: input.frequency }),
        updatedAt: now,
      };

      await db.habits.put(updatedHabit);

      const syncEntry: SyncLog = {
        id: uuidv4(),
        habitId: habit.id,
        action: 'update',
        payload: {
          name: updatedHabit.name,
          description: updatedHabit.description,
          frequency: updatedHabit.frequency,
          updatedAt: now,
        },
        timestamp: now,
        status: 'pending',
      };
      await syncManager.queueChange(syncEntry);

      return updatedHabit;
    },
    onSuccess: () => invalidate(),
  });

  // ─── Delete Habit (Soft Delete) ─────────────────────────────
  const deleteHabit = useMutation({
    mutationFn: async (habitId: string) => {
      const habit = await db.habits.get(habitId);
      if (!habit) throw new Error('Habit not found');

      const now = nowISO();
      await db.habits.update(habitId, {
        isArchived: true,
        updatedAt: now,
      });

      const syncEntry: SyncLog = {
        id: uuidv4(),
        habitId,
        action: 'delete',
        payload: { isArchived: true, updatedAt: now },
        timestamp: now,
        status: 'pending',
      };
      await syncManager.queueChange(syncEntry);
    },
    onSuccess: () => invalidate(),
  });

  return {
    createHabit,
    toggleHabit,
    updateHabit,
    deleteHabit,
  };
}

