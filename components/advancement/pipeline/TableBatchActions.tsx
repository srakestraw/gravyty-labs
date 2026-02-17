'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DEFAULT_ACTIONS: Array<{ key: string; label: string }> = [
  { key: 'assign_agent', label: 'Assign to Agent' },
  { key: 'add_queue', label: 'Add to Queue' },
  { key: 'create_segment', label: 'Create Segment' },
  { key: 'create_task', label: 'Create Task' },
];

export interface TableBatchActionsProps {
  selectedIds: string[];
  actions?: Array<{ key: string; label: string }>;
  onAction: (key: string, selectedIds: string[]) => void;
  className?: string;
}

/**
 * Reusable batch actions bar for advancement pipeline table views.
 * Renders "{X} selected" on the left and action buttons on the right.
 * Buttons are disabled when selectedIds.length === 0.
 */
export function TableBatchActions({
  selectedIds,
  actions = DEFAULT_ACTIONS,
  onAction,
  className,
}: TableBatchActionsProps) {
  const count = selectedIds.length;
  const disabled = count === 0;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 py-2 px-3 border-b border-border bg-muted/30',
        className
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
        {actions.map(({ key, label }) => (
          <Button
            key={key}
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onAction(key, selectedIds)}
            className="h-8 px-3 text-xs"
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
