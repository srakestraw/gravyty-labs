'use client';

import * as React from 'react';
import { GuardrailsConfig } from '@/lib/guardrails/types';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';
import { FairnessDEISection } from './sections/FairnessDEISection';
import { PrivacyDataSection } from './sections/PrivacyDataSection';
import { EngagementSection } from './sections/EngagementSection';
import { ActionsSection } from './sections/ActionsSection';
import { HumanEscalationSection, EscalationRule } from './sections/HumanEscalationSection';
import { LoggingSection } from './sections/LoggingSection';
import { SummarySection } from './sections/SummarySection';

const GUARDRAIL_TABS = [
  { id: "summary", label: "Summary" },
  { id: "fairness", label: "Fairness & DEI" },
  { id: "privacy", label: "Privacy & data scope" },
  { id: "engagement", label: "Engagement & contact policy" },
  { id: "actions", label: "Actions & autonomy" },
  { id: "escalation", label: "Human escalation rules" },
  { id: "logging", label: "Logging & eval expectations" },
] as const;

type GuardrailTabId = (typeof GUARDRAIL_TABS)[number]["id"];

const DEFAULT_ESCALATION_RULES: EscalationRule[] = [
  {
    id: "self_harm",
    category: "self_harm",
    label: "Self-harm or suicide risk",
    description:
      "If a student expresses self-harm or suicidal ideation, the agent must pause and route to a human immediately.",
    enabled: true,
    actions: ["pause_agent", "assign_to_human", "notify_team"],
    templateMessage:
      "Because of what you shared, I'm connecting you with a person who can support you right away.",
  },
  {
    id: "threat_to_others",
    category: "threat_to_others",
    label: "Threats of violence or harm to others",
    description:
      "Any credible threat to others should trigger an immediate handoff to campus safety or designated responders.",
    enabled: true,
    actions: ["pause_agent", "assign_to_human", "notify_team"],
  },
  {
    id: "harassment",
    category: "harassment",
    label: "Harassment or Title IX-related content",
    description:
      "Reports of harassment, discrimination, or sexual misconduct must route to the appropriate Title IX or HR contact.",
    enabled: true,
    actions: ["pause_agent", "assign_to_human"],
  },
  {
    id: "mental_health_distress",
    category: "mental_health_distress",
    label: "Acute mental health distress",
    description:
      "When a student sounds overwhelmed, panicked, or in emotional crisis, the agent should escalate instead of giving advice.",
    enabled: true,
    actions: ["pause_agent", "assign_to_human"],
  },
  {
    id: "financial_crisis",
    category: "financial_crisis",
    label: "Severe financial or housing insecurity",
    description:
      "Escalate to a person for complex financial aid or emergency support situations.",
    enabled: true,
    actions: ["assign_to_human"],
  },
  {
    id: "academic_risk",
    category: "academic_risk",
    label: "Serious academic risk",
    description:
      "Route to a human advisor when the student indicates they may fail, withdraw, or lose status.",
    enabled: false,
    actions: ["assign_to_human"],
  },
];

export function GuardrailsPageClient() {
  const [config, setConfig] = React.useState<GuardrailsConfig | null>(null);
  const [initialConfig, setInitialConfig] = React.useState<GuardrailsConfig | null>(null);
  const [initialEscalationRules, setInitialEscalationRules] = React.useState<EscalationRule[]>(DEFAULT_ESCALATION_RULES);
  const [escalationRules, setEscalationRules] = React.useState<EscalationRule[]>(DEFAULT_ESCALATION_RULES);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saveStatus, setSaveStatus] = React.useState<'saved' | 'unsaved' | 'error'>('saved');
  const [activeTab, setActiveTab] = React.useState<GuardrailTabId>("summary");

  // Edit mode is always enabled
  const canEdit = true;

  // Load config on mount
  React.useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/guardrails');
      if (!response.ok) {
        throw new Error('Failed to load guardrails');
      }
      const data = await response.json();
      setConfig(data.config);
      setInitialConfig(JSON.parse(JSON.stringify(data.config))); // Deep clone
      setInitialEscalationRules(JSON.parse(JSON.stringify(DEFAULT_ESCALATION_RULES))); // Deep clone
      setEscalationRules(JSON.parse(JSON.stringify(DEFAULT_ESCALATION_RULES))); // Deep clone
      setSaveStatus('saved');
    } catch (err) {
      console.error('Error loading guardrails:', err);
      setError(err instanceof Error ? err.message : 'Failed to load guardrails');
    } finally {
      setLoading(false);
    }
  }

  // Check if config is dirty (including escalation rules)
  React.useEffect(() => {
    if (!config || !initialConfig) return;
    
    const configDirty = JSON.stringify(config) !== JSON.stringify(initialConfig);
    const escalationDirty = JSON.stringify(escalationRules) !== JSON.stringify(initialEscalationRules);
    const isDirty = configDirty || escalationDirty;
    
    if (isDirty && saveStatus === 'saved') {
      setSaveStatus('unsaved');
    } else if (!isDirty && saveStatus === 'unsaved') {
      setSaveStatus('saved');
    }
  }, [config, initialConfig, escalationRules, initialEscalationRules, saveStatus]);

  async function handleSave() {
    if (!config) return;

    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/guardrails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save guardrails');
      }

      const data = await response.json();
      setConfig(data.config);
      setInitialConfig(JSON.parse(JSON.stringify(data.config))); // Deep clone
      setInitialEscalationRules(JSON.parse(JSON.stringify(escalationRules))); // Deep clone
      setSaveStatus('saved');
      
      // Show success toast (simple alert for now)
      // TODO: Replace with proper toast component
      alert('Guardrails saved successfully');
    } catch (err) {
      console.error('Error saving guardrails:', err);
      setError(err instanceof Error ? err.message : 'Failed to save guardrails');
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    if (!initialConfig) return;
    setConfig(JSON.parse(JSON.stringify(initialConfig))); // Deep clone
    setEscalationRules(JSON.parse(JSON.stringify(initialEscalationRules))); // Deep clone
    setSaveStatus('saved');
    setError(null);
  }

  function updateConfig(updater: (prev: GuardrailsConfig) => GuardrailsConfig) {
    if (!config) return;
    setConfig(updater(config));
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="p-6 text-center text-gray-600">Loading guardrails configuration...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="space-y-6">
        <div className="p-6 text-center text-red-600">
          {error || 'Failed to load guardrails configuration'}
          <Button onClick={loadConfig} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Guardrails
            </h1>
            <p className="text-sm text-gray-600">
              Define global safety, fairness, and communication guardrails for all AI assistants and agents.
              Do-Not-Engage rules and permissions are managed in their own sections; this page focuses on
              how agents behave when they are allowed to act.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            Admin only
          </span>
        </div>
      </header>

      {/* Save status bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <>
              <FontAwesomeIcon icon="fa-solid fa-check-circle" className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-700">All changes saved</span>
            </>
          )}
          {saveStatus === 'unsaved' && (
            <>
              <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-gray-700">Unsaved changes</span>
            </>
          )}
          {saveStatus === 'error' && error && (
            <>
              <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleDiscard}
            disabled={saveStatus === 'saved' || saving}
            className="text-sm"
          >
            Discard changes
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveStatus === 'saved' || saving}
            className="text-sm"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>

      {/* Two-column layout with vertical tabs */}
      <div className="grid gap-4 md:grid-cols-[220px,1fr]">
        {/* Left: vertical tabs */}
        <nav className="space-y-1 rounded-xl border border-gray-100 bg-white p-2 text-sm">
          {GUARDRAIL_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors",
                activeTab === tab.id
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Right: tab content */}
        <section className="space-y-4">
          {activeTab === "summary" && config && (
            <SummarySection config={config} />
          )}

          {activeTab === "fairness" && config && (
            <FairnessDEISection
              config={config.fairness}
              onChange={(fairness) => updateConfig((prev) => ({ ...prev, fairness }))}
              canEdit={canEdit}
            />
          )}

          {activeTab === "privacy" && config && (
            <PrivacyDataSection
              config={config.privacy}
              onChange={(privacy) => updateConfig((prev) => ({ ...prev, privacy }))}
              canEdit={canEdit}
            />
          )}

          {activeTab === "engagement" && config && (
            <EngagementSection
              config={config.engagement}
              onChange={(engagement) => updateConfig((prev) => ({ ...prev, engagement }))}
              canEdit={canEdit}
            />
          )}

          {activeTab === "actions" && config && (
            <ActionsSection
              config={config.actions}
              onChange={(actions) => updateConfig((prev) => ({ ...prev, actions }))}
              canEdit={canEdit}
            />
          )}

          {activeTab === "escalation" && (
            <HumanEscalationSection
              rules={escalationRules}
              onChange={setEscalationRules}
              canEdit={canEdit}
            />
          )}

          {activeTab === "logging" && config && (
            <LoggingSection
              config={config.actions}
              onChange={(actions) => updateConfig((prev) => ({ ...prev, actions }))}
              canEdit={canEdit}
            />
          )}
        </section>
      </div>
    </div>
  );
}

