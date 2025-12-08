'use client';

import { PersonRecord, roleLabel } from '@/lib/agent-ops/people-mock';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface PersonGuardrailsTabProps {
  person: PersonRecord;
}

export function PersonGuardrailsTab({ person }: PersonGuardrailsTabProps) {
  const dne = person.doNotEngage;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Guardrails & Flags</h3>

      <div className="space-y-4">
        {/* Do Not Engage Status */}
        <div className="p-4 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">Do Not Engage</h4>
            {dne ? (
              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                None
              </span>
            )}
          </div>
          {dne ? (
            <div className="space-y-2 text-sm text-gray-600">
              {dne.global && (
                <p>
                  <span className="font-medium">Global:</span> Do not engage across all channels and agents.
                </p>
              )}
              {dne.roles && dne.roles.length > 0 && (
                <p>
                  <span className="font-medium">Role-specific:</span> Do not engage for{' '}
                  {dne.roles.map(roleLabel).join(', ')}.
                </p>
              )}
              {dne.reason && (
                <p>
                  <span className="font-medium">Reason:</span> {dne.reason}
                </p>
              )}
              {dne.source && (
                <p>
                  <span className="font-medium">Source:</span> {dne.source.replace('_', ' ')}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No Do Not Engage rules apply to this person.</p>
          )}
        </div>

        {/* Quiet Hours & Seasonal Rules */}
        <div className="p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Quiet Hours & Seasonal Rules</h4>
          <p className="text-sm text-gray-600">
            Quiet hours and seasonal policies apply based on global guardrails configured in the Guardrails
            settings.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            To modify these rules, visit the{' '}
            <a href="/ai-assistants/guardrails" className="text-purple-600 hover:text-purple-700 underline">
              Guardrails
            </a>{' '}
            page.
          </p>
        </div>

        {/* Additional Notes */}
        <div className="p-4 rounded-lg bg-gray-50">
          <div className="flex items-start gap-2">
            <FontAwesomeIcon icon="fa-solid fa-info-circle" className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="text-xs text-gray-600">
              <p className="font-medium text-gray-900 mb-1">Note</p>
              <p>
                Guardrail rules are read-only in this view. To modify Do Not Engage settings, use the Do Not
                Engage page or the person's profile in the source system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




