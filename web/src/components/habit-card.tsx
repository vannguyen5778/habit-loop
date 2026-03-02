'use client';

import { Flame, Trash2, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { type Habit } from '@/db/dexie';
import { useHabitMutations } from '@/hooks/use-habit-mutations';
import { getTodayDate, calculateStreak, cn } from '@/lib/utils';

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const { toggleHabit, deleteHabit } = useHabitMutations();
  const today = getTodayDate();
  const isCompletedToday = habit.completedDates.includes(today);
  const streak = calculateStreak(habit.completedDates);

  return (
    <Card
      className={cn(
        'group transition-all duration-200 hover:shadow-md',
        isCompletedToday &&
          'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20',
      )}
    >
      <CardContent className="flex items-center gap-4 p-4">
        {/* Checkbox */}
        <Checkbox
          checked={isCompletedToday}
          onCheckedChange={() => toggleHabit.mutate(habit.id)}
          className={cn(
            'h-6 w-6 rounded-full transition-all',
            isCompletedToday && 'border-emerald-500 bg-emerald-500',
          )}
          aria-label={`Mark ${habit.name} as ${isCompletedToday ? 'incomplete' : 'complete'}`}
        />

        {/* Habit Info */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-medium text-sm',
              isCompletedToday && 'line-through text-muted-foreground',
            )}
          >
            {habit.name}
          </h3>
          {habit.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {habit.description}
            </p>
          )}
        </div>

        {/* Streak & Meta */}
        <div className="flex items-center gap-3 shrink-0">
          {streak > 0 && (
            <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
              <Flame className="h-3.5 w-3.5" />
              <span className="font-semibold">{streak}</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span className="capitalize">{habit.frequency}</span>
          </div>

          {/* Delete button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={() => deleteHabit.mutate(habit.id)}
            aria-label={`Delete ${habit.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

