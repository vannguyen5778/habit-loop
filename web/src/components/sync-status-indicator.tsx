'use client';

import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { cn } from '@/lib/utils';

export function SyncStatusIndicator() {
  const status = useOnlineStatus();

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 px-3 py-1 text-xs font-medium',
        status === 'online' &&
          'border-emerald-500/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
        status === 'offline' &&
          'border-amber-500/50 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
        status === 'syncing' &&
          'border-blue-500/50 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
      )}
    >
      {status === 'online' && (
        <>
          <Wifi className="h-3 w-3" />
          Online
        </>
      )}
      {status === 'offline' && (
        <>
          <WifiOff className="h-3 w-3" />
          Offline
        </>
      )}
      {status === 'syncing' && (
        <>
          <RefreshCw className="h-3 w-3 animate-spin" />
          Syncing
        </>
      )}
    </Badge>
  );
}

