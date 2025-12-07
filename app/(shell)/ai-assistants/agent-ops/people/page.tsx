'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AgentOpsFilters, AgentOpsItem, AgentOpsPersonRef } from '@/lib/agent-ops/types';
import { getMockAgentOpsItems } from '@/lib/agent-ops/mock';
import { AgentOpsFiltersBar } from '@/components/ai-assistants/agent-ops/AgentOpsFiltersBar';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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

function getHighestSeverity(items: AgentOpsItem[]): string {
  const severityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  let highest = 'Low';
  let highestValue = 0;
  items.forEach((item) => {
    const value = severityOrder[item.severity as keyof typeof severityOrder] || 0;
    if (value > highestValue) {
      highestValue = value;
      highest = item.severity;
    }
  });
  return highest;
}

interface PersonSummary {
  person: AgentOpsPersonRef;
  items: AgentOpsItem[];
  openItems: AgentOpsItem[];
  highestSeverity: string;
}

export default function PeoplePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const allItems = getMockAgentOpsItems();
  const [filters, setFilters] = useState<AgentOpsFilters>({
    role: 'All',
    status: 'All',
    type: 'All',
    severity: 'All',
    assignee: 'All',
    search: '',
  });
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Get selected person from URL query param
  useEffect(() => {
    const personId = searchParams.get('id');
    if (personId) {
      setSelectedPersonId(personId);
    }
  }, [searchParams]);

  // Filter items
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

  // Group items by person
  const peopleSummaries = useMemo(() => {
    const personMap = new Map<string, PersonSummary>();

    filteredItems.forEach((item) => {
      if (!item.person) return;

      const personId = item.person.id;
      if (!personMap.has(personId)) {
        personMap.set(personId, {
          person: item.person,
          items: [],
          openItems: [],
          highestSeverity: 'Low',
        });
      }

      const summary = personMap.get(personId)!;
      summary.items.push(item);
      if (item.status !== 'Resolved') {
        summary.openItems.push(item);
      }
    });

    // Calculate highest severity for each person
    personMap.forEach((summary) => {
      summary.highestSeverity = getHighestSeverity(summary.openItems);
    });

    return Array.from(personMap.values()).sort((a, b) => {
      // Sort by highest severity first, then by number of open items
      const severityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      const aSeverity = severityOrder[a.highestSeverity as keyof typeof severityOrder] || 0;
      const bSeverity = severityOrder[b.highestSeverity as keyof typeof severityOrder] || 0;
      if (aSeverity !== bSeverity) {
        return bSeverity - aSeverity;
      }
      return b.openItems.length - a.openItems.length;
    });
  }, [filteredItems]);

  const selectedPerson = useMemo(() => {
    if (!selectedPersonId) return null;
    return peopleSummaries.find((p) => p.person.id === selectedPersonId) || null;
  }, [selectedPersonId, peopleSummaries]);

  const handlePersonClick = (personId: string) => {
    setSelectedPersonId(personId);
    router.push(`/ai-assistants/agent-ops/people?id=${personId}`, { scroll: false });
  };

  // Group items by status
  const itemsByStatus = useMemo(() => {
    if (!selectedPerson) return { Open: [], InProgress: [], Snoozed: [], Resolved: [] };
    const grouped: Record<string, AgentOpsItem[]> = {
      Open: [],
      InProgress: [],
      Snoozed: [],
      Resolved: [],
    };
    selectedPerson.items.forEach((item) => {
      if (grouped[item.status]) {
        grouped[item.status].push(item);
      }
    });
    return grouped;
  }, [selectedPerson]);

  // Get unique agents for selected person
  const agentsForPerson = useMemo(() => {
    if (!selectedPerson) return [];
    const agentMap = new Map<string, { id: string; name: string }>();
    selectedPerson.items.forEach((item) => {
      if (item.agentId && item.agentName) {
        agentMap.set(item.agentId, { id: item.agentId, name: item.agentName });
      }
    });
    return Array.from(agentMap.values());
  }, [selectedPerson]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agent Ops — People</h1>
        <p className="text-sm text-gray-600 mt-1">
          See how agents are interacting with each person and where attention is needed.
        </p>
      </div>

      {/* Filters */}
      <AgentOpsFiltersBar filters={filters} onFiltersChange={setFilters} />

      {/* Main Content: Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: People List */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-900">People</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {peopleSummaries.length} {peopleSummaries.length === 1 ? 'person' : 'people'}
              </p>
            </div>
            <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
              {peopleSummaries.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No people found matching your filters.
                </div>
              ) : (
                peopleSummaries.map((summary) => (
                  <button
                    key={summary.person.id}
                    onClick={() => handlePersonClick(summary.person.id)}
                    className={cn(
                      'w-full p-4 text-left hover:bg-gray-50 transition-colors',
                      selectedPersonId === summary.person.id && 'bg-purple-50'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {summary.person.name}
                        </div>
                        {summary.person.email && (
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {summary.person.email}
                          </div>
                        )}
                      </div>
                      {summary.openItems.length > 0 && (
                        <span
                          className={cn(
                            'ml-2 px-2 py-0.5 rounded text-xs font-medium border flex-shrink-0',
                            getSeverityColor(summary.highestSeverity)
                          )}
                        >
                          {summary.highestSeverity}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {summary.person.primaryRole && (
                        <span>{summary.person.primaryRole}</span>
                      )}
                      <span className="font-medium">
                        {summary.openItems.length} open{' '}
                        {summary.openItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Person Detail Panel */}
        <div className="lg:col-span-2">
          {selectedPerson ? (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              {/* Person Card */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedPerson.person.name}</h2>
                    {selectedPerson.person.email && (
                      <div className="text-sm text-gray-600 mt-1">{selectedPerson.person.email}</div>
                    )}
                    {selectedPerson.person.primaryRole && (
                      <div className="text-xs text-gray-500 mt-1">{selectedPerson.person.primaryRole}</div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/ai-assistants/agent-ops/queue?personId=${selectedPerson.person.id}`)}
                  >
                    View in Queue
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Total Items</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedPerson.items.length}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Open Items</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedPerson.openItems.length}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Highest Severity</div>
                    <div className="text-lg font-semibold text-gray-900">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium border',
                          getSeverityColor(selectedPerson.highestSeverity)
                        )}
                      >
                        {selectedPerson.highestSeverity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agents Acting on This Person */}
              {agentsForPerson.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Agents</h3>
                  <div className="space-y-2">
                    {agentsForPerson.map((agent) => (
                      <Link
                        key={agent.id}
                        href={`/ai-assistants/agents/${agent.id}`}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm text-gray-900">{agent.name}</span>
                        <FontAwesomeIcon
                          icon="fa-solid fa-chevron-right"
                          className="h-4 w-4 text-gray-400"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Items Grouped by Status */}
              <div className="p-6 space-y-6">
                {(['Open', 'InProgress', 'Snoozed', 'Resolved'] as const).map((status) => {
                  const items = itemsByStatus[status];
                  if (items.length === 0) return null;

                  return (
                    <div key={status}>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        {status} ({items.length})
                      </h3>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{item.summary}</div>
                              </div>
                              <div className="flex gap-1 ml-2">
                                <span
                                  className={cn(
                                    'px-2 py-0.5 rounded text-xs font-medium border',
                                    getSeverityColor(item.severity)
                                  )}
                                >
                                  {item.severity}
                                </span>
                                <span
                                  className={cn(
                                    'px-2 py-0.5 rounded text-xs font-medium',
                                    getStatusColor(item.status)
                                  )}
                                >
                                  {item.status}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {item.agentName && <span>{item.agentName}</span>}
                              <span>•</span>
                              <span>{item.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Reassign
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Resolve All
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Escalate
                  </Button>
                </div>
                <Link
                  href={`/ai-assistants/logs?personId=${selectedPerson.person.id}`}
                  className="block mt-2 text-center text-xs text-purple-600 hover:text-purple-700"
                >
                  View full history & logs →
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12 text-center">
              <FontAwesomeIcon
                icon="fa-solid fa-users"
                className="h-12 w-12 text-gray-300 mx-auto mb-4"
              />
              <h3 className="text-sm font-medium text-gray-900 mb-1">Select a person</h3>
              <p className="text-xs text-gray-500">
                Choose a person from the list to view their details and items
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

