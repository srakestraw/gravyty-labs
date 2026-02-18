'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DEFAULT_ACTIONS: Array<{ key: string; label: string; title?: string }> = [
  { key: 'assign_agent', label: 'Assign to Agent', title: 'Trigger automated workflow' },
  { key: 'create_segment', label: 'Create Segment' },
  { key: 'create_task', label: 'Create Task', title: 'Create a manual task' },
];

export interface TableBatchActionsProps {
  selectedIds: string[];
  actions?: Array<{ key: string; label: string; title?: string }>;
  onAction: (key: string, selectedIds: string[]) => void;
  className?: string;
  /** Optional helper text shown below the action bar */
  helperText?: string;
}

/**
 * Reusable batch actions bar for advancement pipeline table views.
 * Renders "{X} selected" on the left and action buttons on the right.
 * Buttons are disabled when selectedIds.length === 0.
 */
const DEFAULT_HELPER_TEXT =
  'Assign via Agent workflow or create a manual task.';

export function TableBatchActions({
  selectedIds,
  actions = DEFAULT_ACTIONS,
  onAction,
  className,
  helperText = DEFAULT_HELPER_TEXT,
}: TableBatchActionsProps) {
  const count = selectedIds.length;
  const disabled = count === 0;

  return (
    <div
      className={cn(
        'border-b border-border bg-muted/30',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-4 py-2 px-3',
        )}
      >
        <div className="text-sm text-muted-foreground">
          {count > 0 ? (
            <span className="font-medium text-foreground">{count} selected</span>
          ) : (
            <span>Select prospects to take action</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions.map(({ key, label, title }) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => onAction(key, selectedIds)}
              className="h-8 px-3 text-xs"
              title={title}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      {helperText && (
        <p className="px-3 pb-2 text-xs text-muted-foreground/80">
          {helperText}
        </p>
      )}
    </div>
  );
}
