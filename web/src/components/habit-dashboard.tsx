'use client';

import { Activity } from 'lucide-react';
import { useHabits } from '@/hooks/use-habits';
import { useSync } from '@/hooks/use-sync';
import { useConfetti } from '@/hooks/use-confetti';
import { HabitCard } from '@/components/habit-card';
import { HabitHeatmap } from '@/components/habit-heatmap';
import { AddHabitDialog } from '@/components/add-habit-dialog';
import { SyncStatusIndicator } from '@/components/sync-status-indicator';
import { ThemeToggle } from '@/components/theme-toggle';

export function HabitDashboard() {
  // Initialize background sync
  useSync();

  const { data: habits, isLoading } = useHabits();

  // Fire confetti when all habits are completed for today
  useConfetti(habits);

  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits?.filter((h) =>
    h.completedDates.includes(today),
  ).length ?? 0;
  const totalHabits = habits?.length ?? 0;
  const completionPct = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold tracking-tight">
              Habit Loop
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <SyncStatusIndicator />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Today&apos;s Habits
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <AddHabitDialog />
        </div>

        {/* Habits List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[72px] rounded-xl border bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        ) : habits && habits.length > 0 ? (
          <div className="space-y-3">
            {habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No habits yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Start building better routines by creating your first habit.
              Everything is saved locally on your device.
            </p>
            <AddHabitDialog />
          </div>
        )}

        {/* Stats Bar */}
        {habits && habits.length > 0 && (
          <div className="mt-8 rounded-xl border bg-muted/30 p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{totalHabits}</div>
                <div className="text-xs text-muted-foreground">
                  Total Habits
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {completedToday}
                </div>
                <div className="text-xs text-muted-foreground">
                  Done Today
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {completionPct}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Completion
                </div>
              </div>
            </div>

            {/* Completion bar */}
            <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            {completionPct === 100 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center mt-2 font-medium">
                All habits completed today!
              </p>
            )}
          </div>
        )}

        {/* Heatmap */}
        {habits && habits.length > 0 && (
          <HabitHeatmap habits={habits} />
        )}
      </main>
    </div>
  );
}
