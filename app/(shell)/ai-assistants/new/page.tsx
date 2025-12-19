'use client';

export const dynamic = 'force-static';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { canManageAssistants } from '@/lib/roles';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockTemplates, mockGlobalGuardrails } from '../lib/data';

function EnableNewAssistantContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const canManage = canManageAssistants(user?.email || user?.uid);

  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    searchParams.get('template') || ''
  );
  const [goal, setGoal] = useState('');
  const [scope, setScope] = useState({ program: '', term: '' });
  const [showAIPanel, setShowAIPanel] = useState(false);

  useEffect(() => {
    if (!canManage) {
      router.push('/ai-assistants');
    }
  }, [canManage, router]);

  if (!canManage) {
    return null;
  }

  const selectedTemplateData = mockTemplates.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enable New Assistant</h2>
          <p className="text-gray-600 mt-1">
            Configure a new AI assistant for your institution
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Main Form */}
        <div className="flex-1 space-y-6">
          {/* Template Selector */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FontAwesomeIcon
                      icon={template.icon}
                      className="h-5 w-5 text-purple-600"
                    />
                    <span className="font-semibold text-gray-900">{template.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Goal Selector */}
          {selectedTemplate && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal</h3>
              <Input
                placeholder="Describe the assistant's primary goal..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
              {selectedTemplateData && (
                <p className="text-sm text-gray-500 mt-2">
                  Suggested: {selectedTemplateData.description}
                </p>
              )}
            </div>
          )}

          {/* Scope */}
          {selectedTemplate && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Scope</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program (optional)
                  </label>
                  <Input
                    placeholder="All Programs"
                    value={scope.program}
                    onChange={(e) => setScope({ ...scope, program: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Term (optional)
                  </label>
                  <Input
                    placeholder="e.g., Fall 2024"
                    value={scope.term}
                    onChange={(e) => setScope({ ...scope, term: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Guardrails Summary */}
          {selectedTemplate && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Guardrails (Read-only)</h3>
              <div className="space-y-3">
                {mockGlobalGuardrails.map((guardrail) => (
                  <div key={guardrail.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{guardrail.name}</div>
                      <div className="text-sm text-gray-600">{guardrail.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {guardrail.value && (
                        <span className="text-sm text-gray-600">{String(guardrail.value)}</span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        guardrail.enabled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {guardrail.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Note: This assistant will inherit global guardrails. You can customize them after creation.
              </p>
            </div>
          )}

          {/* Eval Preview */}
          {selectedTemplate && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Preview</h3>
              <div className="grid grid-cols-3 gap-4">
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
              <p className="text-sm text-gray-500 mt-4">
                These are placeholder scores. Actual evaluation will occur after deployment.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // In v1, just navigate back - no actual creation
                alert('Assistant creation will be implemented in a future phase');
                router.push('/ai-assistants');
              }}
              disabled={!selectedTemplate || !goal}
            >
              Enable Assistant
            </Button>
          </div>
        </div>

        {/* AI Assistant Side Panel */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              <button
                onClick={() => setShowAIPanel(!showAIPanel)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon
                  icon={showAIPanel ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up'}
                  className="h-4 w-4"
                />
              </button>
            </div>
            {showAIPanel && (
              <div className="text-sm text-gray-600">
                <p className="mb-4">
                  Ask me for help configuring this assistant.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500">
                    AI assistant panel will be available in a future update.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EnableNewAssistantPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EnableNewAssistantContent />
    </Suspense>
  );
}

