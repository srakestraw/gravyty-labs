'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export type TimePillProps = {
  dateISO: string; // target date/time in ISO format
  mode: 'due' | 'since'; // due = countdown, since = time since
  emphasize?: 'none' | 'warn' | 'danger'; // optional override
  className?: string;
};

/**
 * Helper to calculate relative time
 */
function getRelativeTime(dateISO: string, mode: 'due' | 'since'): { text: string; isOverdue: boolean; days: number } {
  const targetDate = new Date(dateISO);
  const now = new Date();
  const diffMs = mode === 'due' ? targetDate.getTime() - now.getTime() : now.getTime() - targetDate.getTime();
  const diffDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));

  if (mode === 'due') {
    if (diffMs < 0) {
      // Overdue
      return { text: `Overdue by ${diffDays}d`, isOverdue: true, days: diffDays };
    } else if (diffDays === 0) {
      // Due today
      return { text: 'Due today', isOverdue: false, days: 0 };
    } else {
      // Due in future
      return { text: `Due in ${diffDays}d`, isOverdue: false, days: diffDays };
    }
  } else {
    // mode === 'since'
    if (diffHours < 24) {
      return { text: `${diffHours}h ago`, isOverdue: false, days: 0 };
    } else {
      return { text: `${diffDays}d ago`, isOverdue: false, days: diffDays };
    }
  }
}

/**
 * Format absolute date for title attribute
 */
function formatAbsoluteDate(dateISO: string): string {
  const date = new Date(dateISO);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function TimePill({ dateISO, mode, emphasize, className }: TimePillProps) {
  const { text, isOverdue, days } = useMemo(() => getRelativeTime(dateISO, mode), [dateISO, mode]);
  const absoluteDate = useMemo(() => formatAbsoluteDate(dateISO), [dateISO]);

  // Determine styling based on mode and state
  const getStyles = () => {
    // If explicit emphasize override, use it
    if (emphasize === 'warn') {
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    }
    if (emphasize === 'danger') {
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    }
    if (emphasize === 'none') {
      return 'bg-gray-50 text-gray-700 border border-gray-200';
    }

    // Auto-detect based on mode and state
    if (mode === 'due') {
      if (isOverdue) {
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      }
      if (days <= 3) {
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      }
      return 'bg-gray-50 text-gray-700 border border-gray-200';
    }

    // mode === 'since' - neutral gray
    return 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors duration-300',
        getStyles(),
        className
      )}
      title={absoluteDate}
    >
      {text}
    </span>
  );
}



