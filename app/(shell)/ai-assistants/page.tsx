'use client';

export const dynamic = 'force-static';

import { useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { canManageAssistants } from '@/lib/roles';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { mockAssistants, mockTemplates } from './lib/data';
import type { Assistant } from './lib/data';

export default function AssistantsHomePage() {
  const { user } = useAuth();
  const canManage = canManageAssistants(user?.email || user?.uid);
  const [assistants] = useState<Assistant[]>(mockAssistants);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Assistants</h2>
          <p className="text-gray-600 mt-1">
            Configure and monitor AI-powered assistants across admissions, student success, and advancement.
          </p>
        </div>
        {canManage && (
          <Link href="/ai-assistants/new">
            <Button>
              <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4 mr-2" />
              + Enable New Assistant
            </Button>
          </Link>
        )}
      </div>

      {/* Recommended Assistants */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Assistants</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTemplates.slice(0, 4).map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FontAwesomeIcon
                    icon={template.icon}
                    className="h-5 w-5 text-purple-600"
                  />
                </div>
                <h4 className="font-semibold text-gray-900">{template.name}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              {canManage && (
                <Link href={`/ai-assistants/new?template=${template.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Use Template
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Assistants */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Assistants</h3>
        
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Goal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assistants.map((assistant) => (
                <tr key={assistant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{assistant.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{assistant.goal}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        assistant.status
                      )}`}
                    >
                      {assistant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {assistant.owner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(assistant.lastUpdated)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/ai-assistants/${assistant.id}`}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        View
                      </Link>
                      {canManage && (
                        <>
                          <Link
                            href={`/ai-assistants/${assistant.id}`}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              // Non-functional for now
                              alert('Pause functionality will be implemented in a future update');
                            }}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            Pause
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {assistants.map((assistant) => (
            <div
              key={assistant.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{assistant.name}</h4>
                  <p className="text-sm text-gray-600">{assistant.goal}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor(
                    assistant.status
                  )}`}
                >
                  {assistant.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center justify-between">
                  <span>Owner:</span>
                  <span className="font-medium text-gray-900">{assistant.owner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Updated:</span>
                  <span className="font-medium text-gray-900">{formatDate(assistant.lastUpdated)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                <Link
                  href={`/ai-assistants/${assistant.id}`}
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  View
                </Link>
                {canManage && (
                  <>
                    <Link
                      href={`/ai-assistants/${assistant.id}`}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        alert('Pause functionality will be implemented in a future update');
                      }}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      Pause
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

