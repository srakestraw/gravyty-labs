'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type EscalationCategory =
  | 'self_harm'
  | 'threat_to_others'
  | 'harassment'
  | 'mental_health_distress'
  | 'financial_crisis'
  | 'academic_risk';

export type EscalationActionType = 'pause_agent' | 'assign_to_human' | 'notify_team';

export type EscalationRoutingStrategy = 'single' | 'group' | 'chain';

export type EscalationChannel = 'email' | 'sms' | 'voice' | 'ticket';

export type EscalationBehaviorMode =
  | 'pause_only'
  | 'pause_and_message'
  | 'log_only';

export interface EscalationTarget {
  id: string; // person or group id / key
  type: 'person' | 'group';
  label?: string; // e.g. "Student Care On-Call"
  channels: EscalationChannel[]; // which channels to use for this target
  timeoutMinutes?: number; // used when routingStrategy === "chain"
}

export interface EscalationRule {
  id: string;
  category: EscalationCategory;
  label: string;
  description: string;
  enabled: boolean;
  actions: EscalationActionType[]; // kept for backward compatibility
  templateMessage?: string;

  // NEW FIELDS
  behaviorMode?: EscalationBehaviorMode;
  suppressOutboundHours?: number; // optional: how long to pause outbound messages
  addPriorityTag?: boolean; // mark as high-priority

  routingStrategy?: EscalationRoutingStrategy;
  targets?: EscalationTarget[];
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

  function updateTarget(ruleId: string, index: number, patch: Partial<EscalationTarget>) {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;

    const targets = rule.targets || [];
    const updatedTargets = [...targets];
    
    if (!updatedTargets[index]) {
      // Create new target if it doesn't exist
      updatedTargets[index] = {
        id: `target-${Date.now()}-${index}`,
        type: rule.routingStrategy === 'group' ? 'group' : 'person',
        channels: [],
        ...patch,
      };
    } else {
      updatedTargets[index] = { ...updatedTargets[index], ...patch };
    }

    updateRule(ruleId, { targets: updatedTargets });
  }

  function addTarget(ruleId: string) {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;

    const targets = rule.targets || [];
    const newTarget: EscalationTarget = {
      id: `target-${Date.now()}-${targets.length}`,
      type: rule.routingStrategy === 'group' ? 'group' : 'person',
      channels: [],
      label: '',
    };

    updateRule(ruleId, { targets: [...targets, newTarget] });
  }

  function removeTarget(ruleId: string, index: number) {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule || !rule.targets) return;

    const updatedTargets = rule.targets.filter((_, i) => i !== index);
    updateRule(ruleId, { targets: updatedTargets });
  }

  function toggleChannel(ruleId: string, targetIndex: number, channel: EscalationChannel) {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule || !rule.targets || !rule.targets[targetIndex]) return;

    const target = rule.targets[targetIndex];
    const channels = target.channels || [];
    const isActive = channels.includes(channel);

    const updatedChannels = isActive
      ? channels.filter((ch) => ch !== channel)
      : [...channels, channel];

    updateTarget(ruleId, targetIndex, { channels: updatedChannels });
  }

  function renderChannelChips(rule: EscalationRule, targetIndex: number) {
    const channels: EscalationChannel[] = ['email', 'sms', 'voice', 'ticket'];
    const target = rule.targets?.[targetIndex];
    const activeChannels = target?.channels || [];

    return (
      <div className="flex flex-wrap gap-1.5 mt-1">
        {channels.map((ch) => {
          const isActive = activeChannels.includes(ch);
          return (
            <button
              key={ch}
              type="button"
              onClick={() => toggleChannel(rule.id, targetIndex, ch)}
              disabled={!canEdit}
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] transition-colors',
                isActive
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
                !canEdit && 'opacity-50 cursor-not-allowed'
              )}
            >
              {ch === 'ticket' ? 'Ticket only' : ch.toUpperCase()}
            </button>
          );
        })}
      </div>
    );
  }

  // Ensure defaults are set
  function ensureDefaults(rule: EscalationRule): EscalationRule {
    return {
      ...rule,
      behaviorMode: rule.behaviorMode || 'pause_and_message',
      routingStrategy: rule.routingStrategy || 'single',
      targets: rule.targets && rule.targets.length > 0 
        ? rule.targets 
        : [{
            id: `target-default-${rule.id}`,
            type: (rule.routingStrategy || 'single') === 'group' ? 'group' : 'person',
            channels: [],
            label: '',
          }],
    };
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
        {rules.map((rule) => {
          const ruleWithDefaults = ensureDefaults(rule);
          return (
            <div
              key={rule.id}
              className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3"
            >
              {/* Header */}
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

              {/* Agent behavior */}
              <div className="mt-2 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Agent behavior
                </p>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-gray-700">
                      When this rule triggers, the agent should:
                    </label>
                    <select
                      className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-800 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                      value={ruleWithDefaults.behaviorMode}
                      onChange={(e) =>
                        updateRule(rule.id, { behaviorMode: e.target.value as EscalationBehaviorMode })
                      }
                      disabled={!canEdit}
                    >
                      <option value="pause_and_message">
                        Pause automation & send a supportive message
                      </option>
                      <option value="pause_only">
                        Pause automation and hand off to a human, no automated reply
                      </option>
                      <option value="log_only">
                        Log the event only (no student-facing response)
                      </option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-gray-700">
                      Additional safeguards
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="checkbox"
                          className="h-3 w-3"
                          checked={!!ruleWithDefaults.suppressOutboundHours}
                          onChange={(e) =>
                            updateRule(rule.id, {
                              suppressOutboundHours: e.target.checked ? 24 : undefined,
                            })
                          }
                          disabled={!canEdit}
                        />
                        <span className="text-[11px] text-gray-700">
                          Suppress outbound messages for 24 hours
                        </span>
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="checkbox"
                          className="h-3 w-3"
                          checked={!!ruleWithDefaults.addPriorityTag}
                          onChange={(e) =>
                            updateRule(rule.id, { addPriorityTag: e.target.checked })
                          }
                          disabled={!canEdit}
                        />
                        <span className="text-[11px] text-gray-700">
                          Tag as high priority
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Routing & contacts */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Routing & contacts
                </p>
                <div className="grid gap-2 md:grid-cols-2">
                  {/* Left side: routing strategy */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-gray-700">
                      Routing strategy
                    </label>
                    <select
                      className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-800 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                      value={ruleWithDefaults.routingStrategy}
                      onChange={(e) => {
                        const newStrategy = e.target.value as EscalationRoutingStrategy;
                        // Reset targets when strategy changes
                        updateRule(rule.id, {
                          routingStrategy: newStrategy,
                          targets: [{
                            id: `target-${Date.now()}`,
                            type: newStrategy === 'group' ? 'group' : 'person',
                            channels: [],
                            label: '',
                          }],
                        });
                      }}
                      disabled={!canEdit}
                    >
                      <option value="single">Notify a single contact</option>
                      <option value="group">Notify a group (broadcast)</option>
                      <option value="chain">Escalation chain (try A, then B, then C)</option>
                    </select>
                    <p className="text-[10px] text-gray-500">
                      Choose whether to alert one person, a group, or escalate through a sequence of contacts.
                    </p>
                  </div>
                  {/* Right side: explanation / hint */}
                  <div className="text-[10px] text-gray-500">
                    <p className="font-medium text-gray-700">Channels</p>
                    <p>
                      For each contact, choose which channels to use: email, SMS, voice call, or ticket-only.
                      Voice can map to a campus safety line or other emergency number configured elsewhere.
                    </p>
                  </div>
                </div>

                {/* Render targets based on routing strategy */}
                {ruleWithDefaults.routingStrategy === 'chain' ? (
                  <div className="mt-2 space-y-2">
                    <p className="text-[11px] font-medium text-gray-700">
                      Escalation steps
                    </p>
                    <div className="space-y-2">
                      {ruleWithDefaults.targets.map((target, index) => (
                        <div
                          key={target.id || index}
                          className="rounded-md border border-gray-100 bg-white p-2 space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[11px] font-medium text-gray-800">
                              Step {index + 1}
                            </p>
                            {ruleWithDefaults.targets && ruleWithDefaults.targets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTarget(rule.id, index)}
                                disabled={!canEdit}
                                className="text-[10px] text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <input
                            className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-800 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                            placeholder="e.g., Student Care On-Call"
                            value={target.label ?? ''}
                            onChange={(e) =>
                              updateTarget(rule.id, index, { label: e.target.value })
                            }
                            disabled={!canEdit}
                          />
                          {renderChannelChips(ruleWithDefaults, index)}
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] text-gray-700">
                              Timeout before next step (minutes):
                            </label>
                            <input
                              type="number"
                              min={0}
                              className="w-20 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-800 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                              value={target.timeoutMinutes ?? ''}
                              onChange={(e) =>
                                updateTarget(rule.id, index, {
                                  timeoutMinutes: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                })
                              }
                              disabled={!canEdit}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => addTarget(rule.id)}
                      disabled={!canEdit}
                      className="text-[11px] text-indigo-600 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + Add escalation step
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 space-y-1">
                    <p className="text-[11px] font-medium text-gray-700">
                      {ruleWithDefaults.routingStrategy === 'group'
                        ? 'Recipient group'
                        : 'Primary contact'}
                    </p>
                    <input
                      className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-800 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                      placeholder={
                        ruleWithDefaults.routingStrategy === 'group'
                          ? 'e.g., Student Care Team'
                          : 'e.g., On-call counselor'
                      }
                      value={ruleWithDefaults.targets?.[0]?.label ?? ''}
                      onChange={(e) =>
                        updateTarget(rule.id, 0, {
                          label: e.target.value,
                          type: ruleWithDefaults.routingStrategy === 'group' ? 'group' : 'person',
                        })
                      }
                      disabled={!canEdit}
                    />
                    {renderChannelChips(ruleWithDefaults, 0)}
                  </div>
                )}
              </div>

              {/* Optional message to the student */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Optional message to the student
                </p>
                <textarea
                  className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-800 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                  rows={2}
                  value={rule.templateMessage ?? ''}
                  onChange={(e) =>
                    updateRule(rule.id, { templateMessage: e.target.value })
                  }
                  disabled={!canEdit}
                  placeholder='Example: "Because of what you shared, I am connecting you with someone who can help right away."'
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
