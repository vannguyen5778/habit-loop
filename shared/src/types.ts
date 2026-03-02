// ─── Core Habit Type ─────────────────────────────────────────────
export interface Habit {
  /** UUID generated client-side */
  id: string;
  /** Auto-generated device identifier */
  deviceId: string;
  /** Display name of the habit */
  name: string;
  /** Optional description */
  description?: string;
  /** How often the habit should be performed */
  frequency: 'daily' | 'weekly';
  /** Array of ISO date strings (YYYY-MM-DD) when the habit was completed */
  completedDates: string[];
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update — used for conflict resolution */
  updatedAt: string;
  /** Soft-delete flag */
  isArchived: boolean;
}

// ─── Sync Log Entry (stored in IndexedDB pending_sync table) ────
export type SyncAction = 'create' | 'update' | 'toggle' | 'delete';

export interface SyncLog {
  /** UUID for this sync entry */
  id: string;
  /** The habit this change relates to */
  habitId: string;
  /** What kind of mutation occurred */
  action: SyncAction;
  /** The changed fields */
  payload: Partial<Habit>;
  /** ISO timestamp when the mutation happened */
  timestamp: string;
  /** Current sync status */
  status: 'pending' | 'synced' | 'failed';
}

// ─── API Request / Response DTOs ────────────────────────────────
export interface SyncRequest {
  deviceId: string;
  changes: SyncLog[];
  lastSyncedAt?: string;
}

export interface SyncResponse {
  /** The server's canonical habit list for this device */
  habits: Habit[];
  /** Number of conflicts that were auto-resolved */
  resolvedConflicts: number;
  /** Server timestamp for this sync */
  syncedAt: string;
}

// ─── Online Status ──────────────────────────────────────────────
export type ConnectionStatus = 'online' | 'offline' | 'syncing';

