'use client';

import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';

// TODO: Replace mock data with API from Data Cloud
const lifecycleStages = [
  {
    id: 'attract',
    name: 'Attract',
    description: 'Prospective student engagement',
    status: 'healthy',
    value: '2,458',
    icon: 'fa-solid fa-bullseye',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'enroll',
    name: 'Enroll',
    description: 'Application to enrollment conversion',
    status: 'healthy',
    value: '1,247',
    icon: 'fa-solid fa-clipboard-check',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'retain',
    name: 'Retain',
    description: 'Student retention and success',
    status: 'warning',
    value: '89%',
    icon: 'fa-solid fa-user-graduate',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  {
    id: 'graduate',
    name: 'Graduate',
    description: 'Graduation rate and completion',
    status: 'healthy',
    value: '78%',
    icon: 'fa-solid fa-graduation-cap',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'engage',
    name: 'Engage',
    description: 'Alumni engagement and networking',
    status: 'healthy',
    value: '72%',
    icon: 'fa-solid fa-users',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  {
    id: 'give',
    name: 'Give',
    description: 'Philanthropy and giving',
    status: 'warning',
    value: '68%',
    icon: 'fa-solid fa-hand-holding-dollar',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
];

const getStatusIndicator = (status: string) => {
  if (status === 'healthy') {
    return (
      <div className="flex items-center gap-1">
        <div className="h-2 w-2 rounded-full bg-green-500" />
        <span className="text-xs text-gray-600">On Track</span>
      </div>
    );
  }
  if (status === 'warning') {
    return (
      <div className="flex items-center gap-1">
        <div className="h-2 w-2 rounded-full bg-yellow-500" />
        <span className="text-xs text-gray-600">Needs Attention</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <div className="h-2 w-2 rounded-full bg-red-500" />
      <span className="text-xs text-gray-600">At Risk</span>
    </div>
  );
};

export function LifecycleScorecard() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Lifecycle Scorecard</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lifecycleStages.map((stage) => (
          <div
            key={stage.id}
            className={cn(
              'p-4 rounded-lg border-2 transition-all hover:shadow-md',
              stage.borderColor,
              stage.bgColor
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn('p-2 rounded-lg bg-white/50', stage.color)}>
                <FontAwesomeIcon icon={stage.icon} className="h-5 w-5" />
              </div>
              {getStatusIndicator(stage.status)}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stage.value}</p>
            <p className="text-sm font-semibold text-gray-900 mb-1">{stage.name}</p>
            <p className="text-xs text-gray-600">{stage.description}</p>
          </div>
        ))}
      </div>

      {/* TODO: Replace mock data with API from Data Cloud */}
    </div>
  );
}


