'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AgentOpsFilters, AgentOpsItem } from '@/lib/agent-ops/types';
import { getMockAgentOpsItems } from '@/lib/agent-ops/mock';
import { AgentOpsFiltersBar } from '@/components/ai-assistants/agent-ops/AgentOpsFiltersBar';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Label mappings
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

// Simple tooltip component
function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </span>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 whitespace-nowrap rounded-lg border border-gray-200 bg-gray-900 px-2 py-1 text-xs text-white shadow-lg">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </span>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
}

interface QueueRowProps {
  item: AgentOpsItem;
  onSelect: () => void;
  onResolve: (id: string) => void;
  onSnooze: (id: string) => void;
  onAssign: (id: string, userId: string) => void;
  onUnsnooze: (id: string) => void;
  onExtendSnooze: (id: string) => void;
  onReopen: (id: string) => void;
}

// Mock assignees for now
const MOCK_ASSIGNEES = [
  { id: 'user-123', name: 'John Doe' },
  { id: 'user-456', name: 'Jane Smith' },
  { id: 'user-789', name: 'Bob Johnson' },
];

function QueueRow({
  item,
  onSelect,
  onResolve,
  onSnooze,
  onAssign,
  onUnsnooze,
  onExtendSnooze,
  onReopen,
}: QueueRowProps) {
  const router = useRouter();

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
  };

  return (
    <tr
      onClick={onSelect}
      className="hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <td className="px-4 py-3 whitespace-nowrap">
        <Tooltip content={`${item.severity} severity - requires immediate attention`}>
          <span
            className={cn(
              'px-2 py-1 rounded text-xs font-medium border',
              getSeverityColor(item.severity)
            )}
          >
            {item.severity}
          </span>
        </Tooltip>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
        {formatTypeLabel(item.type)}
      </td>
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-gray-900 truncate max-w-md" title={item.title}>
          {item.title}
        </div>
        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1 truncate max-w-md" title={item.summary}>
          {item.summary}
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {item.person ? (
          <Tooltip content="Student record in SIS">
            <div className="text-sm text-gray-900 truncate max-w-[120px]" title={item.person.name}>
              {item.person.name}
            </div>
          </Tooltip>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {item.agentName ? (
          <Tooltip content="Agent responsible for this action">
            <div className="text-sm text-gray-900 truncate max-w-[150px]" title={item.agentName}>
              {item.agentName}
            </div>
          </Tooltip>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span
          className={cn(
            'px-2 py-1 rounded text-xs font-medium',
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
      <td className="px-4 py-3 whitespace-nowrap" onClick={handleActionClick}>
        <div className="flex items-center gap-1 justify-end">
          {item.status === 'Open' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onResolve(item.id);
                }}
              >
                Resolve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onSnooze(item.id);
                }}
              >
                Snooze
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={handleActionClick}
                  >
                    Assign
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
            </>
          )}
          {item.status === 'Snoozed' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnsnooze(item.id);
                }}
              >
                Unsnooze
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onExtendSnooze(item.id);
                }}
              >
                Extend
              </Button>
            </>
          )}
          {item.status === 'Resolved' && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onReopen(item.id);
              }}
            >
              Reopen
            </Button>
          )}
          <button
            className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/ai-assistants/agent-ops/queue/${item.id}`);
            }}
            title="View details"
          >
            <FontAwesomeIcon icon="fa-solid fa-arrow-right" className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

interface ItemDetailDrawerProps {
  item: AgentOpsItem | null;
  onClose: () => void;
  onNavigateToPerson: (personId: string) => void;
  onNavigateToAgent: (agentId: string) => void;
}

function ItemDetailDrawer({ item, onClose, onNavigateToPerson, onNavigateToAgent }: ItemDetailDrawerProps) {
  if (!item) return null;

  return (
    <React.Fragment>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-gray-200 shadow-xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Item Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FontAwesomeIcon icon="fa-solid fa-times" className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-1">{item.title}</h4>
          <p className="text-sm text-gray-600">{item.summary}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={cn('px-2 py-1 rounded text-xs font-medium border', getSeverityColor(item.severity))}>
            {item.severity}
          </span>
          <span className={cn('px-2 py-1 rounded text-xs font-medium', getStatusColor(item.status))}>
            {formatStatusLabel(item.status)}
          </span>
          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
            {formatTypeLabel(item.type)}
          </span>
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-200">
          {item.person && (
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Person</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.person.name}</div>
                  {item.person.email && (
                    <div className="text-xs text-gray-500">{item.person.email}</div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onNavigateToPerson(item.person!.id);
                    onClose();
                  }}
                  className="text-xs"
                >
                  View Person
                </Button>
              </div>
            </div>
          )}

          {item.agentName && (
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Agent</div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-900">{item.agentName}</div>
                {item.agentId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onNavigateToAgent(item.agentId!);
                      onClose();
                    }}
                    className="text-xs"
                  >
                    View Agent
                  </Button>
                )}
              </div>
            </div>
          )}

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

          {item.tags && item.tags.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Tags</div>
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200 space-y-2">
          <Button className="w-full" size="sm">
            Change Status
          </Button>
          <Button variant="outline" className="w-full" size="sm">
            Snooze
          </Button>
          <Button variant="outline" className="w-full" size="sm">
            Assign to Me
          </Button>
        </div>
      </div>
      </div>
    </React.Fragment>
  );
}

export default function QueuePage() {
  const router = useRouter();
  const allItems = getMockAgentOpsItems();
  const [filters, setFilters] = useState<AgentOpsFilters>({
    role: 'All',
    status: 'All',
    type: 'All',
    severity: 'All',
    assignee: 'All',
    search: '',
  });
  const [selectedItem, setSelectedItem] = useState<AgentOpsItem | null>(null);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (filters.role !== 'All' && item.role !== filters.role) return false;
      if (filters.status !== 'All' && item.status !== filters.status) return false;
      if (filters.type !== 'All' && item.type !== filters.type) return false;
      if (filters.severity !== 'All' && item.severity !== filters.severity) return false;
      if (filters.assignee === 'Me' && item.assignedTo !== 'user-123') return false;
      if (filters.assignee === 'Unassigned' && item.assignedTo) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !item.title.toLowerCase().includes(searchLower) &&
          !item.summary.toLowerCase().includes(searchLower) &&
          !item.person?.name.toLowerCase().includes(searchLower) &&
          !item.agentName?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [allItems, filters]);

  const handleNavigateToPerson = (personId: string) => {
    router.push(`/ai-assistants/agent-ops/people?id=${personId}`);
  };

  const handleNavigateToAgent = (agentId: string) => {
    router.push(`/ai-assistants/agents/${agentId}`);
  };

  // Action handlers (stubbed for now)
  const handleResolve = async (id: string) => {
    // TODO: Call API to resolve item
    console.log('Resolve item:', id);
    // Refresh items or update state
  };

  const handleSnooze = async (id: string) => {
    // TODO: Open snooze modal
    console.log('Snooze item:', id);
  };

  const handleAssign = async (id: string, userId: string) => {
    // TODO: Call API to assign item
    console.log('Assign item:', id, 'to user:', userId);
  };

  const handleUnsnooze = async (id: string) => {
    // TODO: Call API to unsnooze item
    console.log('Unsnooze item:', id);
  };

  const handleExtendSnooze = async (id: string) => {
    // TODO: Open extend snooze modal
    console.log('Extend snooze item:', id);
  };

  const handleReopen = async (id: string) => {
    // TODO: Call API to reopen item
    console.log('Reopen item:', id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agent Ops — Queue</h1>
        <p className="text-sm text-gray-600 mt-1">
          All items that require attention across your agent ecosystem. Filter, triage, and resolve issues in real time.
        </p>
      </div>

      {/* Filters */}
      <AgentOpsFiltersBar filters={filters} onFiltersChange={setFilters} />

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Person
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  SLA
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <FontAwesomeIcon
                        icon="fa-solid fa-circle-check"
                        className="h-8 w-8 text-green-500 mb-2"
                      />
                      <p className="text-sm font-medium text-gray-900">No items require attention right now.</p>
                      <p className="text-xs text-gray-500 mt-1">Great job — everything is running smoothly.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <QueueRow
                    key={item.id}
                    item={item}
                    onSelect={() => setSelectedItem(item)}
                    onResolve={handleResolve}
                    onSnooze={handleSnooze}
                    onAssign={handleAssign}
                    onUnsnooze={handleUnsnooze}
                    onExtendSnooze={handleExtendSnooze}
                    onReopen={handleReopen}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedItem && (
        <ItemDetailDrawer
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onNavigateToPerson={handleNavigateToPerson}
          onNavigateToAgent={handleNavigateToAgent}
        />
      )}
    </div>
  );
}

