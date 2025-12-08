'use client';

import { AgentOpsFilters, AgentOpsPersonRef } from '@/lib/agent-ops/types';
import { AgentOpsFiltersBar } from '@/components/ai-assistants/agent-ops/AgentOpsFiltersBar';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';

interface PersonSummary {
  person: AgentOpsPersonRef;
  openItemsCount: number;
  highestSeverity: string;
}

interface PeopleListPaneProps {
  people: PersonSummary[];
  selectedPersonId: string | null;
  onSelectPerson: (personId: string) => void;
  filters: AgentOpsFilters;
  onFiltersChange: (filters: AgentOpsFilters) => void;
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

export function PeopleListPane({
  people,
  selectedPersonId,
  onSelectPerson,
  filters,
  onFiltersChange,
}: PeopleListPaneProps) {
  return (
    <div className="flex h-full flex-col space-y-4 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <AgentOpsFiltersBar filters={filters} onFiltersChange={onFiltersChange} />
      </div>

      {/* People List */}
      <div className="flex-1 overflow-y-auto">
        {people.length === 0 ? (
          <div className="p-8 text-center">
            <FontAwesomeIcon icon="fa-solid fa-users-slash" className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">No people found</p>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {people.map((summary) => {
              const isSelected = summary.person.id === selectedPersonId;
              return (
                <button
                  key={summary.person.id}
                  onClick={() => onSelectPerson(summary.person.id)}
                  className={cn(
                    'w-full p-4 text-left transition-all duration-150',
                    'hover:bg-gray-50 focus:outline-none focus:bg-gray-50',
                    isSelected && 'bg-purple-50 border-l-4 border-purple-500'
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
                    {summary.openItemsCount > 0 && (
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
                      {summary.openItemsCount} open{' '}
                      {summary.openItemsCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}




