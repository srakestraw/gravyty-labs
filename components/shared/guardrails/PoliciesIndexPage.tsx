'use client';

import * as React from 'react';
import { GuardrailPolicy, GuardrailPolicyId, GuardrailAssignmentRule } from '@/lib/guardrails/types';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';

interface PoliciesIndexPageProps {
  policies: GuardrailPolicy[];
  assignmentRules: GuardrailAssignmentRule[];
  onUpdatePolicies: (policies: GuardrailPolicy[]) => void | Promise<void>;
  onUpdateAssignmentRules: (rules: GuardrailAssignmentRule[]) => void | Promise<void>;
  onSelectPolicy: (policyId: GuardrailPolicyId) => void;
  onCreatePolicy: () => void;
  basePath?: string;
  loading?: boolean;
}

// Mock function to count usage - TODO: Replace with real API
function getUsageCount(policyId: GuardrailPolicyId, assignmentRules: GuardrailAssignmentRule[]): string {
  const rules = assignmentRules.filter(r => r.policyId === policyId);
  if (rules.length === 0) return 'Not used';
  
  const apps = rules.filter(r => r.scope === 'app').length;
  const agents = rules.filter(r => r.scope === 'agent').length;
  const groups = rules.filter(r => r.scope === 'group').length;
  const users = rules.filter(r => r.scope === 'user').length;
  
  const parts: string[] = [];
  if (apps > 0) parts.push(`${apps} app${apps > 1 ? 's' : ''}`);
  if (agents > 0) parts.push(`${agents} agent${agents > 1 ? 's' : ''}`);
  if (groups > 0) parts.push(`${groups} group${groups > 1 ? 's' : ''}`);
  if (users > 0) parts.push(`${users} user${users > 1 ? 's' : ''}`);
  
  return parts.join(', ') || 'Not used';
}

export function PoliciesIndexPage({
  policies,
  assignmentRules,
  onUpdatePolicies,
  onUpdateAssignmentRules,
  onSelectPolicy,
  onCreatePolicy,
  basePath = '/admin/guardrails',
  loading = false,
}: PoliciesIndexPageProps) {
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [newPolicyName, setNewPolicyName] = React.useState('');
  const [newPolicyDescription, setNewPolicyDescription] = React.useState('');
  const [startFromPolicyId, setStartFromPolicyId] = React.useState<GuardrailPolicyId | null>(null);
  const [deletingPolicyId, setDeletingPolicyId] = React.useState<GuardrailPolicyId | null>(null);
  const [creatingPolicy, setCreatingPolicy] = React.useState(false);

  async function handleCreatePolicy() {
    if (!newPolicyName.trim() || creatingPolicy) return;

    const startFrom = startFromPolicyId
      ? policies.find(p => p.id === startFromPolicyId)
      : policies.find(p => p.isDefault) || policies[0];

    setCreatingPolicy(true);

    try {
      const newPolicy: GuardrailPolicy = {
        ...(startFrom || {
          id: `policy_${Date.now()}`,
          name: newPolicyName.trim(),
          description: newPolicyDescription.trim() || undefined,
          isDefault: false,
          rules: [],
        }),
        id: `policy_${Date.now()}`,
        name: newPolicyName.trim(),
        description: newPolicyDescription.trim() || undefined,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onUpdatePolicies([...policies, newPolicy]);
      
      setShowCreateModal(false);
      setNewPolicyName('');
      setNewPolicyDescription('');
      setStartFromPolicyId(null);
      
      // Navigate to the new policy editor
      onSelectPolicy(newPolicy.id);
    } catch (error) {
      console.error('Error creating policy:', error);
      alert('Failed to create policy. Please try again.');
    } finally {
      setCreatingPolicy(false);
    }
  }

  async function handleDuplicate(policy: GuardrailPolicy) {
    const duplicated: GuardrailPolicy = {
      ...policy,
      id: `policy_${Date.now()}`,
      name: `${policy.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await onUpdatePolicies([...policies, duplicated]);
    onSelectPolicy(duplicated.id);
  }

  function handleDelete(policyId: GuardrailPolicyId) {
    const policy = policies.find(p => p.id === policyId);
    if (!policy) return;

    if (policy.isDefault) {
      alert('Cannot delete the default policy. Please set another policy as default first.');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${policy.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingPolicyId(policyId);
    
    // Remove policy
    const updatedPolicies = policies.filter(p => p.id !== policyId);
    
    // Remove assignment rules for this policy
    const updatedRules = assignmentRules.filter(r => r.policyId !== policyId);
    
    onUpdatePolicies(updatedPolicies);
    onUpdateAssignmentRules(updatedRules);
    setDeletingPolicyId(null);
  }

  function handleSetDefault(policyId: GuardrailPolicyId) {
    onUpdatePolicies(
      policies.map(p => ({
        ...p,
        isDefault: p.id === policyId,
      }))
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="p-6 text-center text-gray-600">Loading policies...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Guardrail Policies
              </h1>
              <p className="text-sm text-gray-600">
                Create reusable guardrail policy profiles that layer on top of Global Guardrails, then assign them to apps, agents, groups, and users.
              </p>
            </div>
            <Button
              onClick={() => {
                const defaultPolicy = policies.find(p => p.isDefault) || policies[0];
                setStartFromPolicyId(defaultPolicy?.id || null);
                setShowCreateModal(true);
              }}
              className="text-sm"
            >
              <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4 mr-2" />
              New policy
            </Button>
          </div>
        </header>

        {/* Policies Table */}
        <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
          {policies.length === 0 ? (
            <div className="p-12 text-center">
              <FontAwesomeIcon icon="fa-solid fa-shield-halved" className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm font-medium text-gray-700 mb-1">No policies yet</p>
              <p className="text-xs text-gray-500 mb-4">
                Create your first guardrail policy to get started.
              </p>
              <Button
                onClick={() => {
                  setShowCreateModal(true);
                }}
                size="sm"
              >
                <FontAwesomeIcon icon="fa-solid fa-plus" className="h-3 w-3 mr-1" />
                Create policy
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Policy</th>
                    <th className="px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Default</th>
                    <th className="px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Rules</th>
                    <th className="px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Assigned to</th>
                    <th className="px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Last updated</th>
                    <th className="px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {policies.map((policy) => (
                    <tr key={policy.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{policy.name}</div>
                          {policy.description && (
                            <div className="text-xs text-gray-500 mt-0.5">{policy.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {policy.isDefault ? (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                            Default
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-600">
                        {policy.rules.length} rule{policy.rules.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-600">
                        {getUsageCount(policy.id, assignmentRules)}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-600">
                        {policy.updatedAt 
                          ? new Date(policy.updatedAt).toLocaleDateString()
                          : policy.createdAt
                          ? new Date(policy.createdAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectPolicy(policy.id)}
                            className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(policy)}
                            className="text-[11px] text-gray-600 hover:text-gray-700"
                          >
                            Duplicate
                          </button>
                          {!policy.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(policy.id)}
                              className="text-[11px] text-gray-600 hover:text-gray-700"
                            >
                              Set default
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(policy.id)}
                            disabled={deletingPolicyId === policy.id}
                            className="text-[11px] text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            {deletingPolicyId === policy.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Create Policy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Create New Policy</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={newPolicyName}
                  onChange={(e) => setNewPolicyName(e.target.value)}
                  placeholder="e.g., Admissions Policy, Safety Policy"
                  className="h-8 text-[11px]"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <Input
                  type="text"
                  value={newPolicyDescription}
                  onChange={(e) => setNewPolicyDescription(e.target.value)}
                  placeholder="Brief description of this policy"
                  className="h-8 text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Start from
                </label>
                <select
                  value={startFromPolicyId || ''}
                  onChange={(e) => setStartFromPolicyId(e.target.value || null)}
                  className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-900"
                >
                  <option value="">Empty policy</option>
                  {policies.length > 0 && (
                    <>
                      <option value="global">Global Guardrails (current settings)</option>
                      {policies.map((policy) => (
                        <option key={policy.id} value={policy.id}>
                          {policy.name}{policy.isDefault ? ' (Default)' : ''}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewPolicyName('');
                  setNewPolicyDescription('');
                  setStartFromPolicyId(null);
                }}
                className="text-[11px]"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreatePolicy}
                disabled={!newPolicyName.trim() || creatingPolicy}
                className="text-[11px]"
              >
                {creatingPolicy ? (
                  <>
                    <FontAwesomeIcon icon="fa-solid fa-spinner" className="h-3 w-3 mr-1 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Policy'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
