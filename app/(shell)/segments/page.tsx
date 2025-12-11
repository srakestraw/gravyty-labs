'use client';

import { MOCK_SEGMENTS } from '@/lib/segments/mock-segments';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function SegmentsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Segments
          </h1>
          <p className="text-gray-600">
            Segments are dynamic audiences built from contacts, populations, and behavior. Assistants, agents, and campaigns use segments to decide who to act on.
          </p>
        </div>
        <Button className="text-sm">
          <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4 mr-2" />
          New Segment
        </Button>
      </div>

      {/* Segments List */}
      {MOCK_SEGMENTS.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <FontAwesomeIcon icon="fa-solid fa-filter" className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-700 mb-1">No segments yet</h3>
          <p className="text-xs text-gray-500 mb-4">
            Create your first segment to build dynamic audiences for assistants, agents, and campaigns.
          </p>
          <Button size="sm">
            <FontAwesomeIcon icon="fa-solid fa-plus" className="h-3 w-3 mr-1" />
            New Segment
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Populations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Usage Contexts
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {MOCK_SEGMENTS.map((segment) => (
                  <tr key={segment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {segment.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-md">
                        {segment.description || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {segment.populationFilterLabel || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {segment.usageContexts.map((context) => (
                          <span
                            key={context}
                            className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700"
                          >
                            {context.charAt(0).toUpperCase() + context.slice(1)}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
