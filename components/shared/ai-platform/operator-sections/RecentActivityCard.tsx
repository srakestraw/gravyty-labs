'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import type { AdmissionsOperatorRecentActivityData } from '@/lib/data/provider';

interface RecentActivityCardProps {
  data: AdmissionsOperatorRecentActivityData[];
  basePath?: string;
}

export function RecentActivityCard({ data, basePath = '/student-lifecycle/admissions' }: RecentActivityCardProps) {
  if (data.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">No activity yet today.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Link
          href={`${basePath}/logs`}
          className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
        >
          View Full Activity Log
          <FontAwesomeIcon icon="fa-solid fa-chevron-right" className="h-3 w-3" />
        </Link>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {data.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-500">{activity.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-900">{activity.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}









