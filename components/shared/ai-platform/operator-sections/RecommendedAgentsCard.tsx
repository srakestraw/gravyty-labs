'use client';

import Link from 'next/link';

interface RecommendedAgent {
  id: string;
  name: string;
  purpose: string;
}

interface RecommendedAgentsCardProps {
  agents: RecommendedAgent[];
  basePath?: string;
}

export function RecommendedAgentsCard({ agents, basePath = '/student-lifecycle/admissions' }: RecommendedAgentsCardProps) {
  if (agents.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-900">Recommended Agents</h2>
      <div className="bg-white border border-gray-200 rounded-lg p-2.5">
        <div className="space-y-2 text-xs">
          {agents.map((agent) => (
            <div key={agent.id} className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-medium truncate">{agent.name}</p>
                <p className="text-gray-600 text-[11px] line-clamp-1">{agent.purpose}</p>
              </div>
              <Link
                href={`${basePath}/agents/${agent.id}`}
                className="text-purple-600 hover:text-purple-800 text-xs font-medium whitespace-nowrap flex-shrink-0"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}









