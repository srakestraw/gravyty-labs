'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { GuardrailPolicy, GuardrailPolicyId, GuardrailRule, GuardrailAssignmentRule } from '@/lib/guardrails/types';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AssignmentsPanel, AssignmentScope, AssignmentChannelScope } from '@/components/admin/AssignmentsPanel';
import { resolveGuardrailPolicy, GuardrailResolutionContext } from '@/lib/guardrails/resolveGuardrailPolicy';
import { GuardrailChannelScope, GuardrailScope } from '@/lib/guardrails/types';

const POLICY_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'rules', label: 'Rules' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'preview', label: 'Preview' },
] as const;

type PolicyTabId = (typeof POLICY_TABS)[number]['id'];

interface PolicyEditorProps {
  policy: GuardrailPolicy;
  allPolicies: GuardrailPolicy[];
  assignmentRules: GuardrailAssignmentRule[];
  allAssignmentRules: GuardrailAssignmentRule[];
  onUpdatePolicy: (policy: GuardrailPolicy) => void;
  onUpdatePolicies: (policies: GuardrailPolicy[]) => void | Promise<void>;
  onUpdateAssignmentRules: (rules: GuardrailAssignmentRule[]) => void;
  onDeletePolicy: (policyId: GuardrailPolicyId) => void;
  onSave: () => Promise<void>;
  basePath?: string;
  onBack?: () => void;
}

// Mock data for apps, groups, agents, and users
const MOCK_APPS = [
  { id: 'app-1', name: 'Admissions AI Assistant' },
  { id: 'app-2', name: 'Student Success Coach' },
  { id: 'app-3', name: 'Athletics Bot' },
  { id: 'app-advancement', name: 'Advancement AI Assistant' },
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
  { id: 'user-1', name: 'Jane Smith' },
  { id: 'user-2', name: 'Jordan Lee' },
  { id: 'user-3', name: 'Alex Martin' },
  { id: 'user-4', name: 'Taylor Singh' },
];

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

export function PolicyEditor({
  policy,
  allPolicies,
  assignmentRules,
  allAssignmentRules,
  onUpdatePolicy,
  onUpdatePolicies,
  onUpdateAssignmentRules,
  onDeletePolicy,
  onSave,
  basePath = '/admin/guardrails',
  onBack,
}: PolicyEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<PolicyTabId>('overview');
  const [localPolicy, setLocalPolicy] = React.useState<GuardrailPolicy>(policy);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [previewContext, setPreviewContext] = React.useState<GuardrailResolutionContext>({
    channel: 'all',
  });

  // Update local policy when prop changes
  React.useEffect(() => {
    setLocalPolicy(policy);
    setHasUnsavedChanges(false);
  }, [policy.id]);

  function updateLocalPolicy(updater: (p: GuardrailPolicy) => GuardrailPolicy) {
    setLocalPolicy(updater);
    setHasUnsavedChanges(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      onUpdatePolicy(localPolicy);
      await onSave();
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving policy:', error);
      alert('Failed to save policy. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSetDefault() {
    const updatedPolicies = allPolicies.map(p => ({
      ...p,
      isDefault: p.id === policy.id,
    }));
    await onUpdatePolicies(updatedPolicies);
    updateLocalPolicy(p => ({ ...p, isDefault: true }));
    try {
      await onSave();
    } catch (error) {
      console.error('Error saving default policy:', error);
    }
  }

  function handleDuplicate() {
    const duplicated: GuardrailPolicy = {
      ...localPolicy,
      id: `policy_${Date.now()}`,
      name: `${localPolicy.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onUpdatePolicies([...allPolicies, duplicated]);
    if (onBack) {
      onBack();
    }
    // Navigate to the duplicated policy
    router.push(`${basePath}?tab=policies&policyId=${duplicated.id}`);
  }

  function handleDelete() {
    if (localPolicy.isDefault) {
      alert('Cannot delete the default policy. Please set another policy as default first.');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${localPolicy.name}"? This action cannot be undone.`)) {
      return;
    }

    onDeletePolicy(localPolicy.id);
    if (onBack) {
      onBack();
    } else {
      router.push(`${basePath}?tab=policies`);
    }
  }

  const previewResult = React.useMemo(() => {
    try {
      return resolveGuardrailPolicy(allPolicies, allAssignmentRules, previewContext);
    } catch (error) {
      return null;
    }
  }, [allPolicies, allAssignmentRules, previewContext]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <button
          type="button"
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              router.push(`${basePath}?tab=policies`);
            }
          }}
          className="hover:text-gray-900"
        >
          Guardrails
        </button>
        <span className="mx-2">/</span>
        <button
          type="button"
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              router.push(`${basePath}?tab=policies`);
            }
          }}
          className="hover:text-gray-900"
        >
          Policies
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{localPolicy.name}</span>
      </nav>

      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">{localPolicy.name}</h1>
            {localPolicy.description && (
              <p className="text-sm text-gray-600 mt-1">{localPolicy.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              This policy layers on top of Global Guardrails.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {localPolicy.isDefault ? (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                Default
              </span>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetDefault}
                className="text-xs"
              >
                Set as default
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicate}
              className="text-xs"
            >
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || saving}
              className="text-xs"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {POLICY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <OverviewTab
            policy={localPolicy}
            onUpdate={updateLocalPolicy}
          />
        )}
        {activeTab === 'rules' && (
          <RulesTab
            policy={localPolicy}
            onUpdate={updateLocalPolicy}
          />
        )}
        {activeTab === 'assignments' && (
          <AssignmentsTab
            policy={localPolicy}
            rules={assignmentRules}
            allRules={allAssignmentRules}
            onUpdateRules={onUpdateAssignmentRules}
          />
        )}
        {activeTab === 'preview' && (
          <PreviewTab
            policy={localPolicy}
            allPolicies={allPolicies}
            allRules={allAssignmentRules}
            previewContext={previewContext}
            onUpdateContext={setPreviewContext}
            previewResult={previewResult}
          />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
interface OverviewTabProps {
  policy: GuardrailPolicy;
  onUpdate: (updater: (p: GuardrailPolicy) => GuardrailPolicy) => void;
}

function OverviewTab({ policy, onUpdate }: OverviewTabProps) {
  const [name, setName] = React.useState(policy.name);
  const [description, setDescription] = React.useState(policy.description || '');
  const [isDefault, setIsDefault] = React.useState(policy.isDefault);

  React.useEffect(() => {
    setName(policy.name);
    setDescription(policy.description || '');
    setIsDefault(policy.isDefault);
  }, [policy.id]);

  function handleNameChange(value: string) {
    setName(value);
    onUpdate(p => ({ ...p, name: value }));
  }

  function handleDescriptionChange(value: string) {
    setDescription(value);
    onUpdate(p => ({ ...p, description: value || undefined }));
  }

  function handleDefaultChange(checked: boolean) {
    setIsDefault(checked);
    onUpdate(p => ({ ...p, isDefault: checked }));
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-1">How this policy works</h2>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
          <div className="space-y-2 text-xs text-blue-900">
            <div className="flex items-start gap-2">
              <span className="font-semibold">1.</span>
              <span>Global Guardrails define mandatory safety, fairness, privacy, and escalation rules.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">2.</span>
              <span>This policy can tighten or tailor behavior for specific apps, agents, groups, or users.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">3.</span>
              <span>Assignments determine where this policy is used.</span>
            </div>
          </div>
          <div className="pt-2 border-t border-blue-200">
            <p className="text-xs font-medium text-blue-900">
              Final behavior = Global Guardrails + assigned policy for the context
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Policy Settings</h2>
        <p className="text-xs text-gray-600 mb-4">
          Configure basic policy information and default status.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g., Admissions Policy, Safety Policy"
            className="text-sm"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Brief description of this policy"
            rows={3}
            className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => handleDefaultChange(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label className="text-sm text-gray-700 cursor-pointer">
            Set as default policy
          </label>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <p className="text-[10px] text-gray-500">
            Policy ID: <code className="text-gray-600">{policy.id}</code>
          </p>
          <p className="text-[10px] text-gray-500 mt-2">
            Guardrail policies define safety, fairness, and compliance rules for your AI assistants. Each policy can be mapped to specific apps, agents, groups, or users using Assignment Rules.
          </p>
        </div>
      </div>
    </section>
  );
}

// Rules Tab Component
interface RulesTabProps {
  policy: GuardrailPolicy;
  onUpdate: (updater: (p: GuardrailPolicy) => GuardrailPolicy) => void;
}

function RulesTab({ policy, onUpdate }: RulesTabProps) {
  function addRule() {
    const newRule: GuardrailRule = {
      id: `rule_${Date.now()}`,
      category: 'custom',
      description: '',
      action: 'block',
      enabled: true,
    };
    onUpdate(p => ({ ...p, rules: [...p.rules, newRule] }));
  }

  function updateRule(ruleId: string, updates: Partial<GuardrailRule>) {
    onUpdate(p => ({
      ...p,
      rules: p.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r),
    }));
  }

  function deleteRule(ruleId: string) {
    onUpdate(p => ({
      ...p,
      rules: p.rules.filter(r => r.id !== ruleId),
    }));
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Guardrail Rules</h2>
          <p className="text-xs text-gray-600">
            Define the specific guardrail rules that make up this policy.
          </p>
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-[11px] text-amber-800">
              These rules tailor behavior for this policy. Core safety and privacy requirements from Global Guardrails still apply and are not removed here.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={addRule}
          className="text-[11px] h-7"
        >
          <FontAwesomeIcon icon="fa-solid fa-plus" className="h-3 w-3 mr-1" />
          Add rule
        </Button>
      </div>

      {policy.rules.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
          <FontAwesomeIcon icon="fa-solid fa-shield-halved" className="h-8 w-8 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-700 mb-1">No rules yet</p>
          <p className="text-xs text-gray-500 mb-4">
            Add guardrail rules to define what this policy enforces.
          </p>
          <Button
            size="sm"
            onClick={addRule}
            className="text-[11px]"
          >
            <FontAwesomeIcon icon="fa-solid fa-plus" className="h-3 w-3 mr-1" />
            Add your first rule
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {policy.rules.map((rule) => (
            <div key={rule.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) => updateRule(rule.id, { enabled: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600"
                  />
                  <select
                    value={rule.category}
                    onChange={(e) => updateRule(rule.id, { category: e.target.value as GuardrailRule['category'] })}
                    className="text-[11px] rounded border border-gray-200 bg-white px-2 py-1 text-gray-900"
                  >
                    <option value="safety">Safety</option>
                    <option value="compliance">Compliance</option>
                    <option value="brand">Brand</option>
                    <option value="custom">Custom</option>
                  </select>
                  <select
                    value={rule.action}
                    onChange={(e) => updateRule(rule.id, { action: e.target.value as GuardrailRule['action'] })}
                    className="text-[11px] rounded border border-gray-200 bg-white px-2 py-1 text-gray-900"
                  >
                    <option value="block">Block</option>
                    <option value="rewrite">Rewrite</option>
                    <option value="escalate">Escalate</option>
                    <option value="log">Log</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => deleteRule(rule.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <FontAwesomeIcon icon="fa-solid fa-trash" className="h-4 w-4" />
                </button>
              </div>
              <textarea
                value={rule.description || ''}
                onChange={(e) => updateRule(rule.id, { description: e.target.value })}
                placeholder="Rule description..."
                rows={2}
                className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-[11px] text-gray-900"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// Assignments Tab Component
interface AssignmentsTabProps {
  policy: GuardrailPolicy;
  rules: GuardrailAssignmentRule[];
  allRules: GuardrailAssignmentRule[];
  onUpdateRules: (rules: GuardrailAssignmentRule[]) => void;
}

function AssignmentsTab({ policy, rules, allRules, onUpdateRules }: AssignmentsTabProps) {
  // Convert GuardrailAssignmentRule to match AssignmentRuleBase structure
  // The types are compatible, but we need to ensure TypeScript recognizes them
  const convertedRules = rules as unknown as Array<{
    id: string;
    scope: AssignmentScope;
    targetId: string;
    targetLabel: string;
    channelScope: AssignmentChannelScope;
    order: number;
  }>;

  return (
    <AssignmentsPanel
      rules={convertedRules}
      entityLabel="policy"
      onChange={(updatedRules) => {
        // Convert back to GuardrailAssignmentRule
        const guardrailRules = updatedRules.map(rule => ({
          ...rule,
          policyId: policy.id,
          scope: rule.scope as GuardrailScope,
          channelScope: rule.channelScope as GuardrailChannelScope,
        })) as GuardrailAssignmentRule[];
        onUpdateRules(guardrailRules);
      }}
      getTargetOptions={getTargetOptions}
      isDefault={policy.isDefault}
      allRules={allRules as unknown as typeof convertedRules}
    />
  );
}

// Preview Tab Component
interface PreviewTabProps {
  policy: GuardrailPolicy;
  allPolicies: GuardrailPolicy[];
  allRules: GuardrailAssignmentRule[];
  previewContext: GuardrailResolutionContext;
  onUpdateContext: (context: GuardrailResolutionContext) => void;
  previewResult: ReturnType<typeof resolveGuardrailPolicy> | null;
}

function PreviewTab({
  policy,
  allPolicies,
  allRules,
  previewContext,
  onUpdateContext,
  previewResult,
}: PreviewTabProps) {
  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Preview / Test</h2>
        <p className="text-xs text-gray-600">
          Test which policy would be applied for a given context.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1">
              App
            </label>
            <select
              value={previewContext.appId || ''}
              onChange={(e) => onUpdateContext({ ...previewContext, appId: e.target.value || undefined })}
              className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-900"
            >
              <option value="">None</option>
              {MOCK_APPS.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1">
              Agent
            </label>
            <select
              value={previewContext.agentId || ''}
              onChange={(e) => onUpdateContext({ ...previewContext, agentId: e.target.value || undefined })}
              className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-900"
            >
              <option value="">None</option>
              {MOCK_AGENTS.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1">
              User
            </label>
            <select
              value={previewContext.userId || ''}
              onChange={(e) => onUpdateContext({ ...previewContext, userId: e.target.value || undefined })}
              className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-900"
            >
              <option value="">None</option>
              {MOCK_USERS.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1">
              Channel
            </label>
            <select
              value={previewContext.channel || 'all'}
              onChange={(e) => onUpdateContext({ ...previewContext, channel: e.target.value as GuardrailChannelScope })}
              className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-900"
            >
              <option value="all">All channels</option>
              <option value="chat">Chat</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>
        </div>

        {previewResult && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Effective guardrail stack for this context</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-semibold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-900">Global Guardrails</p>
                    <p className="text-[11px] text-blue-700 mt-0.5">Always on baseline</p>
                  </div>
                </div>
                <div className="flex items-center justify-center text-blue-400">
                  <FontAwesomeIcon icon="fa-solid fa-arrow-down" className="h-4 w-4" />
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-semibold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-900">
                      {allPolicies.find(p => p.id === previewResult.policyId)?.name || previewResult.policyId}
                    </p>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      Selected by {previewResult.source === 'rule' 
                        ? `${previewResult.scope}-level assignment rule`
                        : 'default policy'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center text-blue-400">
                  <FontAwesomeIcon icon="fa-solid fa-arrow-down" className="h-4 w-4" />
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px] font-semibold">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-900">Final behavior</p>
                    <p className="text-[11px] text-blue-700 mt-0.5">Intersection of Global Guardrails and this policy</p>
                  </div>
                </div>
              </div>
            </div>
            {previewResult.ruleId && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="space-y-1 text-[11px] text-gray-600">
                  <div>
                    <strong>Rule ID:</strong> {previewResult.ruleId}
                  </div>
                  {previewResult.scope && (
                    <div>
                      <strong>Scope:</strong> {previewResult.scope}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
