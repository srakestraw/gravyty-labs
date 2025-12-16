'use client';

import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';
import type { AdmissionsTeamGamePlanObjective } from '@/lib/data/provider';

interface GamePlanPanelProps {
  objectives: AdmissionsTeamGamePlanObjective[];
  counts: Record<string, number>;
  completedCount: number;
  totalCount: number;
  activeObjectiveId: string | null;
  onApplyObjective: (objectiveId: string) => void;
  onClearObjective: () => void;
  // Optional: completion status per objective (from provider game plan items)
  objectiveCompletionStatus?: Record<string, boolean>;
}

export function GamePlanPanel({
  objectives,
  counts,
  completedCount,
  totalCount,
  activeObjectiveId,
  onApplyObjective,
  onClearObjective,
  objectiveCompletionStatus = {},
}: GamePlanPanelProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-900">Today's Game Plan</h2>
        <span className="text-xs text-gray-500">
          {completedCount} / {totalCount} completed
        </span>
      </div>
      
      {/* Horizontal card row - wraps on small screens, scrolls on larger */}
      <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto scrollbar-hide">
        {objectives.map((objective) => {
          const count = counts[objective.id] || 0;
          const isActive = activeObjectiveId === objective.id;
          const isCompleted = objectiveCompletionStatus[objective.id] || false;
          
          return (
            <div
              key={objective.id}
              className={cn(
                'flex-shrink-0 flex flex-col gap-1.5 p-2.5 rounded border bg-white',
                'min-w-[180px] sm:min-w-[200px]',
                isActive
                  ? 'border-indigo-300 bg-indigo-50/30'
                  : 'border-gray-200',
                isCompleted && !isActive && 'opacity-75'
              )}
            >
              {/* Title row */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs font-medium text-gray-900 leading-tight flex-1 line-clamp-2">
                  {objective.title}
                </h3>
                {isCompleted && (
                  <FontAwesomeIcon 
                    icon="fa-solid fa-circle-check" 
                    className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" 
                  />
                )}
              </div>
              
              {/* Count */}
              <div className="text-xs text-gray-500">
                {count} {count === 1 ? 'item' : 'items'}
              </div>
              
              {/* Progress state */}
              <div className="text-[10px] text-gray-500">
                {isCompleted ? '✓ Completed' : 'In progress'}
              </div>
              
              {/* Action button */}
              {isActive ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearObjective}
                  className="text-xs h-7 px-2 mt-1 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100"
                >
                  Clear
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApplyObjective(objective.id)}
                  className="text-xs h-7 px-2 mt-1"
                  disabled={isCompleted}
                >
                  Apply
                </Button>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Active objective indicator (subtle, below cards) */}
      {activeObjectiveId && (
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
          <FontAwesomeIcon icon="fa-solid fa-filter" className="h-3 w-3" />
          <span>
            Showing: Game Plan - <span className="font-semibold">
              {objectives.find((o) => o.id === activeObjectiveId)?.title}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

