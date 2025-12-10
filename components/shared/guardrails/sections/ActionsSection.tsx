'use client';

import * as React from 'react';
import { ActionsConfig, ActionMode } from '@/lib/guardrails/types';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface ActionsSectionProps {
  config: ActionsConfig;
  onChange: (config: ActionsConfig) => void;
  canEdit: boolean;
}

const ACTION_DESCRIPTIONS: Record<string, string> = {
  send_email: 'Send email messages using institutional templates',
  send_sms: 'Send short text messages to students, alumni, or donors',
  send_phone_call: 'Trigger automated voice calls using pre-approved scripts',
  create_task: 'Create follow-up tasks for advisors, success staff, or gift officers',
  create_internal_flag: 'Apply internal flags so staff can see risk, priority, or status',
  change_status: 'Change student or prospect status in CRM',
  change_owner: 'Change advisor or owner assignment',
};

const ACTION_MODE_OPTIONS: { value: ActionMode; label: string; description: string }[] = [
  { value: 'auto', label: 'Auto (Safe Mode)', description: 'Agent may act automatically when all guardrails are satisfied' },
  { value: 'human_review', label: 'Human review', description: 'Agent drafts, a person approves' },
  { value: 'blocked', label: 'Blocked', description: 'Agent may never perform this action' },
];

// Simple tooltip component for inline help text
function Tooltip({ children, content }: { children: React.ReactNode; content: React.ReactNode }) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </span>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 rounded-lg border border-gray-200 bg-white p-2 shadow-lg text-xs text-gray-700">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-200" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[5px] border-4 border-transparent border-t-white" />
        </div>
      )}
    </span>
  );
}

export function ActionsSection({ config, onChange, canEdit }: ActionsSectionProps) {
  // Edit mode is always enabled, so no expand/collapse needed

  function updateActionMode(actionKey: string, mode: ActionMode) {
    onChange({
      ...config,
      rules: config.rules.map(rule =>
        rule.actionKey === actionKey ? { ...rule, mode } : rule
      ),
    });
  }

  const sensitiveActions = ['change_status', 'change_owner'];

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-gray-900">
            Actions & autonomy
          </h2>
          <p className="text-xs text-gray-600">
            Control which actions agents can take automatically versus when a human must approve.
          </p>
        </div>
      </div>

      {/* Action modes table */}
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
          Default action modes
        </p>
        <p className="mt-1 text-xs text-gray-600">
          <span className="font-semibold">About Auto (Safe Mode):</span>{' '}
          When an action is set to <span className="font-semibold">Auto</span>, the agent may perform it
          automatically <em>only</em> when all guardrails are satisfied — including safety rules,
          escalation triggers, do-not-engage lists, quiet hours, seasonal pauses, and frequency caps.
          If any guardrail blocks the action, it will pause and route to human review instead.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 font-medium text-gray-700">Action</th>
                <th className="text-left py-2 px-2 font-medium text-gray-700">
                  <div className="flex items-center gap-1">
                    <span>Mode</span>
                    <Tooltip
                      content={
                        <div className="max-w-xs">
                          <p className="font-semibold mb-1">Auto (Safe Mode)</p>
                          <p>
                            Auto means the agent may perform this action automatically when all global and
                            agent-level guardrails allow it. If a safety rule, quiet hour, do-not-engage flag,
                            escalation trigger, or frequency limit applies, the action is paused and sent for
                            human review instead.
                          </p>
                        </div>
                      }
                    >
                      <FontAwesomeIcon icon="fa-solid fa-circle-question" className="h-3 w-3 text-gray-400" />
                    </Tooltip>
                  </div>
                </th>
                <th className="text-left py-2 px-2 font-medium text-gray-700">Description</th>
              </tr>
            </thead>
            <tbody>
              {config.rules.map((rule) => {
                const isSensitive = sensitiveActions.includes(rule.actionKey);
                return (
                  <tr key={rule.actionKey} className="border-b border-gray-100">
                    <td className="py-2 px-2">
                      <code className="text-[10px] text-gray-600">{rule.actionKey}</code>
                      {isSensitive && (
                        <span className="ml-2 text-[10px] text-amber-600">⚠ Sensitive</span>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      {canEdit ? (
                        <select
                          value={rule.mode}
                          onChange={(e) => updateActionMode(rule.actionKey, e.target.value as ActionMode)}
                          className="rounded border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-900"
                        >
                          {ACTION_MODE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-medium text-gray-700">
                          {ACTION_MODE_OPTIONS.find(opt => opt.value === rule.mode)?.label || rule.mode}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-gray-600">
                      {ACTION_DESCRIPTIONS[rule.actionKey] || 'No description'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {canEdit && (
          <p className="mt-2 flex items-start gap-1 text-[11px] text-amber-700">
            <span className="mt-0.5 text-xs">⚠️</span>
            <span>
              Setting sensitive actions (like status or owner changes) to{' '}
              <span className="font-semibold">Auto (Safe Mode)</span> may still affect a student's standing
              or finances. Human review is strongly recommended unless you have strict upstream controls.
            </span>
          </p>
        )}
      </div>
    </section>
  );
}

