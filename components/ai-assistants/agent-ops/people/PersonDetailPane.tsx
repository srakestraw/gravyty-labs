'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PersonRecord, PersonAgentAssignment, PersonActivity, roleLabel } from '@/lib/agent-ops/people-mock';
import { AgentOpsItem } from '@/lib/agent-ops/types';
import { PersonSummaryCard } from './PersonSummaryCard';
import { PersonTabs } from './PersonTabs';
import { PersonOverviewTab } from './PersonOverviewTab';
import { PersonActivityTab } from './PersonActivityTab';
import { PersonQueueTab } from './PersonQueueTab';
import { PersonGuardrailsTab } from './PersonGuardrailsTab';

interface PersonDetailPaneProps {
  person: PersonRecord | null;
  assignments: PersonAgentAssignment[];
  queueItems: AgentOpsItem[];
  activity: PersonActivity[];
  basePath?: string;
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

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
}

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

function formatTypeLabel(raw: string): string {
  return TYPE_LABELS[raw] ?? raw;
}

function formatStatusLabel(raw: string): string {
  const STATUS_LABELS: Record<string, string> = {
    Open: 'Open',
    InProgress: 'In Progress',
    Snoozed: 'Snoozed',
    Resolved: 'Resolved',
  };
  return STATUS_LABELS[raw] ?? raw;
}

export function PersonDetailPane({ person, assignments, queueItems, activity, basePath = '/ai-assistants' }: PersonDetailPaneProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'activity' | 'queue' | 'guardrails'>('overview');

  // Reset active tab when person changes to prevent dropdown menu cleanup issues
  React.useEffect(() => {
    setActiveTab('overview');
  }, [person?.id]);

  const openItems = person ? queueItems.filter((item) => item.status !== 'Resolved') : [];
  const highestSeverity = openItems.length > 0
    ? openItems.reduce((highest, item) => {
        const severityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        const currentValue = severityOrder[item.severity as keyof typeof severityOrder] || 0;
        const highestValue = severityOrder[highest.severity as keyof typeof severityOrder] || 0;
        return currentValue > highestValue ? item : highest;
      }, openItems[0])
    : null;

  const handleViewInQueue = () => {
    if (person) {
      router.push(`${basePath}/agent-ops/queue?personId=${encodeURIComponent(person.id)}`);
    }
  };

  const handleViewInLogs = () => {
    if (person) {
      router.push(`${basePath}/logs?scope=person&personId=${encodeURIComponent(person.id)}`);
    }
  };

  const handlePauseAllAgents = () => {
    // TODO: Implement pause all agents
    if (person) {
      console.log('Pause all agents for person:', person.id);
    }
  };

  const handleAddAgent = () => {
    // TODO: Implement add agent
    if (person) {
      console.log('Add agent for person:', person.id);
    }
  };

  const handleCreateTask = () => {
    // TODO: Implement create task
    if (person) {
      console.log('Create task for person:', person.id);
    }
  };

  if (!person) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-gray-200 bg-white p-8">
        <div className="text-center">
          <FontAwesomeIcon icon="fa-solid fa-user" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-900">Select a person to view details</p>
          <p className="text-xs text-gray-500 mt-1">Choose someone from the list to see their details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">{person.name}</h2>
              <p className="text-sm text-gray-600 truncate mt-0.5">
                {person.contacts.find((c) => c.primary)?.value || person.contacts[0]?.value || 'No email'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">
                  {person.roles.map(roleLabel).join(' • ')}
                </span>
                {highestSeverity && (
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium border',
                      getSeverityColor(highestSeverity.severity)
                    )}
                  >
                    {highestSeverity.severity}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {person.doNotEngage?.global && (
              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                <FontAwesomeIcon icon="fa-solid fa-user-slash" className="h-3 w-3 mr-1" />
                Do Not Engage
              </span>
            )}
            {queueItems.some((item) => item.type === 'QuietHours') && (
              <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700">
                <FontAwesomeIcon icon="fa-solid fa-moon" className="h-3 w-3 mr-1" />
                Quiet Hours
              </span>
            )}
            {person.roles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
              >
                {roleLabel(role)}
              </span>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleViewInQueue} className="text-xs">
              <FontAwesomeIcon icon="fa-solid fa-list" className="h-3 w-3 mr-1.5" />
              View in Queue
            </Button>
            <Button variant="outline" size="sm" onClick={handleViewInLogs} className="text-xs">
              <FontAwesomeIcon icon="fa-solid fa-file-lines" className="h-3 w-3 mr-1.5" />
              View in Logs
            </Button>
            <Button variant="outline" size="sm" onClick={handlePauseAllAgents} className="text-xs">
              <FontAwesomeIcon icon="fa-solid fa-pause" className="h-3 w-3 mr-1.5" />
              Pause All Agents
            </Button>
            <Button variant="outline" size="sm" onClick={handleAddAgent} className="text-xs">
              <FontAwesomeIcon icon="fa-solid fa-plus" className="h-3 w-3 mr-1.5" />
              Add Agent
            </Button>
            <Button variant="outline" size="sm" onClick={handleCreateTask} className="text-xs">
              <FontAwesomeIcon icon="fa-solid fa-tasks" className="h-3 w-3 mr-1.5" />
              Create Task
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Active Agents Section */}
          {assignments.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Active Agents</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Agents currently engaged with this person.
                </p>
              </div>
              <div className="space-y-2">
                {assignments.map((assignment) => {
                  const statusColors = {
                    active: 'bg-green-50 text-green-700',
                    paused: 'bg-yellow-50 text-yellow-700',
                    on_hold: 'bg-gray-50 text-gray-700',
                  };
                  return (
                    <div
                      key={assignment.agentId}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {assignment.agentName}
                          </span>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-xs font-medium',
                              statusColors[assignment.status]
                            )}
                          >
                            {assignment.status === 'active' ? 'Running' : assignment.status === 'paused' ? 'Paused' : 'On Hold'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{assignment.agentRole}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            Last activity {formatDate(assignment.lastActionAt)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          router.push(`${basePath}/agents/${assignment.agentId}`);
                        }}
                        className="text-xs ml-2 flex-shrink-0"
                      >
                        View Agent
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items Requiring Attention */}
          {openItems.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Items Requiring Attention</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Errors, guardrails, human review, and other items this person is involved in.
                </p>
              </div>
              <div className="space-y-2">
                {openItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-xs font-medium border',
                            getSeverityColor(item.severity)
                          )}
                        >
                          {item.severity}
                        </span>
                        <span className="text-xs text-gray-500">{formatTypeLabel(item.type)}</span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-xs font-medium',
                            getStatusColor(item.status)
                          )}
                        >
                          {formatStatusLabel(item.status)}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.summary}</div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>{formatDate(item.createdAt)}</span>
                        {item.agentName && (
                          <>
                            <span>•</span>
                            <span>{item.agentName}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      {item.status === 'Open' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => console.log('Resolve:', item.id)}
                          >
                            Resolve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => console.log('Snooze:', item.id)}
                          >
                            Snooze
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {openItems.length > 5 && (
                  <Link
                    href={`/ai-assistants/agent-ops/queue?personId=${encodeURIComponent(person.id)}`}
                    className="block text-center text-xs text-indigo-600 hover:text-indigo-700 font-medium py-2"
                  >
                    View all {openItems.length} items in Queue →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Activity Log Preview */}
          {activity.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Activity Log</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Recent activity for this person.</p>
                </div>
                <Link
                  href={`${basePath}/logs?scope=person&personId=${encodeURIComponent(person.id)}`}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  View in Logs
                  <FontAwesomeIcon icon="fa-solid fa-arrow-right" className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {activity.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <FontAwesomeIcon
                        icon={
                          log.channel === 'email'
                            ? 'fa-solid fa-envelope'
                            : log.channel === 'sms'
                            ? 'fa-solid fa-message'
                            : log.channel === 'phone'
                            ? 'fa-solid fa-phone'
                            : 'fa-solid fa-flag'
                        }
                        className="h-4 w-4 text-gray-400"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="text-sm text-gray-900 mt-0.5">{log.description}</div>
                      {log.agentName && (
                        <div className="text-xs text-gray-500 mt-0.5">by {log.agentName}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs for detailed views */}
          <div className="space-y-3">
            <PersonTabs activeTab={activeTab} onChange={setActiveTab} />
            {activeTab === 'overview' && (
              <PersonOverviewTab key={`overview-${person.id}`} person={person} queueItems={queueItems} assignments={assignments} />
            )}
            {activeTab === 'activity' && (
              <div key={`activity-${person.id}`} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Activity</h3>
                  <Link
                    href={`${basePath}/logs?scope=person&personId=${encodeURIComponent(person.id)}`}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    View this person in Logs
                    <FontAwesomeIcon icon="fa-solid fa-arrow-right" className="h-3 w-3" />
                  </Link>
                </div>
                <PersonActivityTab activity={activity} />
              </div>
            )}
            {activeTab === 'queue' && <PersonQueueTab key={`queue-${person.id}`} items={queueItems} />}
            {activeTab === 'guardrails' && <PersonGuardrailsTab key={`guardrails-${person.id}`} person={person} />}
          </div>
        </div>
    </div>
  );
}

