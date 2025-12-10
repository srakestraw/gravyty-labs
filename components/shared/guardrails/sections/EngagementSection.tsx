'use client';

import * as React from 'react';
import {
  EngagementConfig,
  SeasonalQuietPeriod,
  HolidayRule,
  RoleKey,
} from '@/lib/guardrails/types';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';
import { AgentPriorityWeight } from '@/lib/agents/types';

interface EngagementSectionProps {
  config: EngagementConfig;
  onChange: (config: EngagementConfig) => void;
  canEdit: boolean;
}

const ROLE_OPTIONS: { value: RoleKey | 'global'; label: string }[] = [
  { value: 'global', label: 'Global' },
  { value: 'admissions', label: 'Admissions' },
  { value: 'registrar', label: 'Registrar' },
  { value: 'student_success', label: 'Student Success' },
  { value: 'career_services', label: 'Career Services' },
  { value: 'alumni_engagement', label: 'Alumni Engagement' },
  { value: 'advancement', label: 'Advancement' },
];

// Mock agent interface - replace with API call later
interface Agent {
  id: string;
  name: string;
  priorityWeight: AgentPriorityWeight;
}

// Mock agents - replace with API call to /api/agents later
const MOCK_AGENTS: Agent[] = [
  { id: 'agent-transcript-helper', name: 'Transcript Helper Agent', priorityWeight: 4 },
  { id: 'agent-registration-requirements', name: 'Registration Requirements Agent', priorityWeight: 4 },
  { id: 'agent-high-intent-prospect', name: 'High-Intent Prospect Agent', priorityWeight: 3 },
  { id: 'agent-donor-warmup', name: 'Donor Warm-Up Agent', priorityWeight: 2 },
  { id: 'agent-international-visa', name: 'International Visa Docs Agent', priorityWeight: 5 },
];

function renderPriorityLabel(weight: AgentPriorityWeight): string {
  const labels: Record<AgentPriorityWeight, string> = {
    5: 'Critical',
    4: 'High',
    3: 'Standard',
    2: 'Low',
    1: 'Informational',
  };
  return labels[weight];
}

export function EngagementSection({ config, onChange, canEdit }: EngagementSectionProps) {
  const [newPeriod, setNewPeriod] = React.useState<Partial<SeasonalQuietPeriod>>({
    label: '',
    startDate: '',
    endDate: '',
  });
  const [newHoliday, setNewHoliday] = React.useState<Partial<HolidayRule>>({
    label: '',
    date: '',
    scope: 'global',
  });
  const [showAddPeriod, setShowAddPeriod] = React.useState(false);
  const [showAddHoliday, setShowAddHoliday] = React.useState(false);
  const [agents, setAgents] = React.useState<Agent[]>(MOCK_AGENTS);
  const [priorityOverrides, setPriorityOverrides] = React.useState<Record<string, AgentPriorityWeight>>(
    config.priorityOverrides || {}
  );

  // Load agents on mount - replace with API call later
  React.useEffect(() => {
    // TODO: Replace with actual API call
    // fetch('/api/agents')
    //   .then(res => res.json())
    //   .then(data => setAgents(data))
    //   .catch(err => console.error('Error loading agents:', err));
  }, []);

  // Initialize overrides from config when config changes
  React.useEffect(() => {
    if (config.priorityOverrides) {
      setPriorityOverrides(config.priorityOverrides);
    }
  }, [config.priorityOverrides]);

  function handleOverrideChange(agentId: string, weight: AgentPriorityWeight) {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    const newOverrides = { ...priorityOverrides };
    // If override equals agent's default, remove it
    if (weight === agent.priorityWeight) {
      delete newOverrides[agentId];
    } else {
      newOverrides[agentId] = weight;
    }
    setPriorityOverrides(newOverrides);
    
    // Update config immediately
    onChange({
      ...config,
      priorityOverrides: Object.keys(newOverrides).length > 0 ? newOverrides : undefined,
    });
  }

  function addQuietPeriod() {
    if (!newPeriod.label || !newPeriod.startDate || !newPeriod.endDate) return;
    onChange({
      ...config,
      seasonalQuietPeriods: [
        ...config.seasonalQuietPeriods,
        {
          id: `period-${Date.now()}`,
          label: newPeriod.label,
          startDate: newPeriod.startDate,
          endDate: newPeriod.endDate,
        },
      ],
    });
    setNewPeriod({ label: '', startDate: '', endDate: '' });
    setShowAddPeriod(false);
  }

  function removeQuietPeriod(id: string) {
    onChange({
      ...config,
      seasonalQuietPeriods: config.seasonalQuietPeriods.filter(p => p.id !== id),
    });
  }

  function addHoliday() {
    if (!newHoliday.label || !newHoliday.date) return;
    onChange({
      ...config,
      holidayRules: [
        ...config.holidayRules,
        {
          id: `holiday-${Date.now()}`,
          label: newHoliday.label,
          date: newHoliday.date,
          scope: newHoliday.scope || 'global',
        },
      ],
    });
    setNewHoliday({ label: '', date: '', scope: 'global' });
    setShowAddHoliday(false);
  }

  function removeHoliday(id: string) {
    onChange({
      ...config,
      holidayRules: config.holidayRules.filter(h => h.id !== id),
    });
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-gray-900">
            Engagement & contact policy
          </h2>
          <p className="text-xs text-gray-600">
            Define when agents are allowed to reach out. Do-Not-Engage lists are enforced separately;
            these settings control timing, seasonal pauses, and message frequency.
          </p>
        </div>
      </div>

      {/* Quiet hours */}
      <div className="space-y-2 border-b border-gray-100 pb-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Quiet hours
          </p>
          {canEdit && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.quietHours.enabled}
                onChange={(e) => {
                  onChange({
                    ...config,
                    quietHours: { ...config.quietHours, enabled: e.target.checked },
                  });
                }}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-gray-700">Enforce quiet hours</span>
            </label>
          )}
        </div>
        {config.quietHours.enabled ? (
          <div className="grid gap-2 md:grid-cols-3">
            {canEdit ? (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">Start time</label>
                  <Input
                    type="time"
                    value={config.quietHours.startLocal}
                    onChange={(e) => {
                      onChange({
                        ...config,
                        quietHours: { ...config.quietHours, startLocal: e.target.value },
                      });
                    }}
                    className="h-7 text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">End time</label>
                  <Input
                    type="time"
                    value={config.quietHours.endLocal}
                    onChange={(e) => {
                      onChange({
                        ...config,
                        quietHours: { ...config.quietHours, endLocal: e.target.value },
                      });
                    }}
                    className="h-7 text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">Timezone</label>
                  <select
                    value={config.quietHours.timezone || 'recipient'}
                    onChange={(e) => {
                      onChange({
                        ...config,
                        quietHours: { ...config.quietHours, timezone: e.target.value },
                      });
                    }}
                    className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-900"
                  >
                    <option value="recipient">Recipient timezone</option>
                    <option value="institution">Institution timezone</option>
                  </select>
                </div>
              </>
            ) : (
              <p className="text-[11px] text-gray-600">
                {config.quietHours.startLocal} to {config.quietHours.endLocal} ({config.quietHours.timezone || 'recipient'} timezone)
              </p>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-gray-500">Quiet hours are currently disabled.</p>
        )}
        <p className="text-[11px] text-gray-500">
          Agents may still analyze data and create internal tasks during quiet hours, but they should not
          send email, SMS, or calls.
        </p>
      </div>

      {/* Seasonal quiet periods */}
      <div className="space-y-2 border-b border-gray-100 pb-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Seasonal quiet periods
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={() => setShowAddPeriod(!showAddPeriod)}
              className="text-[11px] text-indigo-600 hover:text-indigo-700"
            >
              + Add quiet period
            </button>
          )}
        </div>
        {showAddPeriod && canEdit && (
          <div className="rounded border border-gray-200 bg-gray-50 p-3 space-y-2">
            <Input
              type="text"
              placeholder="Label (e.g., Finals week)"
              value={newPeriod.label || ''}
              onChange={(e) => setNewPeriod({ ...newPeriod, label: e.target.value })}
              className="h-7 text-[11px]"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                placeholder="Start date"
                value={newPeriod.startDate || ''}
                onChange={(e) => setNewPeriod({ ...newPeriod, startDate: e.target.value })}
                className="h-7 text-[11px]"
              />
              <Input
                type="date"
                placeholder="End date"
                value={newPeriod.endDate || ''}
                onChange={(e) => setNewPeriod({ ...newPeriod, endDate: e.target.value })}
                className="h-7 text-[11px]"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addQuietPeriod}
                className="rounded border border-indigo-300 bg-indigo-50 px-2 py-1 text-[11px] text-indigo-700 hover:bg-indigo-100"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddPeriod(false);
                  setNewPeriod({ label: '', startDate: '', endDate: '' });
                }}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {config.seasonalQuietPeriods.length === 0 ? (
          <p className="text-[11px] text-gray-500">
            No seasonal quiet periods configured yet. Use these to pause proactive outreach during finals,
            institutional breaks, or other sensitive windows.
          </p>
        ) : (
          <div className="space-y-1">
            {config.seasonalQuietPeriods.map((period) => (
              <div key={period.id} className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 px-2 py-1">
                <span className="text-[11px] text-gray-700">
                  {period.label} ({period.startDate} → {period.endDate})
                </span>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => removeQuietPeriod(period.id)}
                    className="text-[11px] text-red-600 hover:text-red-800"
                  >
                    <FontAwesomeIcon icon="fa-solid fa-trash" className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sensitive dates & holidays */}
      <div className="space-y-2 border-b border-gray-100 pb-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Sensitive dates & holidays
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={() => setShowAddHoliday(!showAddHoliday)}
              className="text-[11px] text-indigo-600 hover:text-indigo-700"
            >
              + Add holiday
            </button>
          )}
        </div>
        {showAddHoliday && canEdit && (
          <div className="rounded border border-gray-200 bg-gray-50 p-3 space-y-2">
            <Input
              type="text"
              placeholder="Label (e.g., Memorial Day)"
              value={newHoliday.label || ''}
              onChange={(e) => setNewHoliday({ ...newHoliday, label: e.target.value })}
              className="h-7 text-[11px]"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                placeholder="Date"
                value={newHoliday.date || ''}
                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                className="h-7 text-[11px]"
              />
              <select
                value={newHoliday.scope || 'global'}
                onChange={(e) => setNewHoliday({ ...newHoliday, scope: e.target.value as 'global' | RoleKey })}
                className="rounded border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-900"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addHoliday}
                className="rounded border border-indigo-300 bg-indigo-50 px-2 py-1 text-[11px] text-indigo-700 hover:bg-indigo-100"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddHoliday(false);
                  setNewHoliday({ label: '', date: '', scope: 'global' });
                }}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {config.holidayRules.length === 0 ? (
          <p className="text-[11px] text-gray-500">
            No sensitive dates configured yet. Consider adding key holidays and days of mourning where
            solicitations should be paused or restricted to supportive messaging.
          </p>
        ) : (
          <div className="space-y-1">
            {config.holidayRules.map((holiday) => (
              <div key={holiday.id} className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 px-2 py-1">
                <span className="text-[11px] text-gray-700">
                  {holiday.label} ({holiday.date}) - {holiday.scope === 'global' ? 'Global' : holiday.scope}
                </span>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => removeHoliday(holiday.id)}
                    className="text-[11px] text-red-600 hover:text-red-800"
                  >
                    <FontAwesomeIcon icon="fa-solid fa-trash" className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Frequency caps */}
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
          Frequency caps
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1">
              Global limit: messages per week per person
            </label>
            {canEdit ? (
              <Input
                type="number"
                min="1"
                value={config.frequencyCaps.globalMaxMessagesPerWeek}
                onChange={(e) => {
                  onChange({
                    ...config,
                    frequencyCaps: {
                      ...config.frequencyCaps,
                      globalMaxMessagesPerWeek: parseInt(e.target.value) || 0,
                    },
                  });
                }}
                className="h-7 text-[11px]"
              />
            ) : (
              <p className="text-[11px] text-gray-600">{config.frequencyCaps.globalMaxMessagesPerWeek}</p>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1">
              Global limit: messages per day per person
            </label>
            {canEdit ? (
              <Input
                type="number"
                min="1"
                value={config.frequencyCaps.globalMaxMessagesPerDay}
                onChange={(e) => {
                  onChange({
                    ...config,
                    frequencyCaps: {
                      ...config.frequencyCaps,
                      globalMaxMessagesPerDay: parseInt(e.target.value) || 0,
                    },
                  });
                }}
                className="h-7 text-[11px]"
              />
            ) : (
              <p className="text-[11px] text-gray-600">{config.frequencyCaps.globalMaxMessagesPerDay}</p>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1">
              Default agent limit: messages in 14 days
            </label>
            {canEdit ? (
              <Input
                type="number"
                min="1"
                value={config.frequencyCaps.perAgentDefaultMaxIn14Days}
                onChange={(e) => {
                  onChange({
                    ...config,
                    frequencyCaps: {
                      ...config.frequencyCaps,
                      perAgentDefaultMaxIn14Days: parseInt(e.target.value) || 0,
                    },
                  });
                }}
                className="h-7 text-[11px]"
              />
            ) : (
              <p className="text-[11px] text-gray-600">{config.frequencyCaps.perAgentDefaultMaxIn14Days}</p>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1">
              Escalate to human after unanswered attempts
            </label>
            {canEdit ? (
              <Input
                type="number"
                min="1"
                value={config.frequencyCaps.maxUnansweredAttemptsBeforeEscalation}
                onChange={(e) => {
                  onChange({
                    ...config,
                    frequencyCaps: {
                      ...config.frequencyCaps,
                      maxUnansweredAttemptsBeforeEscalation: parseInt(e.target.value) || 0,
                    },
                  });
                }}
                className="h-7 text-[11px]"
              />
            ) : (
              <p className="text-[11px] text-gray-600">{config.frequencyCaps.maxUnansweredAttemptsBeforeEscalation}</p>
            )}
          </div>
        </div>
        <p className="text-[11px] text-gray-500">
          These limits help ensure a positive student experience and avoid over-contact.
        </p>
      </div>

      {/* Agent priority weighting */}
      <div className="mt-4 space-y-3 border-t border-gray-100 pt-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900">Agent priority weighting</h3>
          <p className="text-xs text-gray-600">
            Use weights to decide which agents send messages first when global limits are reached.
            Higher-priority agents will consume available message slots before lower-priority agents.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-100 text-[11px] font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2 text-left">Agent</th>
                <th className="px-3 py-2 text-left">Current priority</th>
                <th className="px-3 py-2 text-left">Override (optional)</th>
                <th className="px-3 py-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {agents.map((agent) => {
                const effectivePriority = priorityOverrides[agent.id] ?? agent.priorityWeight;
                return (
                  <tr key={agent.id}>
                    <td className="px-3 py-2 text-gray-900">{agent.name}</td>
                    <td className="px-3 py-2 text-gray-600">
                      {renderPriorityLabel(agent.priorityWeight)}
                    </td>
                    <td className="px-3 py-2">
                      {canEdit ? (
                        <select
                          className="w-full rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] text-gray-800 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                          value={effectivePriority}
                          onChange={(e) =>
                            handleOverrideChange(agent.id, Number(e.target.value) as AgentPriorityWeight)
                          }
                        >
                          <option value={5}>Critical (5)</option>
                          <option value={4}>High (4)</option>
                          <option value={3}>Standard (3)</option>
                          <option value={2}>Low (2)</option>
                          <option value={1}>Informational (1)</option>
                        </select>
                      ) : (
                        <span className="text-[11px] text-gray-600">
                          {renderPriorityLabel(effectivePriority)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-gray-500">
                      Higher priority agents use message slots first if caps are reached.
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-gray-500">
          These settings do not change your global caps. They control how agents share the limited
          message budget when caps or quiet hours restrict outreach.
        </p>
      </div>
    </section>
  );
}

