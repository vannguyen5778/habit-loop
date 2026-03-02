import { db, type Habit, type SyncLog } from '@/db/dexie';
import { getDeviceId } from './device-id';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const SYNC_DEBOUNCE_MS = 2000;

type SyncStatusCallback = (status: 'online' | 'offline' | 'syncing') => void;

class SyncManager {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private isSyncing = false;
  private statusCallback: SyncStatusCallback | null = null;

  /**
   * Register a callback to be notified of sync status changes.
   */
  onStatusChange(cb: SyncStatusCallback) {
    this.statusCallback = cb;
  }

  /**
   * Queue a change in the pendingSync table and trigger a debounced sync.
   */
  async queueChange(entry: SyncLog) {
    await db.pendingSync.put(entry);
    this.scheduleSyncFlush();
  }

  /**
   * Schedule a debounced flush of all pending changes.
   * If the user is spamming toggles, this batches them into one request.
   */
  scheduleSyncFlush() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.flushPendingChanges();
    }, SYNC_DEBOUNCE_MS);
  }

  /**
   * Immediately flush all pending changes to the server.
   * Called after debounce timer fires, or when coming back online.
   */
  async flushPendingChanges(): Promise<boolean> {
    if (this.isSyncing) return false;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return false;

    const pending = await db.pendingSync
      .where('status')
      .equals('pending')
      .toArray();

    if (pending.length === 0) return true;

    this.isSyncing = true;
    this.statusCallback?.('syncing');

    try {
      const response = await fetch(`${API_URL}/habits/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: getDeviceId(),
          changes: pending,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      const data = await response.json();

      // Mark all pending entries as synced
      await db.pendingSync
        .where('status')
        .equals('pending')
        .modify({ status: 'synced' });

      // Reconcile: update local habits with server's canonical state
      if (data.habits && Array.isArray(data.habits)) {
        for (const serverHabit of data.habits as Habit[]) {
          await db.habits.put(serverHabit);
        }
      }

      // Clean up old synced entries (keep last 100 for debugging)
      const syncedEntries = await db.pendingSync
        .where('status')
        .equals('synced')
        .sortBy('timestamp');
      if (syncedEntries.length > 100) {
        const toDelete = syncedEntries.slice(
          0,
          syncedEntries.length - 100,
        );
        await db.pendingSync.bulkDelete(toDelete.map((e) => e.id));
      }

      this.statusCallback?.('online');
      return true;
    } catch (error) {
      console.warn('[SyncManager] Sync failed, will retry later:', error);
      this.statusCallback?.(
        typeof navigator !== 'undefined' && navigator.onLine
          ? 'online'
          : 'offline',
      );
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Initialize online/offline listeners.
   */
  init() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.statusCallback?.('online');
      // Flush any pending changes when we come back online
      this.flushPendingChanges();
    });

    window.addEventListener('offline', () => {
      this.statusCallback?.('offline');
    });

    // Set initial status
    this.statusCallback?.(navigator.onLine ? 'online' : 'offline');

    // Try to flush any leftover pending changes from previous sessions
    this.flushPendingChanges();
  }
}

// Singleton
export const syncManager = new SyncManager();

