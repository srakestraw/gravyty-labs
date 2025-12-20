'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { AgentOpsFilters, AgentRole, AgentOpsStatus, AgentOpsItemType, AgentOpsSeverity } from '@/lib/agent-ops/types';
import { cn } from '@/lib/utils';

interface FiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: AgentOpsFilters;
  onFiltersChange: (filters: AgentOpsFilters) => void;
}

const ROLES: AgentRole[] = ['Admissions', 'Registrar', 'Student Success', 'Career Services', 'Alumni Engagement', 'Advancement'];
const STATUSES: AgentOpsStatus[] = ['Open', 'Snoozed', 'InProgress', 'Resolved'];
const TYPES: AgentOpsItemType[] = ['Error', 'Guardrail', 'QuietHours', 'FrequencyCap', 'DoNotEngage', 'HumanReview', 'Escalation', 'Task', 'OnHold'];
const SEVERITIES: AgentOpsSeverity[] = ['Low', 'Medium', 'High', 'Critical'];
const ASSIGNEES = ['Me', 'Unassigned', 'All'] as const;

/**
 * FiltersDrawer - Drawer/popover for advanced filter controls.
 * Replaces the always-visible filter row with a collapsible interface.
 */
export function FiltersDrawer({
  open,
  onClose,
  filters,
  onFiltersChange,
}: FiltersDrawerProps) {
  if (!open) return null;

  const handleFilterChange = <K extends keyof AgentOpsFilters>(
    key: K,
    value: AgentOpsFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = 
    filters.role !== 'All' ||
    filters.status !== 'All' ||
    filters.type !== 'All' ||
    filters.severity !== 'All' ||
    filters.assignee !== 'All';

  const handleClearAll = () => {
    onFiltersChange({
      role: 'All',
      status: 'All',
      type: 'All',
      severity: 'All',
      assignee: 'All',
      search: filters.search, // Keep search
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value as AgentRole | 'All')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="All">All</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value as AgentOpsStatus | 'All')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="All">All</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value as AgentOpsItemType | 'All')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="All">All</option>
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity
            </label>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value as AgentOpsSeverity | 'All')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="All">All</option>
              {SEVERITIES.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignee
            </label>
            <select
              value={filters.assignee}
              onChange={(e) => handleFilterChange('assignee', e.target.value as 'Me' | 'Unassigned' | 'All')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {ASSIGNEES.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            disabled={!hasActiveFilters}
            className="text-sm"
          >
            Clear all
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
          >
            Apply
          </Button>
        </div>
      </div>
    </>
  );
}

