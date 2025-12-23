'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

export interface QueueSplit {
  id: string;
  label: string;
  icon?: string;
  filterFn?: (item: any) => boolean;
}

interface SplitTabsProps {
  splits: QueueSplit[];
  activeSplitId: string | null;
  onSplitChange: (splitId: string | null) => void;
  className?: string;
}

/**
 * SplitTabs - Renders configurable queue splits as tabs.
 * 
 * Products can provide their own splits via an adapter pattern:
 * 
 * Example for Advancement:
 * ```typescript
 * const advancementSplits: QueueSplit[] = [
 *   { id: 'due-today', label: 'Due today', icon: 'fa-solid fa-calendar-day' },
 *   { id: 'meeting-prep', label: 'Meeting prep', icon: 'fa-solid fa-briefcase' },
 *   { id: 'first-drafts', label: 'First drafts', icon: 'fa-solid fa-file-lines' },
 *   { id: 'stewardship', label: 'Stewardship', icon: 'fa-solid fa-hand-holding-heart' },
 *   { id: 'stalled', label: 'Stalled', icon: 'fa-solid fa-pause' },
 *   { id: 'fyi', label: 'FYI', icon: 'fa-solid fa-info' },
 * ];
 * ```
 * 
 * The component handles rendering and selection; filtering logic is handled
 * by the parent component using the split's filterFn or custom logic.
 */
export function SplitTabs({
  splits,
  activeSplitId,
  onSplitChange,
  className,
}: SplitTabsProps) {
  if (splits.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-1 px-4', className)}>
      {splits.map((split) => {
        const isActive = split.id === activeSplitId;
        return (
          <button
            key={split.id}
            onClick={() => onSplitChange(split.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            )}
            aria-label={`Switch to ${split.label} split`}
            aria-pressed={isActive}
          >
            {split.icon && (
              <FontAwesomeIcon
                icon={split.icon}
                className={cn('h-3.5 w-3.5', isActive ? 'text-indigo-600' : 'text-gray-500')}
              />
            )}
            <span>{split.label}</span>
          </button>
        );
      })}
    </div>
  );
}


