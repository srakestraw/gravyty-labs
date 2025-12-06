'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { canEditGuardrails } from '@/lib/roles';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockGlobalGuardrails } from '../lib/data';

export default function GuardrailsPage() {
  const { user } = useAuth();
  const canEdit = canEditGuardrails(user?.email || user?.uid);
  const [guardrails, setGuardrails] = useState(mockGlobalGuardrails);
  const [messageLimit, setMessageLimit] = useState(2);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');

  const handleToggle = (id: string) => {
    if (!canEdit) return;
    setGuardrails(guardrails.map(g => 
      g.id === id ? { ...g, enabled: !g.enabled } : g
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Global Guardrails</h2>
        <p className="text-gray-600 mt-1">
          Configure global safety and compliance settings for all AI assistants
        </p>
      </div>

      {/* Bias & Fairness */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Bias & Fairness</h3>
            <p className="text-sm text-gray-600 mt-1">
              Ensure all responses are free from bias and treat all students fairly
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={guardrails.find(g => g.id === 'bias-fairness')?.enabled || false}
              onChange={() => handleToggle('bias-fairness')}
              disabled={!canEdit}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      {/* Global Message Limits */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Global Message Limits</h3>
            <p className="text-sm text-gray-600 mt-1">
              Maximum messages per person per day across all assistants
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={guardrails.find(g => g.id === 'message-limit')?.enabled || false}
              onChange={() => handleToggle('message-limit')}
              disabled={!canEdit}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
        {guardrails.find(g => g.id === 'message-limit')?.enabled && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max messages per person/day
            </label>
            <Input
              type="number"
              value={messageLimit}
              onChange={(e) => setMessageLimit(Number(e.target.value))}
              disabled={!canEdit}
              className="w-32"
            />
          </div>
        )}
      </div>

      {/* Global Quiet Hours */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Global Quiet Hours</h3>
            <p className="text-sm text-gray-600 mt-1">
              Time period when assistants should not send messages
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={guardrails.find(g => g.id === 'quiet-hours')?.enabled || false}
              onChange={() => handleToggle('quiet-hours')}
              disabled={!canEdit}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
        {guardrails.find(g => g.id === 'quiet-hours')?.enabled && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <Input
                type="time"
                value={quietHoursStart}
                onChange={(e) => setQuietHoursStart(e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <Input
                type="time"
                value={quietHoursEnd}
                onChange={(e) => setQuietHoursEnd(e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>
        )}
      </div>

      {/* Audit Log Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Log Preview</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Guardrails updated</span>
              <span className="text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Quiet hours modified</span>
              <span className="text-gray-500">1 day ago</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Message limit changed</span>
              <span className="text-gray-500">3 days ago</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Full audit log functionality will be available in a future update.
        </p>
      </div>

      {canEdit && (
        <div className="flex justify-end">
          <Button
            onClick={() => {
              alert('Guardrails saved (mock - no persistence in v1)');
            }}
          >
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}

