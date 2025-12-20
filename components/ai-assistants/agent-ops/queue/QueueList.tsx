'use client';

import React from 'react';
import { AgentOpsItem } from '@/lib/agent-ops/types';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';

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

export type QueueAction = 'resolve' | 'snooze' | 'assign' | 'hold' | 'unsnooze' | 'extendSnooze' | 'reopen' | 'send-email' | 'send-gratavid' | 'call' | 'sms' | 'skip';

interface QueueListProps {
  items: AgentOpsItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onEnterFocusMode: () => void;
  onItemAction: (id: string, action: QueueAction) => void;
}

function InlineActionButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  icon?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 text-[11px] text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
      title={label}
    >
      {icon ? (
        <FontAwesomeIcon icon={icon} className="h-3 w-3" />
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
}

export function QueueList({
  items,
  selectedItemId,
  onSelectItem,
  onEnterFocusMode,
  onItemAction,
}: QueueListProps) {
  // Keyboard shortcuts are handled at the page level

  if (items.length === 0) {
    return (
      <div className="h-full flex items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center text-center">
          <FontAwesomeIcon
            icon="fa-solid fa-circle-check"
            className="h-8 w-8 text-green-500 mb-2"
          />
          <p className="text-sm font-medium text-gray-900">No items require attention right now.</p>
          <p className="text-xs text-gray-500 mt-1">Great job — everything is running smoothly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <ul className="divide-y divide-gray-100">
          {items.map((item) => {
            const isSelected = item.id === selectedItemId;
            return (
              <li
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={cn(
                  'flex items-center justify-between px-3 py-2 cursor-pointer transition-colors group border-b border-gray-100 text-xs',
                  isSelected
                    ? 'bg-indigo-50/60 border-l-2 border-l-indigo-500'
                    : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                )}
              >
                <div className="flex-1 min-w-0">
                  {/* Top line: Severity, Type, Status */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[10px] font-medium border',
                        getSeverityColor(item.severity)
                      )}
                    >
                      {item.severity}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {formatTypeLabel(item.type)}
                    </span>
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[10px] font-medium',
                        getStatusColor(item.status)
                      )}
                    >
                      {formatStatusLabel(item.status)}
                    </span>
                  </div>
                  {/* Main line: Title */}
                  <div className="text-xs font-medium text-gray-900 truncate mb-0.5" title={item.title}>
                    {item.title}
                  </div>
                  {/* Sub-line: Person • Agent • Created */}
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 truncate">
                    {item.person && (
                      <span className="truncate" title={item.person.name}>
                        {item.person.name}
                      </span>
                    )}
                    {item.person && item.agentName && <span>•</span>}
                    {item.agentName && (
                      <span className="truncate" title={item.agentName}>
                        {item.agentName}
                      </span>
                    )}
                    {(item.person || item.agentName) && <span>•</span>}
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
                <div className="ml-3 flex gap-1 items-center">
                  {/* Review button - always visible on selected row */}
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item.id);
                        onEnterFocusMode();
                      }}
                      className="px-2 py-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors flex items-center gap-1"
                      title="Enter Review Mode"
                    >
                      <FontAwesomeIcon icon="fa-solid fa-eye" className="h-3 w-3" />
                      Review
                    </button>
                  )}
                  {/* Other actions - show on hover for non-selected, always for selected */}
                  <div className={cn(
                    "hidden gap-1 md:flex",
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"
                  )}>
                    {item.status === 'Open' && (
                      <>
                        <InlineActionButton
                          label="Resolve"
                          onClick={(e) => {
                            e.stopPropagation();
                            onItemAction(item.id, 'resolve');
                          }}
                          icon="fa-solid fa-check"
                        />
                        <InlineActionButton
                          label="Snooze"
                          onClick={(e) => {
                            e.stopPropagation();
                            onItemAction(item.id, 'snooze');
                          }}
                          icon="fa-solid fa-clock"
                        />
                      </>
                    )}
                    {item.status === 'Snoozed' && (
                      <>
                        <InlineActionButton
                          label="Unsnooze"
                          onClick={(e) => {
                            e.stopPropagation();
                            onItemAction(item.id, 'unsnooze');
                          }}
                          icon="fa-solid fa-bell"
                        />
                        <InlineActionButton
                          label="Extend"
                          onClick={(e) => {
                            e.stopPropagation();
                            onItemAction(item.id, 'extendSnooze');
                          }}
                          icon="fa-solid fa-clock"
                        />
                      </>
                    )}
                    {item.status === 'Resolved' && (
                      <InlineActionButton
                        label="Reopen"
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemAction(item.id, 'reopen');
                        }}
                        icon="fa-solid fa-rotate-left"
                      />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
  );
}

