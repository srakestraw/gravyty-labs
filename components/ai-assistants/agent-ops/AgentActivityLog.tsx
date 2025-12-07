'use client';

import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface AgentLog {
  id: string;
  timestamp: string;
  action: string;
  outcome: string;
  assistantId: string;
}

interface AgentActivityLogProps {
  logs: AgentLog[];
}

export function AgentActivityLog({ logs }: AgentActivityLogProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <FontAwesomeIcon icon="fa-solid fa-clock" className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No activity recorded for this agent</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-200">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900">{log.action}</span>
                <span className="text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-600">{log.outcome}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


