'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';
import type { QueueAction } from '@/components/ai-assistants/agent-ops/queue/QueueList';

export interface ReviewAction {
  id: QueueAction | string;
  label: string;
  icon?: string;
  keyHint?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  onClick: () => void;
  disabled?: boolean;
}

interface ReviewActionBarProps {
  actions: ReviewAction[];
  className?: string;
  showKeyHints?: boolean;
}

/**
 * ReviewActionBar - Sticky bottom action bar for Review Mode.
 * 
 * Displays primary actions with optional key hints.
 * Actions should be provided by the parent component based on the current item's context.
 * 
 * Example usage:
 * ```typescript
 * const actions: ReviewAction[] = [
 *   {
 *     id: 'snooze',
 *     label: 'Snooze',
 *     icon: 'fa-solid fa-clock',
 *     keyHint: 'S',
 *     onClick: () => handleAction('snooze'),
 *   },
 *   {
 *     id: 'resolve',
 *     label: 'Resolve',
 *     icon: 'fa-solid fa-check',
 *     keyHint: 'E',
 *     onClick: () => handleAction('resolve'),
 *   },
 * ];
 * ```
 */
export function ReviewActionBar({
  actions,
  className,
  showKeyHints = true,
}: ReviewActionBarProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'sticky bottom-0 z-40 flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200 shadow-lg',
        className
      )}
    >
      <div className="flex items-center gap-2 flex-1">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant || 'outline'}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
            className="flex items-center gap-2"
            aria-label={action.label}
          >
            {action.icon && (
              <FontAwesomeIcon icon={action.icon} className="h-4 w-4" />
            )}
            <span>{action.label}</span>
            {showKeyHints && action.keyHint && (
              <span className="ml-1 text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                {action.keyHint}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Key hints footer */}
      {showKeyHints && (
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">J</span>
            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">↑</span>
            <span>previous</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">K</span>
            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">↓</span>
            <span>next</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">Z</span>
            <span>undo</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">?</span>
            <span>shortcuts</span>
          </div>
        </div>
      )}
    </div>
  );
}

