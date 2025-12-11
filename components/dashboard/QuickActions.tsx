'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// TODO: Wire these actions to actual routes/pages when available
const quickActions = [
  {
    id: 'outreach',
    label: 'Start Advancement Campaign',
    description: 'Create and launch a new campaign',
    icon: 'fa-solid fa-bullhorn',
    color: '#3B82F6',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    href: '#', // TODO: Route to Raise campaign creation
  },
  {
    id: 'giving-page',
    label: 'Create Giving Page',
    description: 'Set up a new fundraising page',
    icon: 'fa-solid fa-hand-holding-dollar',
    color: '#10B981',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    href: '#', // TODO: Route to Advance giving page creation
  },
  {
    id: 'event',
    label: 'Create Engagement Event',
    description: 'Plan and promote an event',
    icon: 'fa-solid fa-calendar-plus',
    color: '#8B5CF6',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    href: '#', // TODO: Route to Graduway event creation
  },
  {
    id: 'stewardship',
    label: 'Send Stewardship Video',
    description: 'Create personalized video message',
    icon: 'fa-solid fa-video',
    color: '#F59E0B',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
    href: '#', // TODO: Route to Gratavid video creation
  },
  {
    id: 'job',
    label: 'Post a Job (Career Hub)',
    description: 'Add a new job posting',
    icon: 'fa-solid fa-briefcase',
    color: '#6366F1',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    href: '#', // TODO: Route to Career Hub job posting
  },
  {
    id: 'ai-assistant',
    label: 'Ask an AI Assistant',
    description: 'Get help with tasks and questions',
    icon: 'fa-solid fa-robot',
    color: '#EC4899',
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-600',
    href: '/ai-assistants/assistant', // Existing route
  },
];

export function QuickActions() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-1 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className="group"
          >
            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
              <div className={cn('p-2 rounded-lg', action.bgColor)}>
                <FontAwesomeIcon icon={action.icon} className={cn('h-5 w-5', action.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  {action.label}
                </p>
                <p className="text-xs text-gray-600">{action.description}</p>
              </div>
              <FontAwesomeIcon
                icon="fa-solid fa-chevron-right"
                className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


