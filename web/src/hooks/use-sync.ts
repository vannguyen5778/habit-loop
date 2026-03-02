'use client';

import { useEffect } from 'react';
import { syncManager } from '@/lib/sync-manager';

/**
 * Initialize the sync manager on mount.
 * Sets up online/offline listeners and flushes any pending changes.
 */
export function useSync() {
  useEffect(() => {
    syncManager.init();
  }, []);
}

