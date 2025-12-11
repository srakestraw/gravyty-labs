'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// TODO: Replace mock data with API from Data Cloud
const mockTasks = [
  {
    id: '1',
    type: 'AI Assistant',
    title: 'Review AI Assistant approval request',
    description: 'Admissions AI has requested approval to send follow-up email to 5 prospective students',
    source: 'AI Assistant',
    sourceColor: 'bg-purple-100 text-purple-700',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    type: 'Fundraising',
    title: 'Follow up with major donor prospect',
    description: 'John Smith - $50K potential gift needs stewardship call',
    source: 'Raise',
    sourceColor: 'bg-blue-100 text-blue-700',
    timestamp: '4 hours ago',
  },
  {
    id: '3',
    type: 'Students',
    title: 'Student at risk alert',
    description: 'Sarah Johnson has missed 3 consecutive classes and may need intervention',
    source: 'SIS',
    sourceColor: 'bg-indigo-100 text-indigo-700',
    timestamp: '6 hours ago',
  },
  {
    id: '4',
    type: 'Events',
    title: 'Event registration deadline approaching',
    description: 'Alumni Reunion 2024 - Registration closes in 2 days',
    source: 'Graduway',
    sourceColor: 'bg-green-100 text-green-700',
    timestamp: '1 day ago',
  },
  {
    id: '5',
    type: 'AI Assistant',
    title: 'AI task completed - review results',
    description: 'Registrar AI completed course registration for 12 students',
    source: 'AI Assistant',
    sourceColor: 'bg-purple-100 text-purple-700',
    timestamp: '1 day ago',
  },
  {
    id: '6',
    type: 'Fundraising',
    title: 'Annual giving campaign update',
    description: 'Campaign progress: 68% of goal reached - needs attention',
    source: 'Advance',
    sourceColor: 'bg-blue-100 text-blue-700',
    timestamp: '2 days ago',
  },
];

const filterTabs = ['All', 'AI', 'Engagement', 'Advancement', 'Students', 'Events'] as const;
type FilterTab = typeof filterTabs[number];

export function ActionCenter() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');

  // TODO: Wire filtering to real data when API is available
  const filteredTasks = activeFilter === 'All'
    ? mockTasks
    : mockTasks.filter(task => {
        if (activeFilter === 'AI') return task.type === 'AI Assistant';
        if (activeFilter === 'Engagement') return task.type === 'Events'; // Engagement includes events and community activities
        if (activeFilter === 'Advancement') return task.type === 'Fundraising'; // Map old "Fundraising" to "Advancement"
        if (activeFilter === 'Students') return task.type === 'Students';
        if (activeFilter === 'Events') return task.type === 'Events';
        return true;
      });

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">My Tasks & Alerts</h2>
        <span className="text-sm text-gray-500">{filteredTasks.length} items</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 pb-4 border-b">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              activeFilter === tab
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start justify-between gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn('px-2 py-0.5 rounded text-xs font-medium', task.sourceColor)}>
                  {task.source}
                </span>
                <span className="text-xs text-gray-500">{task.timestamp}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{task.title}</h3>
              <p className="text-sm text-gray-600">{task.description}</p>
            </div>
            <Button variant="outline" size="sm" className="flex-shrink-0">
              View
            </Button>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FontAwesomeIcon icon="fa-solid fa-inbox" className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No tasks found for this filter</p>
        </div>
      )}
    </div>
  );
}


