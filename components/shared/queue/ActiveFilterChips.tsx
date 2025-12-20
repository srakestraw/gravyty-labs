'use client';

import React from 'react';
import { AgentOpsFilters } from '@/lib/agent-ops/types';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';

interface ActiveFilterChipsProps {
  filters: AgentOpsFilters;
  onRemoveFilter: (key: keyof AgentOpsFilters) => void;
  className?: string;
}

/**
 * ActiveFilterChips - Compact display of active filters as removable chips.
 * Shows below the toolbar when filters are applied.
 */
export function ActiveFilterChips({
  filters,
  onRemoveFilter,
  className,
}: ActiveFilterChipsProps) {
  const activeFilters: Array<{ key: keyof AgentOpsFilters; label: string; value: string }> = [];

  if (filters.role !== 'All') {
    activeFilters.push({ key: 'role', label: 'Role', value: filters.role });
  }
  if (filters.status !== 'All') {
    activeFilters.push({ key: 'status', label: 'Status', value: filters.status });
  }
  if (filters.type !== 'All') {
    activeFilters.push({ key: 'type', label: 'Type', value: filters.type });
  }
  if (filters.severity !== 'All') {
    activeFilters.push({ key: 'severity', label: 'Severity', value: filters.severity });
  }
  if (filters.assignee !== 'All') {
    activeFilters.push({ key: 'assignee', label: 'Assignee', value: filters.assignee });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2 px-4 py-2 border-b bg-gray-50 overflow-x-auto', className)}>
      <span className="text-xs text-gray-500 font-medium flex-shrink-0">Active filters:</span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {activeFilters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onRemoveFilter(filter.key)}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-gray-300 text-xs text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors flex-shrink-0"
            title={`Remove ${filter.label} filter`}
          >
            <span className="font-medium">{filter.label}:</span>
            <span>{filter.value}</span>
            <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-3 w-3 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}

