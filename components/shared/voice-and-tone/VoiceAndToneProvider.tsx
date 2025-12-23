'use client';

import * as React from 'react';
import { CommunicationConfig, VoiceProfile, VoiceProfileId, AssignmentRule, ToneRule } from '@/lib/communication/types';
import { loadCommunicationConfig, saveCommunicationConfig } from '@/lib/communication/store';
import { convertToneRuleToAssignmentRule } from '@/lib/communication/resolveVoiceProfile';

interface VoiceAndToneContextValue {
  config: CommunicationConfig | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  updateProfiles: (profiles: VoiceProfile[]) => void;
  updateProfile: (profile: VoiceProfile) => void;
  updateAssignmentRules: (rules: AssignmentRule[]) => void;
  updateToneRules?: (rules: ToneRule[]) => void; // Legacy support
  deleteProfile: (profileId: VoiceProfileId) => void;
  save: () => Promise<void>;
  reload: () => Promise<void>;
}

// Migrate config from toneRules to assignmentRules
function migrateConfig(config: CommunicationConfig): CommunicationConfig {
  // If already has assignmentRules, return as-is
  if (config.assignmentRules && config.assignmentRules.length > 0) {
    return config;
  }

  // Migrate toneRules to assignmentRules
  if (config.toneRules && config.toneRules.length > 0) {
    const assignmentRules = config.toneRules.map(convertToneRuleToAssignmentRule);
    return {
      ...config,
      assignmentRules,
      // Keep toneRules for backward compatibility during migration
    };
  }

  // Initialize empty assignmentRules if neither exists
  return {
    ...config,
    assignmentRules: [],
  };
}

const VoiceAndToneContext = React.createContext<VoiceAndToneContextValue | null>(null);

export function VoiceAndToneProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = React.useState<CommunicationConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function loadConfig() {
    try {
      setLoading(true);
      setError(null);
      // TODO: Replace with real API call
      const loaded = await loadCommunicationConfig();
      const migrated = migrateConfig(loaded);
      setConfig(migrated);
    } catch (err) {
      console.error('Error loading communication config:', err);
      setError(err instanceof Error ? err.message : 'Failed to load Voice & Tone config');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadConfig();
  }, []);

  async function save() {
    if (!config) return;
    setSaving(true);
    setError(null);
    try {
      // TODO: Replace with real API call
      const saved = await saveCommunicationConfig(config);
      setConfig(saved);
    } catch (err) {
      console.error('Error saving communication config:', err);
      setError(err instanceof Error ? err.message : 'Failed to save Voice & Tone config');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  function updateProfiles(profiles: VoiceProfile[]) {
    if (!config) return;
    setConfig({ ...config, voiceProfiles: profiles });
  }

  function updateProfile(profile: VoiceProfile) {
    if (!config) return;
    setConfig({
      ...config,
      voiceProfiles: config.voiceProfiles.map(p => p.id === profile.id ? profile : p),
    });
  }

  function updateAssignmentRules(rules: AssignmentRule[]) {
    if (!config) return;
    setConfig({ ...config, assignmentRules: rules });
  }

  function updateToneRules(rules: ToneRule[]) {
    // Legacy support - convert to assignmentRules
    if (!config) return;
    const assignmentRules = rules.map(convertToneRuleToAssignmentRule);
    setConfig({ ...config, assignmentRules, toneRules: rules });
  }

  function deleteProfile(profileId: VoiceProfileId) {
    if (!config) return;
    setConfig({
      ...config,
      voiceProfiles: config.voiceProfiles.filter(p => p.id !== profileId),
      assignmentRules: (config.assignmentRules || []).filter(r => r.profileId !== profileId),
      toneRules: (config.toneRules || []).filter(r => r.profileId !== profileId),
    });
  }

  const value: VoiceAndToneContextValue = {
    config,
    loading,
    saving,
    error,
    updateProfiles,
    updateProfile,
    updateAssignmentRules,
    updateToneRules, // Legacy support
    deleteProfile,
    save,
    reload: loadConfig,
  };

  return (
    <VoiceAndToneContext.Provider value={value}>
      {children}
    </VoiceAndToneContext.Provider>
  );
}

export function useVoiceAndTone() {
  const context = React.useContext(VoiceAndToneContext);
  if (!context) {
    throw new Error('useVoiceAndTone must be used within VoiceAndToneProvider');
  }
  return context;
}







