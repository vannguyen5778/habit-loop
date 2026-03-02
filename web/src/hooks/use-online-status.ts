'use client';

import { useState, useEffect, useCallback } from 'react';
import { syncManager } from '@/lib/sync-manager';

export type ConnectionStatus = 'online' | 'offline' | 'syncing';

export function useOnlineStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('online');

  const updateStatus = useCallback((newStatus: ConnectionStatus) => {
    setStatus(newStatus);
  }, []);

  useEffect(() => {
    // Set initial status
    setStatus(navigator.onLine ? 'online' : 'offline');

    // Register with sync manager to get syncing status updates
    syncManager.onStatusChange(updateStatus);

    const handleOnline = () => {
      if (status !== 'syncing') setStatus('online');
    };
    const handleOffline = () => setStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateStatus, status]);

  return status;
}

