'use client';

import { useMemo } from 'react';
import { type Habit } from '@/db/dexie';
import { cn } from '@/lib/utils';

interface HabitHeatmapProps {
  habits: Habit[];
}

/**
 * GitHub-style contribution heatmap showing habit completions over the past ~5 months.
 * Each cell = one day. Color intensity = how many habits were completed that day.
 */
export function HabitHeatmap({ habits }: HabitHeatmapProps) {
  const { weeks, maxCount, monthLabels } = useMemo(() => {
    // Build a map of date -> completion count across all habits
    const countMap = new Map<string, number>();
    for (const habit of habits) {
      for (const date of habit.completedDates) {
        countMap.set(date, (countMap.get(date) || 0) + 1);
      }
    }

    // Generate the last 20 weeks (140 days) of dates
    const totalWeeks = 20;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const dayOfWeek = today.getDay(); // 0=Sun

    // Start from the beginning of the week, 19 weeks ago
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - dayOfWeek - (totalWeeks - 1) * 7);

    const weeksArr: { date: string; count: number; isToday: boolean; isFuture: boolean }[][] = [];
    const months: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < totalWeeks; w++) {
      const week: { date: string; count: number; isToday: boolean; isFuture: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + w * 7 + d);
        const dateStr = cellDate.toISOString().split('T')[0];
        const isFuture = cellDate > today;

        week.push({
          date: dateStr,
          count: isFuture ? 0 : (countMap.get(dateStr) || 0),
          isToday: dateStr === todayStr,
          isFuture,
        });

        // Track month labels
        const month = cellDate.getMonth();
        if (month !== lastMonth && d === 0) {
          months.push({
            label: cellDate.toLocaleDateString('en-US', { month: 'short' }),
            weekIndex: w,
          });
          lastMonth = month;
        }
      }
      weeksArr.push(week);
    }

    const max = Math.max(1, ...Array.from(countMap.values()));
    return { weeks: weeksArr, maxCount: max, monthLabels: months };
  }, [habits]);

  const getIntensityClass = (count: number, isFuture: boolean) => {
    if (isFuture) return 'bg-transparent';
    if (count === 0) return 'bg-muted';
    const ratio = count / maxCount;
    if (ratio <= 0.25) return 'bg-emerald-200 dark:bg-emerald-900';
    if (ratio <= 0.5) return 'bg-emerald-400 dark:bg-emerald-700';
    if (ratio <= 0.75) return 'bg-emerald-500 dark:bg-emerald-500';
    return 'bg-emerald-600 dark:bg-emerald-400';
  };

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  return (
    <div className="rounded-xl border bg-card p-4 mt-6">
      <h3 className="text-sm font-semibold mb-3">Activity</h3>

      <div className="overflow-x-auto">
        <div className="inline-flex gap-0.5">
          {/* Day labels column */}
          <div className="flex flex-col gap-0.5 mr-1.5 pt-[18px]">
            {dayLabels.map((label, i) => (
              <div
                key={i}
                className="h-[13px] text-[9px] leading-[13px] text-muted-foreground select-none"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Weeks grid */}
          <div>
            {/* Month labels */}
            <div className="flex gap-0.5 mb-0.5">
              {weeks.map((_, weekIdx) => {
                const monthLabel = monthLabels.find((m) => m.weekIndex === weekIdx);
                return (
                  <div
                    key={weekIdx}
                    className="w-[13px] text-[9px] text-muted-foreground select-none"
                  >
                    {monthLabel?.label || ''}
                  </div>
                );
              })}
            </div>

            {/* Grid: 7 rows (days) x N columns (weeks) */}
            <div className="flex gap-0.5">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-0.5">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className={cn(
                        'h-[13px] w-[13px] rounded-[2px] transition-colors',
                        getIntensityClass(day.count, day.isFuture),
                        day.isToday && 'ring-1 ring-primary ring-offset-1 ring-offset-background',
                      )}
                      title={
                        day.isFuture
                          ? ''
                          : `${day.date}: ${day.count} habit${day.count !== 1 ? 's' : ''} completed`
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-3 text-[9px] text-muted-foreground">
        <span>Less</span>
        <div className="h-[10px] w-[10px] rounded-[2px] bg-muted" />
        <div className="h-[10px] w-[10px] rounded-[2px] bg-emerald-200 dark:bg-emerald-900" />
        <div className="h-[10px] w-[10px] rounded-[2px] bg-emerald-400 dark:bg-emerald-700" />
        <div className="h-[10px] w-[10px] rounded-[2px] bg-emerald-500 dark:bg-emerald-500" />
        <div className="h-[10px] w-[10px] rounded-[2px] bg-emerald-600 dark:bg-emerald-400" />
        <span>More</span>
      </div>
    </div>
  );
}

