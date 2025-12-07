'use client';

import { PersonActivity, channelLabel } from '@/lib/agent-ops/people-mock';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface PersonActivityTabProps {
  activity: PersonActivity[];
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function PersonActivityTab({ activity }: PersonActivityTabProps) {
  if (activity.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <FontAwesomeIcon icon="fa-solid fa-clock" className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No activity recorded</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Date/Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Channel
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Agent
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activity.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(item.timestamp)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    <FontAwesomeIcon
                      icon={
                        item.channel === 'email'
                          ? 'fa-solid fa-envelope'
                          : item.channel === 'sms'
                          ? 'fa-solid fa-message'
                          : item.channel === 'phone'
                          ? 'fa-solid fa-phone'
                          : item.channel === 'internal_flag'
                          ? 'fa-solid fa-flag'
                          : 'fa-solid fa-tasks'
                      }
                      className="h-3 w-3"
                    />
                    {channelLabel(item.channel)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {item.agentName || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


