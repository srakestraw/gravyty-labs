'use client';

import * as React from 'react';

export type EscalationCategory =
  | 'self_harm'
  | 'threat_to_others'
  | 'harassment'
  | 'mental_health_distress'
  | 'financial_crisis'
  | 'academic_risk';

export type EscalationActionType = 'pause_agent' | 'assign_to_human' | 'notify_team';

export interface EscalationRule {
  id: string;
  category: EscalationCategory;
  label: string;
  description: string;
  enabled: boolean;
  actions: EscalationActionType[];
  templateMessage?: string;
}

interface HumanEscalationSectionProps {
  rules: EscalationRule[];
  onChange: (rules: EscalationRule[]) => void;
  canEdit: boolean;
}

export function HumanEscalationSection({ rules, onChange, canEdit }: HumanEscalationSectionProps) {
  function updateRule(id: string, patch: Partial<EscalationRule>) {
    onChange(
      rules.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-gray-900">Human escalation rules</h2>
          <p className="text-xs text-gray-600">
            Define when agents must pause automation and involve a human - for safety, threats, mental health concerns, or other high-risk situations.
          </p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-gray-900">{rule.label}</p>
                <p className="text-[11px] text-gray-600">{rule.description}</p>
              </div>
              <label className="inline-flex items-center gap-1 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={(e) =>
                    updateRule(rule.id, { enabled: e.target.checked })
                  }
                  disabled={!canEdit}
                  className="h-3 w-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>{rule.enabled ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Agent behavior
                </p>
                <p className="text-[11px] text-gray-700">
                  {rule.actions.includes('pause_agent') && 'Pause automation; '}
                  {rule.actions.includes('assign_to_human') &&
                    'Assign to a human responder; '}
                  {rule.actions.includes('notify_team') &&
                    'Log and notify the appropriate team.'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Optional message to the student
                </p>
                <textarea
                  rows={2}
                  className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-800 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                  value={rule.templateMessage ?? ''}
                  onChange={(e) =>
                    updateRule(rule.id, { templateMessage: e.target.value })
                  }
                  disabled={!canEdit}
                  placeholder='Example: "Because of what you shared, I am connecting you with someone who can help right away."'
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
