'use client';

import React from 'react';
import { AgentOpsItem } from '@/lib/agent-ops/types';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { QueueAction } from './QueueList';

const TYPE_LABELS: Record<string, string> = {
  Error: 'Error',
  Guardrail: 'Guardrail',
  QuietHours: 'Quiet Hours',
  DoNotEngage: 'Do Not Engage',
  HumanReview: 'Human Review',
  Escalation: 'Escalation',
  FrequencyCap: 'Frequency Cap',
  Task: 'Task',
  OnHold: 'On Hold',
};

const STATUS_LABELS: Record<string, string> = {
  Open: 'Open',
  InProgress: 'In Progress',
  Snoozed: 'Snoozed',
  Resolved: 'Resolved',
};

function formatTypeLabel(raw: string): string {
  return TYPE_LABELS[raw] ?? raw;
}

function formatStatusLabel(raw: string): string {
  return STATUS_LABELS[raw] ?? raw;
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'Critical':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'High':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Low':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Open':
      return 'bg-red-50 text-red-700';
    case 'InProgress':
      return 'bg-blue-50 text-blue-700';
    case 'Snoozed':
      return 'bg-gray-50 text-gray-700';
    case 'Resolved':
      return 'bg-green-50 text-green-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 30) {
    return `${diffDays}d ago`;
  } else if (diffMonths < 6) {
    return `${diffMonths}mo ago`;
  } else {
    return '>6mo ago';
  }
}

// Mock assignees for now
const MOCK_ASSIGNEES = [
  { id: 'user-123', name: 'John Doe' },
  { id: 'user-456', name: 'Jane Smith' },
  { id: 'user-789', name: 'Bob Johnson' },
];

interface QueueDetailProps {
  item: AgentOpsItem;
  focusMode: boolean;
  onExitFocusMode: () => void;
  onNext: () => void;
  onPrev: () => void;
  onAction: (id: string, action: QueueAction) => void;
  onNavigateToPerson?: (personId: string) => void;
  onNavigateToAgent?: (agentId: string) => void;
}

export function QueueDetail({
  item,
  focusMode,
  onExitFocusMode,
  onNext,
  onPrev,
  onAction,
  onNavigateToPerson,
  onNavigateToAgent,
}: QueueDetailProps) {
  // Keyboard shortcuts are handled at the page level

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <header className="flex items-start justify-between gap-3 pb-3 border-b border-gray-200">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase tracking-wide text-gray-500">
                Queue
              </span>
              <span className="text-[11px] text-gray-400">•</span>
              <span className="text-[11px] text-gray-500">
                {formatTypeLabel(item.type)}
              </span>
              <span className="text-[11px] text-gray-400">•</span>
              <span className="text-[11px] text-gray-500">{item.severity}</span>
              {item.agentName && (
                <>
                  <span className="text-[11px] text-gray-400">•</span>
                  <span className="text-[11px] text-gray-500">{item.agentName}</span>
                </>
              )}
            </div>
            <h2 className="text-base font-semibold text-gray-900">{item.title}</h2>
            <p className="text-sm text-gray-600">{item.summary}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                getStatusColor(item.status)
              )}
            >
              {formatStatusLabel(item.status)}
            </span>
          </div>
        </header>

        {/* Actions row */}
        <div className="flex flex-wrap gap-2 pb-3 border-b border-gray-200">
          {item.status === 'Open' && (
            <>
              <Button
                size="sm"
                className="text-xs"
                onClick={() => onAction(item.id, 'resolve')}
              >
                <FontAwesomeIcon icon="fa-solid fa-check" className="h-3 w-3" />
                Mark resolved
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => onAction(item.id, 'snooze')}
              >
                  <FontAwesomeIcon icon="fa-solid fa-clock" className="h-3 w-3" />
                  Snooze
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="text-xs">
                    <FontAwesomeIcon icon="fa-solid fa-user-plus" className="h-3 w-3" />
                    Assign…
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {MOCK_ASSIGNEES.map((assignee) => (
                    <DropdownMenuItem
                      key={assignee.id}
                      onClick={() => onAction(item.id, 'assign')}
                    >
                      {assignee.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => onAction(item.id, 'hold')}
              >
                <FontAwesomeIcon icon="fa-solid fa-pause" className="h-3 w-3" />
                Put on hold
              </Button>
            </>
          )}
          {item.status === 'Snoozed' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => onAction(item.id, 'unsnooze')}
              >
                <FontAwesomeIcon icon="fa-solid fa-bell" className="h-3 w-3" />
                Unsnooze
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => onAction(item.id, 'extendSnooze')}
              >
                <FontAwesomeIcon icon="fa-solid fa-clock" className="h-3 w-3" />
                Extend snooze
              </Button>
            </>
          )}
          {item.status === 'Resolved' && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => onAction(item.id, 'reopen')}
            >
              <FontAwesomeIcon icon="fa-solid fa-rotate-left" className="h-3 w-3" />
              Reopen
            </Button>
          )}
        </div>

        {/* Detail sections */}
        <div className="space-y-4">
          {/* Tags and metadata */}
          <div className="flex flex-wrap gap-2">
            <span
              className={cn(
                'px-2 py-1 rounded text-xs font-medium border',
                getSeverityColor(item.severity)
              )}
            >
              {item.severity}
            </span>
            <span
              className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                getStatusColor(item.status)
              )}
            >
              {formatStatusLabel(item.status)}
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
              {formatTypeLabel(item.type)}
            </span>
            {item.tags?.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Person section */}
          {item.person && (
            <div className="pt-3 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-500 mb-2">Person</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.person.name}</div>
                  {item.person.email && (
                    <div className="text-xs text-gray-500">{item.person.email}</div>
                  )}
                </div>
                {onNavigateToPerson && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigateToPerson(item.person!.id)}
                    className="text-xs"
                  >
                    View Person
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Agent section */}
          {item.agentName && (
            <div className="pt-3 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-500 mb-2">Agent</div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-900">{item.agentName}</div>
                {item.agentId && onNavigateToAgent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigateToAgent(item.agentId!)}
                    className="text-xs"
                  >
                    View Agent
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Metadata grid */}
          <div className="pt-3 border-t border-gray-200 grid grid-cols-2 gap-4">
            {item.role && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Role</div>
                <div className="text-sm text-gray-900">{item.role}</div>
              </div>
            )}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Created</div>
              <div className="text-sm text-gray-900">{formatDate(item.createdAt)}</div>
            </div>
            {item.slaDueAt && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">SLA Due</div>
                <div className="text-sm text-gray-900">{formatDate(item.slaDueAt)}</div>
              </div>
            )}
            {item.assignedTo && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Assigned To</div>
                <div className="text-sm text-gray-900">User {item.assignedTo}</div>
              </div>
            )}
            {item.sourceSystem && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Source System</div>
                <div className="text-sm text-gray-900">{item.sourceSystem}</div>
              </div>
            )}
            {item.createdBy && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Created By</div>
                <div className="text-sm text-gray-900 capitalize">{item.createdBy}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

