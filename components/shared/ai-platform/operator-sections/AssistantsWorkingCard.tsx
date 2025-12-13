'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { AdmissionsOperatorAssistantData } from '@/lib/data/provider';

interface AssistantsWorkingCardProps {
  data: AdmissionsOperatorAssistantData[];
  basePath?: string;
}

export function AssistantsWorkingCard({ data, basePath = '/student-lifecycle/admissions' }: AssistantsWorkingCardProps) {
  const [showAssistants, setShowAssistants] = useState(true);

  if (data.length === 0) {
    return (
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Assistants Working for You</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-500">No assistants active at this time.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-900">Assistants Working for You</h2>
        <button
          type="button"
          className="text-xs text-gray-500 hover:text-gray-700"
          onClick={() => setShowAssistants((prev) => !prev)}
        >
          {showAssistants ? 'Hide' : 'Show'}
        </button>
      </div>
      {showAssistants && (
        <div className="space-y-2">
          {data.map((assistant) => (
            <div key={assistant.id} className="bg-white border border-gray-200 rounded-lg p-2.5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">{assistant.name}</h4>
                  <p className="text-xs text-gray-600 mt-0.5">{assistant.description}</p>
                </div>
                <span
                  className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full flex-shrink-0',
                    getStatusColor(assistant.status)
                  )}
                >
                  {assistant.status}
                </span>
              </div>
              <Link
                href={`${basePath}/${assistant.id}`}
                className="text-xs text-purple-600 hover:text-purple-800 font-medium"
              >
                View →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

