'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { mockAssistants, mockLogs } from '../lib/data';
import type { Assistant } from '../lib/data';

interface AssistantDetailClientProps {
  assistantId: string;
}

export function AssistantDetailClient({ assistantId }: AssistantDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'configuration' | 'logs' | 'eval'>('overview');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'configuration', 'logs', 'eval'].includes(tab)) {
      setActiveTab(tab as typeof activeTab);
    }
  }, [searchParams]);

  const assistant = mockAssistants.find(a => a.id === assistantId);

  if (!assistant) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Assistant Not Found</h2>
        <p className="text-gray-600 mb-4">The assistant you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/ai-assistants')}>
          Back to Assistants
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const assistantLogs = mockLogs.filter(log => log.assistantId === assistantId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{assistant.name}</h2>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(assistant.status)}`}>
              {assistant.status}
            </span>
          </div>
          <p className="text-gray-600">{assistant.goal}</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/ai-assistants')}>
          Back
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Goal</div>
          <div className="font-semibold text-gray-900">{assistant.goal}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Owner</div>
          <div className="font-semibold text-gray-900">{assistant.owner}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Messages Sent</div>
          <div className="font-semibold text-gray-900">{assistant.performance.messagesSent.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Satisfaction</div>
          <div className="font-semibold text-gray-900">{assistant.performance.satisfactionScore.toFixed(1)}/5.0</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {(['overview', 'configuration', 'logs', 'eval'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Guardrails Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Message Limit</span>
                  <span className="font-medium text-gray-900">
                    {assistant.guardrails.messageLimit} per person/day
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Quiet Hours</span>
                  <span className="font-medium text-gray-900">
                    {assistant.guardrails.quietHours.start} - {assistant.guardrails.quietHours.end}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Can Escalate</span>
                  <span className="font-medium text-gray-900">
                    {assistant.guardrails.canEscalate ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Note: Inherits global guardrails
              </p>
            </div>
          </div>
        )}

        {activeTab === 'configuration' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                  <div className="text-gray-900">{assistant.template}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scope</label>
                  <div className="text-gray-900">
                    {assistant.scope.program || 'All Programs'} / {assistant.scope.term || 'All Terms'}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Configuration editing will be available in a future update.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Activity Logs</h3>
              <Link
                href={`/ai-assistants/logs?scope=agent&agentId=${assistantId}`}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                View this agent in Logs
                <FontAwesomeIcon icon="fa-solid fa-arrow-right" className="h-3 w-3" />
              </Link>
            </div>
            {assistantLogs.length === 0 ? (
              <p className="text-gray-500">No logs available for this assistant.</p>
            ) : (
              <div className="space-y-3">
                {assistantLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{log.action}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">{log.outcome}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'eval' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Evaluation Scores</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">0.92</div>
                <div className="text-sm text-gray-600">Correctness</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">0.88</div>
                <div className="text-sm text-gray-600">Safety</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">0.95</div>
                <div className="text-sm text-gray-600">Fairness</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Reasoning Trace (Mock)</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                <p className="mb-2">
                  <strong>Input:</strong> Student inquiry about registration deadline
                </p>
                <p className="mb-2">
                  <strong>Processing:</strong> Assistant checked academic calendar and student status
                </p>
                <p className="mb-2">
                  <strong>Response:</strong> Provided accurate deadline with link to registration portal
                </p>
                <p>
                  <strong>Evaluation:</strong> Response was factually correct, safe, and fair to all students
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


