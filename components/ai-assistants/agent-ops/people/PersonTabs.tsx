'use client';

import { cn } from '@/lib/utils';

interface PersonTabsProps {
  activeTab: 'overview' | 'activity' | 'queue' | 'guardrails';
  onChange: (tab: 'overview' | 'activity' | 'queue' | 'guardrails') => void;
}

export function PersonTabs({ activeTab, onChange }: PersonTabsProps) {
  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'activity' as const, label: 'Activity Log' },
    { id: 'queue' as const, label: 'Queue Items' },
    { id: 'guardrails' as const, label: 'Guardrails / Flags' },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}


