'use client';

import { AgentOpsItem } from '@/lib/agent-ops/types';
import { QueueRow } from '@/components/ai-assistants/agent-ops/queue/QueueRow';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import React from 'react';

interface PersonQueueTabProps {
  items: AgentOpsItem[];
}

export function PersonQueueTab({ items }: PersonQueueTabProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <FontAwesomeIcon icon="fa-solid fa-check-circle" className="h-8 w-8 text-green-500 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-900">No queue items</p>
        <p className="text-xs text-gray-500 mt-1">This person has no items in the queue.</p>
      </div>
    );
  }

  // Stub handlers for queue actions
  const handleResolve = async (id: string) => {
    console.log('Resolve item:', id);
  };

  const handleSnooze = async (id: string) => {
    console.log('Snooze item:', id);
  };

  const handleAssign = async (id: string, userId: string) => {
    console.log('Assign item:', id, 'to user:', userId);
  };

  const handleUnsnooze = async (id: string) => {
    console.log('Unsnooze item:', id);
  };

  const handleExtendSnooze = async (id: string) => {
    console.log('Extend snooze item:', id);
  };

  const handleReopen = async (id: string) => {
    console.log('Reopen item:', id);
  };

  return (
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
            {items.map((item) => (
              <QueueRow
                key={item.id}
                item={item}
                onSelect={() => {}}
                onResolve={handleResolve}
                onSnooze={handleSnooze}
                onAssign={handleAssign}
                onUnsnooze={handleUnsnooze}
                onExtendSnooze={handleExtendSnooze}
                onReopen={handleReopen}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

