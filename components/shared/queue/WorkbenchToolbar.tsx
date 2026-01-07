'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';
import { SplitTabs, type QueueSplit } from './SplitTabs';
import { cn } from '@/lib/utils';

interface WorkbenchToolbarProps {
  splits: QueueSplit[];
  activeSplitId: string | null;
  onSplitChange: (splitId: string | null) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFiltersClick: () => void;
  activeFilterCount: number;
  onReviewNext?: () => void;
  showReviewNext?: boolean;
  className?: string;
}

/**
 * WorkbenchToolbar - Compact toolbar for Focus Mode workbench.
 * Provides SplitTabs (primary), Search, Filters button, and optional Review next.
 */
export function WorkbenchToolbar({
  splits,
  activeSplitId,
  onSplitChange,
  searchValue,
  onSearchChange,
  onFiltersClick,
  activeFilterCount,
  onReviewNext,
  showReviewNext = false,
  className,
}: WorkbenchToolbarProps) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-2 border-b bg-white', className)}>
      {/* SplitTabs - Primary navigation */}
      {splits.length > 0 && (
        <div className="flex-shrink-0">
          <SplitTabs
            splits={splits}
            activeSplitId={activeSplitId}
            onSplitChange={onSplitChange}
          />
        </div>
      )}

      {/* Search */}
      <div className="flex-1 min-w-0">
        <div className="relative">
          <FontAwesomeIcon
            icon="fa-solid fa-magnifying-glass"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          />
          <Input
            type="text"
            placeholder="Search items..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>

      {/* Filters Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onFiltersClick}
        className="h-8 text-sm"
      >
        <FontAwesomeIcon icon="fa-solid fa-filter" className="h-3 w-3 mr-1.5" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-xs font-medium">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {/* Review Next Button (optional) */}
      {showReviewNext && onReviewNext && (
        <Button
          variant="default"
          size="sm"
          onClick={onReviewNext}
          className="h-8 text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
          title="Start review (Enter)"
        >
          <FontAwesomeIcon icon="fa-solid fa-eye" className="h-3 w-3 mr-1.5" />
          Review next
        </Button>
      )}
    </div>
  );
}




