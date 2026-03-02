import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="rounded-full bg-muted p-6 mx-auto mb-6 w-fit">
          <WifiOff className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">You&apos;re Offline</h1>
        <p className="text-muted-foreground max-w-sm">
          Don&apos;t worry — your habits are saved locally. The app will sync
          automatically when you&apos;re back online.
        </p>
      </div>
    </div>
  );
}

