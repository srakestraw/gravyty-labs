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

interface QueueRowProps {
  item: AgentOpsItem;
  onSelect?: () => void;
  onResolve?: (id: string) => void;
  onSnooze?: (id: string) => void;
  onAssign?: (id: string, userId: string) => void;
  onUnsnooze?: (id: string) => void;
  onExtendSnooze?: (id: string) => void;
  onReopen?: (id: string) => void;
}

export function QueueRow({
  item,
  onSelect,
  onResolve,
  onSnooze,
  onAssign,
  onUnsnooze,
  onExtendSnooze,
  onReopen,
}: QueueRowProps) {
  return (
    <tr
      onClick={onSelect}
      className={cn('hover:bg-gray-50 transition-colors', onSelect && 'cursor-pointer')}
    >
      <td className="px-4 py-3 whitespace-nowrap">
        <span
          className={cn(
            'inline-flex px-2 py-1 rounded text-xs font-medium border',
            getSeverityColor(item.severity)
          )}
        >
          {item.severity}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
        {formatTypeLabel(item.type)}
      </td>
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={item.title}>
          {item.title}
        </div>
        <div className="text-xs text-gray-500 truncate max-w-xs" title={item.summary}>
          {item.summary}
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
        {item.agentName || '—'}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span
          className={cn(
            'inline-flex px-2 py-1 rounded text-xs font-medium',
            getStatusColor(item.status)
          )}
        >
          {formatStatusLabel(item.status)}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        {formatDate(item.createdAt)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        {item.slaDueAt ? formatDate(item.slaDueAt) : '—'}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-1">
          {item.status === 'Open' && (
            <>
              {onResolve && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onResolve(item.id);
                  }}
                  title="Resolve"
                >
                  <FontAwesomeIcon icon="fa-solid fa-check" className="h-3 w-3" />
                </Button>
              )}
              {onSnooze && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSnooze(item.id);
                  }}
                  title="Snooze"
                >
                  <FontAwesomeIcon icon="fa-solid fa-clock" className="h-3 w-3" />
                </Button>
              )}
              {onAssign && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => e.stopPropagation()}
                      title="Assign"
                    >
                      <FontAwesomeIcon icon="fa-solid fa-user-plus" className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {MOCK_ASSIGNEES.map((assignee) => (
                      <DropdownMenuItem
                        key={assignee.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssign(item.id, assignee.id);
                        }}
                      >
                        {assignee.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
          {item.status === 'Snoozed' && (
            <>
              {onUnsnooze && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnsnooze(item.id);
                  }}
                  title="Unsnooze"
                >
                  <FontAwesomeIcon icon="fa-solid fa-bell" className="h-3 w-3" />
                </Button>
              )}
              {onExtendSnooze && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExtendSnooze(item.id);
                  }}
                  title="Extend snooze"
                >
                  <FontAwesomeIcon icon="fa-solid fa-clock" className="h-3 w-3" />
                </Button>
              )}
            </>
          )}
          {item.status === 'Resolved' && onReopen && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onReopen(item.id);
              }}
              title="Reopen"
            >
              <FontAwesomeIcon icon="fa-solid fa-rotate-left" className="h-3 w-3" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

