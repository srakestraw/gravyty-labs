'use client';

import { AgentOpsFilters, AgentRole, AgentOpsStatus, AgentOpsItemType, AgentOpsSeverity } from '@/lib/agent-ops/types';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AgentOpsFiltersBarProps {
  filters: AgentOpsFilters;
  onFiltersChange: (filters: AgentOpsFilters) => void;
}

const ROLES: AgentRole[] = [
  'Admissions',
  'Registrar',
  'Student Success',
  'Career Services',
  'Alumni Engagement',
  'Advancement',
];

const STATUSES: AgentOpsStatus[] = ['Open', 'Snoozed', 'InProgress', 'Resolved'];

const TYPES: AgentOpsItemType[] = [
  'Error',
  'Guardrail',
  'QuietHours',
  'FrequencyCap',
  'DoNotEngage',
  'HumanReview',
  'Escalation',
  'Task',
  'OnHold',
];

const TYPE_LABELS: Record<string, string> = {
  Error: 'Error',
  Guardrail: 'Guardrail',
  QuietHours: 'Quiet Hours',
  FrequencyCap: 'Frequency Cap',
  DoNotEngage: 'Do Not Engage',
  HumanReview: 'Human Review',
  Escalation: 'Escalation',
  Task: 'Task',
  OnHold: 'On Hold',
};

const STATUS_LABELS: Record<string, string> = {
  Open: 'Open',
  InProgress: 'In Progress',
  Snoozed: 'Snoozed',
  Resolved: 'Resolved',
};

const SEVERITIES: AgentOpsSeverity[] = ['Low', 'Medium', 'High', 'Critical'];

export function AgentOpsFiltersBar({ filters, onFiltersChange }: AgentOpsFiltersBarProps) {
  const updateFilter = <K extends keyof AgentOpsFilters>(
    key: K,
    value: AgentOpsFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <FontAwesomeIcon
            icon="fa-solid fa-magnifying-glass"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
          <Input
            type="text"
            placeholder="Search items..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Role Filter */}
      <div className="min-w-[140px]">
        <select
          value={filters.role}
          onChange={(e) => updateFilter('role', e.target.value as AgentRole | 'All')}
          className={cn(
            'h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm',
            'focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
          )}
        >
          <option value="All">All Roles</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="min-w-[140px]">
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value as AgentOpsStatus | 'All')}
          className={cn(
            'h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm',
            'focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
          )}
        >
          <option value="All">All Statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status] ?? status}
            </option>
          ))}
        </select>
      </div>

      {/* Type Filter */}
      <div className="min-w-[140px]">
        <select
          value={filters.type}
          onChange={(e) => updateFilter('type', e.target.value as AgentOpsItemType | 'All')}
          className={cn(
            'h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm',
            'focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
          )}
        >
          <option value="All">All Types</option>
          {TYPES.map((type) => (
            <option key={type} value={type}>
              {TYPE_LABELS[type] ?? type}
            </option>
          ))}
        </select>
      </div>

      {/* Severity Filter */}
      <div className="min-w-[120px]">
        <select
          value={filters.severity}
          onChange={(e) => updateFilter('severity', e.target.value as AgentOpsSeverity | 'All')}
          className={cn(
            'h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm',
            'focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
          )}
        >
          <option value="All">All Severities</option>
          {SEVERITIES.map((severity) => (
            <option key={severity} value={severity}>
              {severity}
            </option>
          ))}
        </select>
      </div>

      {/* Assignee Filter */}
      <div className="min-w-[140px]">
        <select
          value={filters.assignee}
          onChange={(e) => updateFilter('assignee', e.target.value as 'Me' | 'Unassigned' | 'All')}
          className={cn(
            'h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm',
            'focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
          )}
        >
          <option value="All">All Assignees</option>
          <option value="Me">Assigned to Me</option>
          <option value="Unassigned">Unassigned</option>
        </select>
      </div>
    </div>
  );
}

