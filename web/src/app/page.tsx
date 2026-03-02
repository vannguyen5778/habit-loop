'use client';

import dynamic from 'next/dynamic';

// Dynamically import the dashboard to avoid SSR issues with Dexie (IndexedDB)
const HabitDashboard = dynamic(
  () =>
    import('@/components/habit-dashboard').then((mod) => mod.HabitDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading Habit Loop...</p>
        </div>
      </div>
    ),
  },
);

export default function Home() {
  return <HabitDashboard />;
}
