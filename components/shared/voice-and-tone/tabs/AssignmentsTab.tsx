'use client';

import * as React from 'react';
import { VoiceProfile, AssignmentRule, AssignmentScope, AssignmentChannelScope } from '@/lib/communication/types';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';

interface AssignmentsTabProps {
  profile: VoiceProfile;
  rules: AssignmentRule[];
  allRules: AssignmentRule[];
  allProfiles: VoiceProfile[];
  onUpdateRules: (rules: AssignmentRule[]) => void;
}

// Mock data for apps, groups, agents, and users
// TODO: Replace with real API calls
const MOCK_APPS = [
  { id: 'app-1', name: 'Admissions AI Assistant' },
  { id: 'app-2', name: 'Student Success Coach' },
  { id: 'app-3', name: 'Athletics Bot' },
];

const MOCK_AGENTS = [
  { id: 'agent-1', name: 'Donor AI Agent' },
  { id: 'agent-2', name: 'Alumni Engagement Agent' },
  { id: 'agent-3', name: 'Student Support Agent' },
];

const MOCK_GROUPS = [
  { id: 'group-1', name: 'Admissions counselors' },
  { id: 'group-2', name: 'Advancement team' },
  { id: 'group-3', name: 'Athletics staff' },
];

const MOCK_USERS = [
  { id: 'user-1', name: 'Jordan Lee' },
  { id: 'user-2', name: 'Alex Martin' },
  { id: 'user-3', name: 'Taylor Singh' },
];

type ScopeFilter = 'All' | AssignmentScope;

// Group rules by scope for Applied summary
function groupRulesByScope(rules: AssignmentRule[]) {
  const grouped: Record<AssignmentScope, AssignmentRule[]> = {
    user: [],
    group: [],
    agent: [],
    app: [],
  };

  rules.forEach(rule => {
    if (grouped[rule.scope]) {
      grouped[rule.scope].push(rule);
    }
  });

  // Sort each group by order
  Object.keys(grouped).forEach(scope => {
    grouped[scope as AssignmentScope].sort((a, b) => a.order - b.order);
  });

  return grouped;
}

function getScopeLabel(scope: AssignmentScope): string {
  switch (scope) {
    case 'user':
      return 'Users';
    case 'group':
      return 'Groups';
    case 'agent':
      return 'Agents';
    case 'app':
      return 'Apps';
  }
}

function getChannelLabel(channel: string): string {
  switch (channel) {
    case 'all':
      return 'All channels';
    case 'chat':
      return 'Chat';
    case 'email':
      return 'Email';
    case 'sms':
      return 'SMS';
    default:
      return channel;
  }
}

export function AssignmentsTab({
  profile,
  rules,
  allRules,
  allProfiles,
  onUpdateRules,
}: AssignmentsTabProps) {
  const [scopeFilter, setScopeFilter] = React.useState<ScopeFilter>('All');
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newRule, setNewRule] = React.useState<Partial<AssignmentRule>>({
    scope: 'app',
    channelScope: 'all',
    profileId: profile.id,
  });
  const [highlightedRuleId, setHighlightedRuleId] = React.useState<string | null>(null);
  const rulesTableRef = React.useRef<HTMLDivElement>(null);

  const filteredRules = React.useMemo(() => {
    if (scopeFilter === 'All') return rules;
    return rules.filter(r => r.scope === scopeFilter);
  }, [rules, scopeFilter]);

  const sortedRules = React.useMemo(() => {
    return [...filteredRules].sort((a, b) => a.order - b.order);
  }, [filteredRules]);

  const groupedRules = React.useMemo(() => groupRulesByScope(rules), [rules]);
  const hasRules = rules.length > 0;
  const isDefault = profile.isDefault;

  function getTargetOptions(scope: AssignmentScope) {
    switch (scope) {
      case 'app':
        return MOCK_APPS;
      case 'agent':
        return MOCK_AGENTS;
      case 'group':
        return MOCK_GROUPS;
      case 'user':
        return MOCK_USERS;
    }
  }

  function addRule() {
    if (!newRule.scope || !newRule.targetId) return;

    const targetOptions = getTargetOptions(newRule.scope);
    const target = targetOptions.find(t => t.id === newRule.targetId);

    const maxOrder = rules.length > 0 ? Math.max(...rules.map(r => r.order)) : -1;
    const rule: AssignmentRule = {
      id: `assignment_rule_${Date.now()}`,
      scope: newRule.scope,
      targetId: newRule.targetId,
      targetLabel: target?.name || '',
      profileId: profile.id,
      channelScope: newRule.channelScope || 'all',
      order: maxOrder + 1,
    };

    onUpdateRules([...rules, rule]);
    setShowAddModal(false);
    setNewRule({
      scope: 'app',
      channelScope: 'all',
      profileId: profile.id,
    });
  }

  function updateRule(ruleId: string, updates: Partial<AssignmentRule>) {
    onUpdateRules(rules.map(r => r.id === ruleId ? { ...r, ...updates } : r));
  }

  function deleteRule(ruleId: string) {
    if (!confirm('Are you sure you want to delete this assignment rule?')) return;
    onUpdateRules(rules.filter(r => r.id !== ruleId));
  }

  function moveRule(ruleId: string, direction: 'up' | 'down') {
    const ruleIndex = rules.findIndex(r => r.id === ruleId);
    if (ruleIndex === -1) return;

    const newRules = [...rules];
    const targetIndex = direction === 'up' ? ruleIndex - 1 : ruleIndex + 1;

    if (targetIndex < 0 || targetIndex >= newRules.length) return;

    // Swap orders
    const tempOrder = newRules[ruleIndex].order;
    newRules[ruleIndex].order = newRules[targetIndex].order;
    newRules[targetIndex].order = tempOrder;

    // Renumber all rules to ensure sequential ordering (0, 1, 2, ...)
    const sorted = [...newRules].sort((a, b) => a.order - b.order);
    sorted.forEach((rule, idx) => {
      rule.order = idx;
    });

    onUpdateRules(sorted);
  }

  function handleNewRuleScopeChange(scope: AssignmentScope) {
    setNewRule({
      ...newRule,
      scope,
      targetId: undefined,
    });
  }

  function handleViewRule(ruleId: string) {
    // Scroll to rules table
    if (rulesTableRef.current) {
      rulesTableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Highlight the rule row
    setHighlightedRuleId(ruleId);
    setTimeout(() => {
      setHighlightedRuleId(null);
    }, 2000);
  }

  return (
    <div className="space-y-6">
      {/* Section A: Assignment Rules (editable) */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4" ref={rulesTableRef}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-gray-900">
              Assignment Rules
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              Define how this profile is assigned to specific apps, agents, groups, and users.
            </p>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-[11px] font-medium text-blue-900 mb-1">Assignment priority:</p>
              <ol className="text-[10px] text-blue-800 list-decimal list-inside space-y-0.5">
                <li>User</li>
                <li>Group</li>
                <li>Agent</li>
                <li>App</li>
                <li>Default profile</li>
              </ol>
              <p className="text-[10px] text-blue-700 mt-2">
                When multiple rules match, the most specific rule wins. If rules have equal specificity,
                the rule with the highest priority (top-most) is applied.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="text-[11px] h-7"
          >
            <FontAwesomeIcon icon="fa-solid fa-plus" className="h-3 w-3 mr-1" />
            Add rule
          </Button>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2">
          {(['All', 'user', 'group', 'agent', 'app'] as ScopeFilter[]).map((scope) => (
            <button
              key={scope}
              type="button"
              onClick={() => setScopeFilter(scope)}
              className={cn(
                'px-3 py-1 rounded-full text-[11px] font-medium transition-colors',
                scopeFilter === scope
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {scope === 'All' ? 'All' : scope.charAt(0).toUpperCase() + scope.slice(1) + 's'}
            </button>
          ))}
        </div>

        {/* Rules table */}
        {sortedRules.length === 0 ? (
          <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
            <FontAwesomeIcon icon="fa-solid fa-list" className="h-8 w-8 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">No assignment rules yet</p>
            <p className="text-xs text-gray-500 mb-4">
              This profile is not assigned to any apps, agents, groups, or users. Create a rule to assign it.
            </p>
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="text-[11px]"
            >
              <FontAwesomeIcon icon="fa-solid fa-plus" className="h-3 w-3 mr-1" />
              Add your first rule
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Scope</th>
                  <th className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Target</th>
                  <th className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                  <th className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedRules.map((rule, index) => {
                  const targetOptions = getTargetOptions(rule.scope);
                  const target = targetOptions.find(t => t.id === rule.targetId);
                  const isHighlighted = highlightedRuleId === rule.id;

                  return (
                    <tr
                      key={rule.id}
                      data-rule-id={rule.id}
                      className={cn(
                        'hover:bg-gray-50 transition-colors',
                        isHighlighted && 'bg-slate-100 ring-2 ring-indigo-500'
                      )}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          value={rule.scope}
                          onChange={(e) => {
                            const newScope = e.target.value as AssignmentScope;
                            const newTargetOptions = getTargetOptions(newScope);
                            updateRule(rule.id, {
                              scope: newScope,
                              targetId: newTargetOptions[0]?.id || '',
                              targetLabel: newTargetOptions[0]?.name || '',
                            });
                          }}
                          className="text-[11px] rounded border border-gray-200 bg-white px-2 py-1 text-gray-900"
                        >
                          <option value="user">User</option>
                          <option value="group">Group</option>
                          <option value="agent">Agent</option>
                          <option value="app">App</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          value={rule.targetId}
                          onChange={(e) => {
                            const targetOptions = getTargetOptions(rule.scope);
                            const target = targetOptions.find(t => t.id === e.target.value);
                            updateRule(rule.id, {
                              targetId: e.target.value,
                              targetLabel: target?.name || '',
                            });
                          }}
                          className="text-[11px] rounded border border-gray-200 bg-white px-2 py-1 text-gray-900 min-w-[180px]"
                        >
                          {getTargetOptions(rule.scope).map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          value={rule.channelScope}
                          onChange={(e) => updateRule(rule.id, { channelScope: e.target.value as AssignmentChannelScope })}
                          className="text-[11px] rounded border border-gray-200 bg-white px-2 py-1 text-gray-900"
                        >
                          <option value="all">All channels</option>
                          <option value="chat">Chat only</option>
                          <option value="email">Email only</option>
                          <option value="sms">SMS only</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveRule(rule.id, 'up')}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <FontAwesomeIcon icon="fa-solid fa-arrow-up" className="h-3 w-3" />
                          </button>
                          <span className="text-[11px] text-gray-600 min-w-[2rem] text-center">{rule.order}</span>
                          <button
                            type="button"
                            onClick={() => moveRule(rule.id, 'down')}
                            disabled={index === sortedRules.length - 1}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <FontAwesomeIcon icon="fa-solid fa-arrow-down" className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => deleteRule(rule.id)}
                          className="text-gray-400 hover:text-red-600"
                          title="Delete rule"
                        >
                          <FontAwesomeIcon icon="fa-solid fa-trash" className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Section B: Applied summary (read-only) */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Where this profile applies</h2>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-2">
            <p className="text-[11px] text-blue-800">
              This section summarizes the entities where this profile is in effect, based on the assignment rules above
              and default fallback.
              {isDefault && (
                <span className="block mt-1">
                  <strong>Note:</strong> Because this profile is marked as the default, it will also apply wherever no specific rule matches.
                </span>
              )}
            </p>
          </div>
        </div>

        {hasRules ? (
          <div className="space-y-6">
            {/* Grouped rules display */}
            {Object.entries(groupedRules).map(([scope, scopeRules]) => {
              if (scopeRules.length === 0) return null;

              return (
                <div key={scope} className="space-y-2">
                  <h3 className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                    {getScopeLabel(scope as AssignmentScope)}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                          <th className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                          <th className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider text-right">Rule</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {scopeRules.map((rule) => (
                          <tr key={rule.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-[11px] text-gray-900">{rule.targetLabel}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-[11px] text-gray-600">{getChannelLabel(rule.channelScope)}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-[11px] text-gray-600">{rule.order}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <button
                                type="button"
                                onClick={() => handleViewRule(rule.id)}
                                className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium"
                              >
                                View rule →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
            <FontAwesomeIcon icon="fa-solid fa-info-circle" className="h-8 w-8 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isDefault ? 'Default Profile' : 'No Assignment Rules'}
            </p>
            <p className="text-xs text-gray-500 mb-2">
              {isDefault ? (
                <>
                  This profile is the default profile. It applies to all apps, agents, groups, and users
                  where no specific assignment rule matches.
                </>
              ) : (
                <>
                  This profile has no assignment rules. It will only be used if explicitly selected
                  or if it becomes the default profile.
                </>
              )}
            </p>
            {!isDefault && (
              <p className="text-[10px] text-gray-400 mt-2">
                Create assignment rules above to apply this profile to specific entities.
              </p>
            )}
          </div>
        )}

        {/* Assignment Priority Explanation */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-[11px] font-semibold text-gray-700 mb-2">How Assignment Priority Works</h3>
          <div className="space-y-2 text-[10px] text-gray-600">
            <p>
              Assignment rules are evaluated in order of specificity (most specific to least specific):
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li><strong>User</strong> - Rules that target a specific user</li>
              <li><strong>Group</strong> - Rules that target a group the user belongs to</li>
              <li><strong>Agent</strong> - Rules that target a specific AI agent</li>
              <li><strong>App</strong> - Rules that target an application</li>
              <li><strong>Default</strong> - The profile marked as default (if no rules match)</li>
            </ol>
            <p className="mt-2">
              When multiple rules match at the same specificity level, the rule with the highest priority
              (lowest order number, shown at the top) is applied.
            </p>
          </div>
        </div>
      </section>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Add Assignment Rule</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Scope <span className="text-red-500">*</span>
                </label>
                <select
                  value={newRule.scope || 'app'}
                  onChange={(e) => handleNewRuleScopeChange(e.target.value as AssignmentScope)}
                  className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-900"
                >
                  <option value="user">User</option>
                  <option value="group">Group</option>
                  <option value="agent">Agent</option>
                  <option value="app">App</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Target <span className="text-red-500">*</span>
                </label>
                <select
                  value={newRule.targetId || ''}
                  onChange={(e) => {
                    const targetOptions = getTargetOptions(newRule.scope || 'app');
                    const target = targetOptions.find(t => t.id === e.target.value);
                    setNewRule({
                      ...newRule,
                      targetId: e.target.value,
                      targetLabel: target?.name || '',
                    });
                  }}
                  className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-900"
                >
                  <option value="">Select {newRule.scope}...</option>
                  {getTargetOptions(newRule.scope || 'app').map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Channel
                </label>
                <select
                  value={newRule.channelScope || 'all'}
                  onChange={(e) => setNewRule({ ...newRule, channelScope: e.target.value as AssignmentChannelScope })}
                  className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-900"
                >
                  <option value="all">All channels</option>
                  <option value="chat">Chat only</option>
                  <option value="email">Email only</option>
                  <option value="sms">SMS only</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddModal(false);
                  setNewRule({
                    scope: 'app',
                    channelScope: 'all',
                    profileId: profile.id,
                  });
                }}
                className="text-[11px]"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={addRule}
                disabled={!newRule.scope || !newRule.targetId}
                className="text-[11px]"
              >
                Add Rule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
