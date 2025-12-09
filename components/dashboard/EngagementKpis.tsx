'use client';

import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';

// TODO: Replace mock data with API from Data Cloud
const mockKpis = [
  {
    id: '1',
    label: 'Alumni Engagement Rate',
    value: '72%',
    change: '+5.2%',
    changeType: 'positive',
    icon: 'fa-solid fa-users',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: '2',
    label: 'Active Mentoring Matches',
    value: '234',
    change: '+12',
    changeType: 'positive',
    icon: 'fa-solid fa-handshake',
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: '3',
    label: 'Upcoming Events',
    value: '18',
    change: '3 this week',
    changeType: 'neutral',
    icon: 'fa-solid fa-calendar',
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: '4',
    label: 'Annual Giving Progress',
    value: '68%',
    change: '+8%',
    changeType: 'positive',
    icon: 'fa-solid fa-chart-line',
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    id: '5',
    label: 'Pipeline Prospects Contacted',
    value: '1,247',
    change: '+156',
    changeType: 'positive',
    icon: 'fa-solid fa-bullhorn',
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

export function EngagementKpis() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Engagement & Fundraising KPIs</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockKpis.map((kpi) => (
          <div
            key={kpi.id}
            className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn('p-2 rounded-lg', kpi.bgColor)}>
                <FontAwesomeIcon icon={kpi.icon} className={cn('h-5 w-5', kpi.iconColor)} />
              </div>
              {kpi.changeType === 'positive' && (
                <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                  <FontAwesomeIcon icon="fa-solid fa-arrow-up" className="h-3 w-3" />
                  {kpi.change}
                </span>
              )}
              {kpi.changeType === 'neutral' && (
                <span className="text-xs font-medium text-gray-600">{kpi.change}</span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</p>
            <p className="text-sm text-gray-600">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* TODO: Replace mock data with API from Data Cloud */}
    </div>
  );
}
