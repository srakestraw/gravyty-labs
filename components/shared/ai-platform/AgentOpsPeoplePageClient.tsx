'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { AgentOpsFilters, AgentOpsItem, AgentOpsPersonRef } from '@/lib/agent-ops/types';
import { getMockAgentOpsItems } from '@/lib/agent-ops/mock';
import {
  getPersonById,
  getAssignmentsForPerson,
  getActivityForPerson,
  getQueueItemsForPerson,
} from '@/lib/agent-ops/people-mock';
import { PeopleListPane } from '@/components/ai-assistants/agent-ops/people/PeopleListPane';
import { PersonDetailPane } from '@/components/ai-assistants/agent-ops/people/PersonDetailPane';
import type { AiPlatformPageContext } from '@/components/shared/ai-platform/types';
import { getAiPlatformBasePath } from '@/components/shared/ai-platform/types';

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
  openItemsCount: number;
}

export function AgentOpsPeoplePageClient({ context }: { context?: AiPlatformPageContext }) {
  const allItems = getMockAgentOpsItems();
  
  // Initialize filters with defaults if in workspace mode
  const getInitialFilters = (): AgentOpsFilters => {
    const baseFilters: AgentOpsFilters = {
      role: 'All',
      status: 'All',
      type: 'All',
      severity: 'All',
      assignee: 'All',
      search: '',
    };
    
    // Apply workspace defaults only on initial load
    if (context?.mode === 'workspace' && context?.defaults?.peopleFilters) {
      return { ...baseFilters, ...context.defaults.peopleFilters };
    }
    
    return baseFilters;
  };
  
  const [filters, setFilters] = useState<AgentOpsFilters>(getInitialFilters);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const defaultsAppliedRef = useRef(false);
  
  // Apply defaults only once on mount for workspace mode
  useEffect(() => {
    if (
      !defaultsAppliedRef.current &&
      context?.mode === 'workspace' &&
      context?.defaults?.peopleFilters
    ) {
      defaultsAppliedRef.current = true;
      setFilters((prev) => ({ ...prev, ...context.defaults!.peopleFilters }));
    }
  }, [context]);

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
          !item.person?.email?.toLowerCase().includes(searchLower) &&
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
          openItemsCount: 0,
        });
      }

      const summary = personMap.get(personId)!;
      summary.items.push(item);
      if (item.status !== 'Resolved') {
        summary.openItems.push(item);
      }
    });

    // Calculate highest severity and open items count for each person
    personMap.forEach((summary) => {
      summary.highestSeverity = getHighestSeverity(summary.openItems);
      summary.openItemsCount = summary.openItems.length;
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

  // Auto-select first person when list changes
  useEffect(() => {
    if (!selectedPersonId && peopleSummaries.length > 0) {
      setSelectedPersonId(peopleSummaries[0].person.id);
    }
  }, [peopleSummaries, selectedPersonId]);

  // Get selected person data
  const selectedPerson = selectedPersonId ? (getPersonById(selectedPersonId) ?? null) : null;
  const assignments = selectedPerson ? getAssignmentsForPerson(selectedPerson.id) : [];
  const queueItems = selectedPerson ? (getQueueItemsForPerson(selectedPerson.id) as AgentOpsItem[]) : [];
  const activity = selectedPerson ? getActivityForPerson(selectedPerson.id) : [];

  // Use peopleLabel from context if provided, otherwise default to "People"
  const headerLabel = context?.peopleLabel ? `People (${context.peopleLabel})` : 'People';
  const basePath = getAiPlatformBasePath(context);

  return (
    <div className="flex h-full flex-col space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-gray-900">{headerLabel}</h1>
        <p className="text-sm text-gray-600">
          See how agents are interacting with each person and where attention is needed.
        </p>
      </header>

      <div className="grid h-[calc(100vh-164px)] gap-4 grid-cols-1 md:grid-cols-[380px,1fr]">
        <PeopleListPane
          people={peopleSummaries}
          selectedPersonId={selectedPersonId}
          onSelectPerson={setSelectedPersonId}
          filters={filters}
          onFiltersChange={setFilters}
        />
        <PersonDetailPane
          key={selectedPersonId || 'empty'}
          person={selectedPerson}
          assignments={assignments}
          queueItems={queueItems}
          activity={activity}
          basePath={basePath}
        />
      </div>
    </div>
  );
}



