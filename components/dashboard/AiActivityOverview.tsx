'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';

// TODO: Replace mock data with API from /ai-assistants endpoint
const mockAiActivities = [
  {
    id: '1',
    assistant: 'Admissions AI',
    action: 'Sent follow-up emails to 5 prospective students',
    timestamp: '2 hours ago',
    status: 'completed',
    icon: 'fa-solid fa-envelope',
    iconColor: 'text-blue-600',
  },
  {
    id: '2',
    assistant: 'Registrar AI',
    action: 'Completed course registration for 12 students',
    timestamp: '4 hours ago',
    status: 'completed',
    icon: 'fa-solid fa-clipboard-check',
    iconColor: 'text-green-600',
  },
  {
    id: '3',
    assistant: 'Financial Aid AI',
    action: 'Reviewed and flagged 3 FAFSA applications for manual review',
    timestamp: '6 hours ago',
    status: 'needs_review',
    icon: 'fa-solid fa-flag',
    iconColor: 'text-yellow-600',
  },
  {
    id: '4',
    assistant: 'Student Success AI',
    action: 'Identified 8 at-risk students and scheduled intervention meetings',
    timestamp: '8 hours ago',
    status: 'completed',
    icon: 'fa-solid fa-user-graduate',
    iconColor: 'text-purple-600',
  },
  {
    id: '5',
    assistant: 'AI Chatbot & Messaging',
    action: 'Handled 47 incoming messages from prospective students',
    timestamp: '12 hours ago',
    status: 'completed',
    icon: 'fa-solid fa-comments',
    iconColor: 'text-indigo-600',
  },
];

export function AiActivityOverview() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">AI Assistant Activity</h2>
        <Link
          href="/ai-assistants"
          className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
        >
          View all in AI Control Center
          <FontAwesomeIcon icon="fa-solid fa-arrow-right" className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {mockAiActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className={cn('p-2 rounded-lg bg-gray-50', activity.iconColor)}>
              <FontAwesomeIcon icon={activity.icon} className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900">{activity.assistant}</span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    activity.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  )}
                >
                  {activity.status === 'completed' ? 'Completed' : 'Needs Review'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{activity.action}</p>
              <span className="text-xs text-gray-500">{activity.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* TODO: Wire AI activity to /ai-assistants endpoint */}
    </div>
  );
}


