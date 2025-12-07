'use client';

import { PersonRecord, PersonAgentAssignment, roleLabel } from '@/lib/agent-ops/people-mock';
import { AgentOpsItem } from '@/lib/agent-ops/types';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface PersonOverviewTabProps {
  person: PersonRecord;
  queueItems: AgentOpsItem[];
  assignments: PersonAgentAssignment[];
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

export function PersonOverviewTab({ person, queueItems, assignments }: PersonOverviewTabProps) {
  const openItems = queueItems.filter((item) => item.status !== 'Resolved');
  const lastActivity = assignments.length > 0
    ? assignments.reduce((latest, a) => {
        const latestTime = new Date(latest.lastActionAt).getTime();
        const currentTime = new Date(a.lastActionAt).getTime();
        return currentTime > latestTime ? a : latest;
      })
    : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">At a Glance</h3>

      <div className="space-y-4">
        {/* Open Items Summary */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
          <div>
            <p className="text-xs text-gray-500">Open Items in Queue</p>
            <p className="text-lg font-semibold text-gray-900">{openItems.length}</p>
          </div>
          {openItems.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
              {openItems.length} {openItems.length === 1 ? 'item' : 'items'} require attention
            </span>
          )}
        </div>

        {/* Last Engagement */}
        {lastActivity ? (
          <div className="p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Last Engagement</p>
            <p className="text-sm text-gray-900">
              Last action {formatDate(lastActivity.lastActionAt)} by{' '}
              <span className="font-medium">{lastActivity.agentName}</span>
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Last Engagement</p>
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        )}

        {/* Role-Specific Metrics */}
        {person.roles.includes('student') && (
          <div className="p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Student Information</p>
            <p className="text-sm text-gray-900">Student ID: {person.primaryId}</p>
            <p className="text-xs text-gray-500 mt-1">
              {openItems.length > 0
                ? `${openItems.length} active ${openItems.length === 1 ? 'item' : 'items'} requiring attention`
                : 'No active items'}
            </p>
          </div>
        )}

        {person.roles.includes('donor') && (
          <div className="p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Donor Information</p>
            <p className="text-sm text-gray-900">Constituent ID: {person.primaryId}</p>
            <p className="text-xs text-gray-500 mt-1">Donor status: Active</p>
          </div>
        )}

        {person.roles.includes('prospect') && (
          <div className="p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Prospect Information</p>
            <p className="text-sm text-gray-900">Prospect ID: {person.primaryId}</p>
            <p className="text-xs text-gray-500 mt-1">
              {openItems.length > 0
                ? `${openItems.length} active ${openItems.length === 1 ? 'item' : 'items'} in pipeline`
                : 'No active items'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

