'use client';

import * as React from 'react';
import { GuardrailPolicy, GuardrailPolicyId, GuardrailAssignmentRule } from '@/lib/guardrails/types';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

// Format date as "Dec 11, 2025"
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Get assignment summary for a policy
function getAssignmentSummary(policyId: GuardrailPolicyId, assignmentRules: GuardrailAssignmentRule[]): string {
  const rules = assignmentRules.filter(r => r.policyId === policyId);
  if (rules.length === 0) return 'Not assigned';
  
  const apps = rules.filter(r => r.scope === 'app').length;
  const agents = rules.filter(r => r.scope === 'agent').length;
  const groups = rules.filter(r => r.scope === 'group').length;
  const users = rules.filter(r => r.scope === 'user').length;
  
  const parts: string[] = [];
  if (apps > 0) parts.push(`${apps} app${apps > 1 ? 's' : ''}`);
  if (agents > 0) parts.push(`${agents} agent${agents > 1 ? 's' : ''}`);
  if (groups > 0) parts.push(`${groups} group${groups > 1 ? 's' : ''}`);
  if (users > 0) parts.push(`${users} user${users > 1 ? 's' : ''}`);
  
  return parts.join(', ');
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

  function handleNavigateToAssignments(policyId: GuardrailPolicyId) {
    // Navigate to policy editor with assignments tab
    onSelectPolicy(policyId);
    // Note: The PolicyEditor will need to support opening to a specific tab
    // For now, just navigate to the policy
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
      <div className="space-y-6" style={{ isolation: 'isolate' }}>
        {/* Compact header section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Guardrail Policies
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Reusable policies layered on top of Global Guardrails.
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

        {/* Policies List */}
        {policies.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <FontAwesomeIcon icon="fa-solid fa-shield-halved" className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-700 mb-1">No guardrail policies yet</h3>
            <p className="text-xs text-gray-500 mb-4">
              Create your first policy to customize guardrails for a specific app, agent, group, or user while still inheriting Global Guardrails.
            </p>
            <Button
              onClick={() => {
                setShowCreateModal(true);
              }}
              size="sm"
            >
              <FontAwesomeIcon icon="fa-solid fa-plus" className="h-3 w-3 mr-1" />
              New policy
            </Button>
          </div>
        ) : (
          <div className="space-y-3 overflow-visible">
            {policies.map((policy) => {
              const assignmentSummary = getAssignmentSummary(policy.id, assignmentRules);
              const lastUpdated = policy.updatedAt || policy.createdAt;
              
              return (
                <div
                  key={policy.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors relative"
                  style={{ zIndex: 'auto' }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Column 1: Policy info (2/3 width on desktop) */}
                    <div className="flex-1 min-w-0 sm:flex-[2]">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => onSelectPolicy(policy.id)}
                          className="text-left font-semibold text-gray-900 hover:text-indigo-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded px-1 -ml-1"
                        >
                          {policy.name}
                        </button>
                        {policy.isDefault && (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                            Default
                          </span>
                        )}
                      </div>
                      {policy.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {policy.description}
                        </p>
                      )}
                    </div>

                    {/* Column 2: Status block (1/3 width on desktop, stacks on mobile) */}
                    <div className="flex-shrink-0 sm:text-right sm:flex-[1] sm:min-w-[200px]">
                      <div className="space-y-1 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">{policy.rules.length}</span> rule{policy.rules.length !== 1 ? 's' : ''}
                        </div>
                        <div>
                          Assigned: <span className="text-gray-900">{assignmentSummary}</span>
                        </div>
                        {lastUpdated && (
                          <div>
                            Updated: <span className="text-gray-900">{formatDate(lastUpdated)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 3: Actions (aligned top-right) */}
                    <div className="flex-shrink-0 sm:self-start">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 relative z-0"
                            aria-label={`Actions for ${policy.name}`}
                          >
                            <FontAwesomeIcon icon="fa-solid fa-ellipsis-vertical" className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="w-48">
                          <DropdownMenuItem
                            onClick={() => onSelectPolicy(policy.id)}
                            className="cursor-pointer"
                          >
                            <FontAwesomeIcon icon="fa-solid fa-pencil" className="h-3 w-3 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(policy)}
                            className="cursor-pointer"
                          >
                            <FontAwesomeIcon icon="fa-solid fa-copy" className="h-3 w-3 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          {!policy.isDefault && (
                            <DropdownMenuItem
                              onClick={() => handleSetDefault(policy.id)}
                              className="cursor-pointer"
                            >
                              <FontAwesomeIcon icon="fa-solid fa-star" className="h-3 w-3 mr-2" />
                              Set default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(policy.id)}
                            disabled={deletingPolicyId === policy.id}
                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <FontAwesomeIcon icon="fa-solid fa-trash" className="h-3 w-3 mr-2" />
                            {deletingPolicyId === policy.id ? 'Deleting...' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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





