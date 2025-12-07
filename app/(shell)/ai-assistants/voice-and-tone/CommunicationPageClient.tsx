'use client';

import * as React from 'react';
import { CommunicationConfig } from '@/lib/communication/types';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';
import { BrandVoiceSection } from './sections/BrandVoiceSection';
import { PersonalitySection } from './sections/PersonalitySection';
import { ToneRulesSection } from './sections/ToneRulesSection';
import { PreviewSection } from './sections/PreviewSection';

const COMMUNICATION_TABS = [
  { id: "brand", label: "Brand Voice" },
  { id: "personality", label: "Personality" },
  { id: "tone", label: "Tone Rules" },
  { id: "preview", label: "Preview" },
] as const;

type CommunicationTabId = (typeof COMMUNICATION_TABS)[number]["id"];

export function CommunicationPageClient() {
  const [config, setConfig] = React.useState<CommunicationConfig | null>(null);
  const [initialConfig, setInitialConfig] = React.useState<CommunicationConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saveStatus, setSaveStatus] = React.useState<'saved' | 'unsaved' | 'error'>('saved');
  const [activeTab, setActiveTab] = React.useState<CommunicationTabId>("brand");
  const saveBarRef = React.useRef<HTMLDivElement>(null);
  const [navTopOffset, setNavTopOffset] = React.useState(80);

  // Edit mode is always enabled
  const canEdit = true;

  // Load config on mount
  React.useEffect(() => {
    loadConfig();
  }, []);

  // Calculate nav top offset based on save bar height
  React.useEffect(() => {
    if (saveBarRef.current) {
      const saveBarHeight = saveBarRef.current.offsetHeight;
      // Add some spacing (16px = 1rem)
      setNavTopOffset(saveBarHeight + 16);
    }
  }, []);

  async function loadConfig() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/communication-config');
      if (!response.ok) {
        throw new Error('Failed to load Voice & Tone config');
      }
      const data = await response.json();
      setConfig(data.config);
      setInitialConfig(JSON.parse(JSON.stringify(data.config))); // Deep clone
      setSaveStatus('saved');
    } catch (err) {
      console.error('Error loading communication config:', err);
      setError(err instanceof Error ? err.message : 'Failed to load Voice & Tone config');
    } finally {
      setLoading(false);
    }
  }

  // Check if config is dirty
  React.useEffect(() => {
    if (!config || !initialConfig) return;
    
    const isDirty = JSON.stringify(config) !== JSON.stringify(initialConfig);
    
    if (isDirty && saveStatus === 'saved') {
      setSaveStatus('unsaved');
    } else if (!isDirty && saveStatus === 'unsaved') {
      setSaveStatus('saved');
    }
  }, [config, initialConfig, saveStatus]);

  async function handleSave() {
    if (!config) return;

    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/communication-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save Voice & Tone config');
      }

      const data = await response.json();
      setConfig(data.config);
      setInitialConfig(JSON.parse(JSON.stringify(data.config))); // Deep clone
      setSaveStatus('saved');
      
      // Show success toast (simple alert for now)
      // TODO: Replace with proper toast component
      alert('Voice & Tone settings saved successfully');
    } catch (err) {
      console.error('Error saving communication config:', err);
      setError(err instanceof Error ? err.message : 'Failed to save Voice & Tone config');
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    if (!initialConfig) return;
    setConfig(JSON.parse(JSON.stringify(initialConfig))); // Deep clone
    setSaveStatus('saved');
    setError(null);
  }

  function updateConfig(updater: (prev: CommunicationConfig) => CommunicationConfig) {
    if (!config) return;
    setConfig(updater(config));
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="p-6 text-center text-gray-600">Loading Voice & Tone configuration...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="space-y-6">
        <div className="p-6 text-center text-red-600">
          {error || 'Failed to load Voice & Tone configuration'}
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
              Voice & Tone
            </h1>
            <p className="text-sm text-gray-600">
              Define how your AI assistants speak—aligning brand voice, assistant personality, and tone for different scenarios.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            Admin only
          </span>
        </div>
      </header>

      {/* Save status bar */}
      <div ref={saveBarRef} className="sticky top-0 z-10 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
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
        <nav 
          className="sticky self-start z-20 max-h-[calc(100vh-6rem)] overflow-y-auto space-y-1 rounded-xl border border-gray-100 bg-white p-2 text-sm"
          style={{ top: `${navTopOffset}px` }}
        >
          {COMMUNICATION_TABS.map((tab) => (
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
          {activeTab === "brand" && config && (
            <BrandVoiceSection
              config={config.brand}
              onChange={(brand) => updateConfig((prev) => ({ ...prev, brand }))}
              canEdit={canEdit}
            />
          )}

          {activeTab === "personality" && config && (
            <PersonalitySection
              config={config.personality}
              onChange={(personality) => updateConfig((prev) => ({ ...prev, personality }))}
              canEdit={canEdit}
            />
          )}

          {activeTab === "tone" && config && (
            <ToneRulesSection
              rules={config.toneRules}
              onChange={(toneRules) => updateConfig((prev) => ({ ...prev, toneRules }))}
              canEdit={canEdit}
            />
          )}

          {activeTab === "preview" && config && (
            <PreviewSection config={config} />
          )}
        </section>
      </div>
    </div>
  );
}

