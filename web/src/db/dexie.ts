import Dexie, { type Table } from 'dexie';

// ─── Types (mirrored from shared for client-side use) ───────────

export interface Habit {
  id: string;
  deviceId: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  completedDates: string[];
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

export type SyncAction = 'create' | 'update' | 'toggle' | 'delete';

export interface SyncLog {
  id: string;
  habitId: string;
  action: SyncAction;
  payload: Partial<Habit>;
  timestamp: string;
  status: 'pending' | 'synced' | 'failed';
}

// ─── Database Definition ────────────────────────────────────────

export class HabitDatabase extends Dexie {
  habits!: Table<Habit, string>;
  pendingSync!: Table<SyncLog, string>;

  constructor() {
    super('OfflineHabitLoop');
    this.version(1).stores({
      habits: 'id, deviceId, name, updatedAt, isArchived',
      pendingSync: 'id, habitId, action, status, timestamp',
    });
  }
}

// Singleton instance
export const db = new HabitDatabase();

