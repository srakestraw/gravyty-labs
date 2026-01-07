'use client';

import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';

// TODO: Replace mock data with API from Data Cloud
const mockActivities = [
  {
    id: '1',
    type: 'donation',
    description: 'New donation received: $5,000 from John Smith',
    source: 'Advance',
    sourceColor: 'bg-blue-100 text-blue-700',
    icon: 'fa-solid fa-hand-holding-dollar',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50',
    timestamp: '15 minutes ago',
  },
  {
    id: '2',
    type: 'signup',
    description: 'New alumni signup: Sarah Johnson joined the network',
    source: 'Graduway',
    sourceColor: 'bg-green-100 text-green-700',
    icon: 'fa-solid fa-user-plus',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    timestamp: '1 hour ago',
  },
  {
    id: '3',
    type: 'job',
    description: 'New job posted: Software Engineer at Tech Corp',
    source: 'Career Hub',
    sourceColor: 'bg-indigo-100 text-indigo-700',
    icon: 'fa-solid fa-briefcase',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
    timestamp: '2 hours ago',
  },
  {
    id: '4',
    type: 'event',
    description: 'Event created: Alumni Reunion 2024',
    source: 'Graduway',
    sourceColor: 'bg-green-100 text-green-700',
    icon: 'fa-solid fa-calendar',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-50',
    timestamp: '3 hours ago',
  },
  {
    id: '5',
    type: 'ai',
    description: 'AI Assistant completed task: Sent follow-up emails to 5 prospects',
    source: 'AI Assistant',
    sourceColor: 'bg-purple-100 text-purple-700',
    icon: 'fa-solid fa-robot',
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-50',
    timestamp: '4 hours ago',
  },
  {
    id: '6',
    type: 'event',
    description: 'Event updated: Homecoming 2024 - Date changed to Oct 15',
    source: 'Graduway',
    sourceColor: 'bg-green-100 text-green-700',
    icon: 'fa-solid fa-calendar-check',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-50',
    timestamp: '5 hours ago',
  },
  {
    id: '7',
    type: 'donation',
    description: 'New donation received: $2,500 from Jane Doe',
    source: 'Advance',
    sourceColor: 'bg-blue-100 text-blue-700',
    icon: 'fa-solid fa-hand-holding-dollar',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50',
    timestamp: '6 hours ago',
  },
  {
    id: '8',
    type: 'ai',
    description: 'AI Assistant completed task: Reviewed 12 course registrations',
    source: 'AI Assistant',
    sourceColor: 'bg-purple-100 text-purple-700',
    icon: 'fa-solid fa-robot',
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-50',
    timestamp: '8 hours ago',
  },
];

export function RecentActivityFeed() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
      
      <div className="space-y-3">
        {mockActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className={cn('p-2 rounded-lg', activity.iconBg)}>
              <FontAwesomeIcon icon={activity.icon} className={cn('h-4 w-4', activity.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 mb-1">{activity.description}</p>
              <div className="flex items-center gap-2">
                <span className={cn('px-2 py-0.5 rounded text-xs font-medium', activity.sourceColor)}>
                  {activity.source}
                </span>
                <span className="text-xs text-gray-500">{activity.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TODO: Replace mock data with API from Data Cloud */}
    </div>
  );
}











