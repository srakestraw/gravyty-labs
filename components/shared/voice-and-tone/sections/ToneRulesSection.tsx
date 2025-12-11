'use client';

import * as React from 'react';
import { ToneRule, ToneRuleScope, ToneRuleChannelScope, VoiceProfile, VoiceProfileId } from '@/lib/communication/types';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ToneRulesSectionProps {
  rules: ToneRule[];
  profiles: VoiceProfile[];
  onChange: (rules: ToneRule[]) => void;
  canEdit: boolean;
}

// Mock data for apps, groups, and users
// TODO: Replace with real API calls
const MOCK_APPS = [
  { id: 'app-1', name: 'Admissions AI Assistant' },
  { id: 'app-2', name: 'Student Success Coach' },
  { id: 'app-3', name: 'Athletics Bot' },
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

type ScopeFilter = 'All' | ToneRuleScope;

export function ToneRulesSection({ rules, profiles, onChange, canEdit }: ToneRulesSectionProps) {
  const [scopeFilter, setScopeFilter] = React.useState<ScopeFilter>('All');
  const [editingRuleId, setEditingRuleId] = React.useState<string | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newRule, setNewRule] = React.useState<Partial<ToneRule>>({
    scope: 'app',
    channelScope: 'all',
    profileId: profiles.find(p => p.isDefault)?.id || profiles[0]?.id || '',
  });

  const defaultProfile = profiles.find(p => p.isDefault);

  const filteredRules = React.useMemo(() => {
    if (scopeFilter === 'All') return rules;
    return rules.filter(r => r.scope === scopeFilter);
  }, [rules, scopeFilter]);

  const sortedRules = React.useMemo(() => {
    return [...filteredRules].sort((a, b) => a.order - b.order);
  }, [filteredRules]);

  function getTargetOptions(scope: ToneRuleScope) {
    switch (scope) {
      case 'app':
        return MOCK_APPS;
      case 'group':
        return MOCK_GROUPS;
      case 'user':
        return MOCK_USERS;
    }
  }

  function addRule() {
    if (!newRule.scope || !newRule.targetId || !newRule.profileId) return;

    const targetOptions = getTargetOptions(newRule.scope);
    const target = targetOptions.find(t => t.id === newRule.targetId);

    const maxOrder = rules.length > 0 ? Math.max(...rules.map(r => r.order)) : -1;
    const rule: ToneRule = {
      id: `tone_rule_${Date.now()}`,
      scope: newRule.scope,
      targetId: newRule.targetId,
      targetLabel: target?.name || '',
      profileId: newRule.profileId,
      channelScope: newRule.channelScope || 'all',
      order: maxOrder + 1,
    };

    onChange([...rules, rule]);
    setShowAddModal(false);
    setNewRule({
      scope: 'app',
      channelScope: 'all',
      profileId: profiles.find(p => p.isDefault)?.id || profiles[0]?.id || '',
    });
  }

  function updateRule(ruleId: string, updates: Partial<ToneRule>) {
    onChange(rules.map(r => r.id === ruleId ? { ...r, ...updates } : r));
  }

  function deleteRule(ruleId: string) {
    onChange(rules.filter(r => r.id !== ruleId));
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

    onChange(newRules);
  }

  function handleNewRuleScopeChange(scope: ToneRuleScope) {
    setNewRule({
      ...newRule,
      scope,
      targetId: undefined,
    });
  }

  return (
    <>
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-gray-900">
              Tone Rules
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              Control which voice profile applies to each app, group, or user.
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              Rules are evaluated from top to bottom. If no rule matches, the default voice profile is used.
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Precedence: User → Group → App → Default profile
            </p>
          </div>
          {canEdit && (
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="text-[11px] h-7"
            >
              <FontAwesomeIcon icon="fa-solid fa-plus" className="h-3 w-3 mr-1" />
              Add rule
            </Button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2">
          {(['All', 'app', 'group', 'user'] as ScopeFilter[]).map((scope) => (
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
            <p className="text-sm font-medium text-gray-700 mb-1">No tone rules yet.</p>
            <p className="text-xs text-gray-500 mb-4">
              All assistants use your default voice profile.
            </p>
            {canEdit && (
              <Button
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="text-[11px]"
              >
                <FontAwesomeIcon icon="fa-solid fa-plus" className="h-3 w-3 mr-1" />
                Add your first rule
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Scope</th>
                  <th className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Target</th>
                  <th className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Voice profile</th>
                  <th className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Applies to</th>
                  <th className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedRules.map((rule, index) => {
                  const profile = profiles.find(p => p.id === rule.profileId);
                  const targetOptions = getTargetOptions(rule.scope);
                  const target = targetOptions.find(t => t.id === rule.targetId);

                  return (
                    <tr key={rule.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {canEdit ? (
                          <select
                            value={rule.scope}
                            onChange={(e) => {
                              const newScope = e.target.value as ToneRuleScope;
                              const newTargetOptions = getTargetOptions(newScope);
                              updateRule(rule.id, {
                                scope: newScope,
                                targetId: newTargetOptions[0]?.id || '',
                                targetLabel: newTargetOptions[0]?.name || '',
                              });
                            }}
                            className="text-[11px] rounded border border-gray-200 bg-white px-2 py-1 text-gray-900"
                          >
                            <option value="app">App</option>
                            <option value="group">Group</option>
                            <option value="user">User</option>
                          </select>
                        ) : (
                          <span className="text-[11px] text-gray-700 capitalize">{rule.scope}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {canEdit ? (
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
                        ) : (
                          <span className="text-[11px] text-gray-700">{rule.targetLabel}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {canEdit ? (
                          <select
                            value={rule.profileId}
                            onChange={(e) => updateRule(rule.id, { profileId: e.target.value })}
                            className="text-[11px] rounded border border-gray-200 bg-white px-2 py-1 text-gray-900"
                          >
                            {profiles.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}{p.isDefault ? ' (Default)' : ''}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[11px] text-gray-700">
                            {profile?.name || 'Unknown'}
                            {profile?.isDefault && ' (Default)'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {canEdit ? (
                          <select
                            value={rule.channelScope}
                            onChange={(e) => updateRule(rule.id, { channelScope: e.target.value as ToneRuleChannelScope })}
                            className="text-[11px] rounded border border-gray-200 bg-white px-2 py-1 text-gray-900"
                          >
                            <option value="all">All channels</option>
                            <option value="chat">Chat only</option>
                            <option value="email">Email only</option>
                            <option value="sms">SMS only</option>
                          </select>
                        ) : (
                          <span className="text-[11px] text-gray-700 capitalize">
                            {rule.channelScope === 'all' ? 'All channels' : rule.channelScope}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveRule(rule.id, 'up')}
                            disabled={index === 0 || !canEdit}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <FontAwesomeIcon icon="fa-solid fa-arrow-up" className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveRule(rule.id, 'down')}
                            disabled={index === sortedRules.length - 1 || !canEdit}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <FontAwesomeIcon icon="fa-solid fa-arrow-down" className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => deleteRule(rule.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="Delete rule"
                          >
                            <FontAwesomeIcon icon="fa-solid fa-trash" className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Add Tone Rule</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Scope <span className="text-red-500">*</span>
                </label>
                <select
                  value={newRule.scope || 'app'}
                  onChange={(e) => handleNewRuleScopeChange(e.target.value as ToneRuleScope)}
                  className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-900"
                >
                  <option value="app">App</option>
                  <option value="group">Group</option>
                  <option value="user">User</option>
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
                  Voice profile <span className="text-red-500">*</span>
                </label>
                <select
                  value={newRule.profileId || ''}
                  onChange={(e) => setNewRule({ ...newRule, profileId: e.target.value })}
                  className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-900"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.isDefault ? ' (Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Applies to
                </label>
                <select
                  value={newRule.channelScope || 'all'}
                  onChange={(e) => setNewRule({ ...newRule, channelScope: e.target.value as ToneRuleChannelScope })}
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
                    profileId: profiles.find(p => p.isDefault)?.id || profiles[0]?.id || '',
                  });
                }}
                className="text-[11px]"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={addRule}
                disabled={!newRule.scope || !newRule.targetId || !newRule.profileId}
                className="text-[11px]"
              >
                Add Rule
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
