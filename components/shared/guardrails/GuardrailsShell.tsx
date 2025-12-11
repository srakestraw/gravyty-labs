'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GuardrailsPageClient } from './GuardrailsPageClient';
import { PoliciesIndexPage } from './PoliciesIndexPage';
import { PolicyEditor } from './PolicyEditor';
import { cn } from '@/lib/utils';
import { GuardrailPolicy, GuardrailPolicyId, GuardrailAssignmentRule } from '@/lib/guardrails/types';

interface GuardrailsShellProps {
  context?: 'admin' | 'assistants';
}

const GUARDRAILS_TABS = [
  { id: 'global', label: 'Global Guardrails' },
  { id: 'policies', label: 'Policies' },
] as const;

type GuardrailsTabId = (typeof GUARDRAILS_TABS)[number]['id'];

export function GuardrailsShell({ context = 'admin' }: GuardrailsShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Mock data - TODO: Replace with real API/store
  const [policies, setPolicies] = React.useState<GuardrailPolicy[]>([]);
  const [assignmentRules, setAssignmentRules] = React.useState<GuardrailAssignmentRule[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Initialize state from URL params
  const [activeTab, setActiveTab] = React.useState<GuardrailsTabId>(() => {
    const tab = searchParams.get('tab');
    return (tab === 'policies' ? 'policies' : 'global') as GuardrailsTabId;
  });
  const [selectedPolicyId, setSelectedPolicyId] = React.useState<GuardrailPolicyId | null>(() => {
    return searchParams.get('policyId') || null;
  });

  // Sync state from URL params when they change
  React.useEffect(() => {
    const urlTab = searchParams.get('tab');
    const urlPolicyId = searchParams.get('policyId');
    
    if (urlTab === 'policies') {
      setActiveTab('policies');
    } else {
      setActiveTab('global');
    }
    
    if (urlPolicyId) {
      setSelectedPolicyId(urlPolicyId);
    } else {
      setSelectedPolicyId(null);
    }
  }, [searchParams]);

  React.useEffect(() => {
    loadPolicies();
  }, []);

  React.useEffect(() => {
    // Update URL when tab or policy changes
    const params = new URLSearchParams();
    if (activeTab !== 'global') {
      params.set('tab', activeTab);
    }
    if (selectedPolicyId) {
      params.set('policyId', selectedPolicyId);
    }
    const queryString = params.toString();
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [activeTab, selectedPolicyId, router]);

  async function loadPolicies() {
    try {
      setLoading(true);
      // TODO: Replace with real API call
      // const response = await fetch('/api/guardrails/policies');
      // const data = await response.json();
      // if (data.policies && data.policies.length > 0) {
      //   setPolicies(data.policies);
      //   setAssignmentRules(data.assignmentRules || []);
      // } else {
      //   // Use mocks when API returns empty or in dev mode
      //   const { getMockGuardrailPolicies, getMockGuardrailAssignmentRules } = await import('@/lib/guardrails/mockPolicies');
      //   setPolicies(getMockGuardrailPolicies());
      //   setAssignmentRules(getMockGuardrailAssignmentRules());
      // }
      
      // For now, use mock data
      const { getMockGuardrailPolicies, getMockGuardrailAssignmentRules } = await import('@/lib/guardrails/mockPolicies');
      setPolicies(getMockGuardrailPolicies());
      setAssignmentRules(getMockGuardrailAssignmentRules());
    } catch (error) {
      console.error('Error loading policies:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePolicies(updatedPolicies: GuardrailPolicy[]) {
    setPolicies(updatedPolicies);
    // TODO: Save to API
  }

  async function handleSaveAssignmentRules(updatedRules: GuardrailAssignmentRule[]) {
    setAssignmentRules(updatedRules);
    // TODO: Save to API
  }

  function handleCreatePolicy() {
    setActiveTab('policies');
    setSelectedPolicyId(null);
  }

  function handleSelectPolicy(policyId: GuardrailPolicyId) {
    setSelectedPolicyId(policyId);
    setActiveTab('policies');
  }

  function handleBackToPolicies() {
    setSelectedPolicyId(null);
  }

  const basePath = context === 'admin' ? '/admin/guardrails' : '/ai-assistants/guardrails';

  // If a policy is selected, show the Policy Editor
  if (selectedPolicyId) {
    const selectedPolicy = policies.find(p => p.id === selectedPolicyId);
    if (selectedPolicy) {
      const policyRules = assignmentRules.filter(r => r.policyId === selectedPolicyId);
      return (
        <PolicyEditor
          policy={selectedPolicy}
          allPolicies={policies}
          assignmentRules={policyRules}
          allAssignmentRules={assignmentRules}
          onUpdatePolicy={(updated) => {
            setPolicies(policies.map(p => p.id === updated.id ? updated : p));
          }}
          onUpdatePolicies={handleSavePolicies}
          onUpdateAssignmentRules={(rules) => {
            const otherRules = assignmentRules.filter(r => r.policyId !== selectedPolicyId);
            handleSaveAssignmentRules([...otherRules, ...rules]);
          }}
          onDeletePolicy={(policyId) => {
            setPolicies(policies.filter(p => p.id !== policyId));
            setAssignmentRules(assignmentRules.filter(r => r.policyId !== policyId));
            setSelectedPolicyId(null);
          }}
          onSave={async () => {
            await handleSavePolicies(policies);
            await handleSaveAssignmentRules(assignmentRules);
          }}
          basePath={basePath}
          onBack={handleBackToPolicies}
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Guardrails
          </h1>
          <p className="text-sm text-gray-600">
            Baseline safety rules and contextual policies for assistants, apps, groups, and users.
          </p>
        </div>
      </header>

      {/* Tab bar */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {GUARDRAILS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'policies') {
                  setSelectedPolicyId(null);
                }
              }}
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
        {activeTab === 'global' && <GuardrailsPageClient />}
        {activeTab === 'policies' && (
          <PoliciesIndexPage
            policies={policies}
            assignmentRules={assignmentRules}
            onUpdatePolicies={handleSavePolicies}
            onUpdateAssignmentRules={handleSaveAssignmentRules}
            onSelectPolicy={handleSelectPolicy}
            onCreatePolicy={handleCreatePolicy}
            basePath={basePath}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
