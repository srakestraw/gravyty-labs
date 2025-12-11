'use client';

import * as React from 'react';
import { VoiceProfile, VoiceProfileId } from '@/lib/communication/types';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BrandVoiceSectionProps {
  profiles: VoiceProfile[];
  selectedProfileId: VoiceProfileId | null;
  onSelectProfile: (profileId: VoiceProfileId) => void;
  onUpdateProfile: (profileId: VoiceProfileId, updater: (profile: VoiceProfile) => VoiceProfile) => void;
  onSetDefault: (profileId: VoiceProfileId) => void;
  onCreateProfile: (name: string, description: string, startFromProfileId: VoiceProfileId | null) => void;
  canEdit: boolean;
}

const SLIDER_LABELS = {
  formality: { low: 'Casual', high: 'Formal' },
  warmth: { low: 'Neutral', high: 'Warm' },
  directness: { low: 'Indirect', high: 'Direct' },
  energy: { low: 'Calm', high: 'Energetic' },
  detailLevel: { low: 'Concise', high: 'Detailed' },
  riskPosture: { low: 'Conservative', high: 'Bold' },
} as const;

export function BrandVoiceSection({
  profiles,
  selectedProfileId,
  onSelectProfile,
  onUpdateProfile,
  onSetDefault,
  onCreateProfile,
  canEdit,
}: BrandVoiceSectionProps) {
  const [newMissionValue, setNewMissionValue] = React.useState('');
  const [newPillar, setNewPillar] = React.useState('');
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [newProfileName, setNewProfileName] = React.useState('');
  const [newProfileDescription, setNewProfileDescription] = React.useState('');
  const [startFromProfileId, setStartFromProfileId] = React.useState<VoiceProfileId | null>(null);

  const selectedProfile = profiles.find(p => p.id === selectedProfileId) || profiles.find(p => p.isDefault) || profiles[0];

  if (!selectedProfile) {
    return (
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-600">No voice profiles available. Please create one.</p>
      </section>
    );
  }

  function addMissionValue(value: string) {
    if (!value.trim() || selectedProfile.missionValues.includes(value.trim())) return;
    onUpdateProfile(selectedProfile.id, (profile) => ({
      ...profile,
      missionValues: [...profile.missionValues, value.trim()],
    }));
    setNewMissionValue('');
  }

  function removeMissionValue(value: string) {
    onUpdateProfile(selectedProfile.id, (profile) => ({
      ...profile,
      missionValues: profile.missionValues.filter(v => v !== value),
    }));
  }

  function addPillar(pillar: string) {
    if (!pillar.trim() || selectedProfile.communicationPillars.includes(pillar.trim())) return;
    onUpdateProfile(selectedProfile.id, (profile) => ({
      ...profile,
      communicationPillars: [...profile.communicationPillars, pillar.trim()],
    }));
    setNewPillar('');
  }

  function removePillar(pillar: string) {
    onUpdateProfile(selectedProfile.id, (profile) => ({
      ...profile,
      communicationPillars: profile.communicationPillars.filter(p => p !== pillar),
    }));
  }

  function updateCharacteristic(key: keyof VoiceProfile['characteristics'], value: number) {
    onUpdateProfile(selectedProfile.id, (profile) => ({
      ...profile,
      characteristics: {
        ...profile.characteristics,
        [key]: value,
      },
    }));
  }

  function updateStylePreference(key: keyof VoiceProfile['stylePreferences'], value: boolean) {
    onUpdateProfile(selectedProfile.id, (profile) => ({
      ...profile,
      stylePreferences: {
        ...profile.stylePreferences,
        [key]: value,
      },
    }));
  }

  function handleCreateProfile() {
    if (!newProfileName.trim()) return;
    onCreateProfile(newProfileName.trim(), newProfileDescription.trim(), startFromProfileId);
    setShowCreateModal(false);
    setNewProfileName('');
    setNewProfileDescription('');
    setStartFromProfileId(null);
  }

  const defaultProfile = profiles.find(p => p.isDefault);

  return (
    <>
      <div className="space-y-4">
        {/* SECTION 1: Voice Profiles */}
        <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-900">
                Voice Profiles
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Manage voice profiles for different contexts. Select a profile to edit its settings below.
              </p>
            </div>
          </div>

          {/* Profile Selector Card */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <label className="text-[11px] font-medium text-gray-700 whitespace-nowrap">
                  Voice profile:
                </label>
                <div className="flex-1">
                  <select
                    value={selectedProfile.id}
                    onChange={(e) => {
                      if (e.target.value === '__create__') {
                        const defaultProfile = profiles.find(p => p.isDefault) || profiles[0];
                        setStartFromProfileId(defaultProfile?.id || null);
                        setShowCreateModal(true);
                        // Reset select to current profile
                        setTimeout(() => {
                          e.target.value = selectedProfile.id;
                        }, 0);
                      } else {
                        onSelectProfile(e.target.value);
                      }
                    }}
                    disabled={!canEdit}
                    className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {profiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name}{profile.isDefault ? ' (Default)' : ''}
                      </option>
                    ))}
                    <option disabled>──────────</option>
                    <option value="__create__">+ Create new profile…</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedProfile.isDefault ? (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                    Default
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSetDefault(selectedProfile.id)}
                    disabled={!canEdit}
                    className="text-[11px] h-7"
                  >
                    Set as default
                  </Button>
                )}
              </div>
            </div>

            {/* Helper text */}
            <p className="text-[10px] text-gray-500">
              Each voice profile can be mapped to apps, agents, groups, or users in the Assignment Rules tab.
            </p>
          </div>
        </section>

        {/* SECTION 2: Profile Settings */}
        <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-900">
                Profile Settings: {selectedProfile.name}
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Configure the voice characteristics, style preferences, and communication pillars for this profile.
              </p>
            </div>
          </div>

        {/* Mission Values */}
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Mission Values
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedProfile.missionValues.map((value) => (
              <span
                key={value}
                className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700 border border-gray-200"
              >
                {value}
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => removeMissionValue(value)}
                    className="ml-1 text-gray-400 hover:text-red-600"
                  >
                    <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add mission value..."
                value={newMissionValue}
                onChange={(e) => setNewMissionValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addMissionValue(newMissionValue);
                  }
                }}
                className="h-7 text-[11px]"
              />
              <button
                type="button"
                onClick={() => addMissionValue(newMissionValue)}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Communication Pillars */}
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Communication Pillars
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedProfile.communicationPillars.map((pillar) => (
              <span
                key={pillar}
                className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700 border border-gray-200"
              >
                {pillar}
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => removePillar(pillar)}
                    className="ml-1 text-gray-400 hover:text-red-600"
                  >
                    <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add communication pillar..."
                value={newPillar}
                onChange={(e) => setNewPillar(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPillar(newPillar);
                  }
                }}
                className="h-7 text-[11px]"
              />
              <button
                type="button"
                onClick={() => addPillar(newPillar)}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Sliders */}
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Voice Characteristics
          </p>
          {Object.entries(selectedProfile.characteristics).map(([key, value]) => {
            const sliderKey = key as keyof VoiceProfile['characteristics'];
            const labels = SLIDER_LABELS[sliderKey];
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <span className="text-[11px] text-gray-600">{value}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 w-16 text-right">{labels.low}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => updateCharacteristic(sliderKey, parseInt(e.target.value))}
                    disabled={!canEdit}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-[10px] text-gray-500 w-16">{labels.high}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Style Toggles */}
        <div className="space-y-3 border-t border-gray-100 pt-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Style Preferences
          </p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProfile.stylePreferences.allowEmojis}
                onChange={(e) => updateStylePreference('allowEmojis', e.target.checked)}
                disabled={!canEdit}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
              />
              <span className="text-[11px] text-gray-700">Allow emojis in messages</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProfile.stylePreferences.allowContractions}
                onChange={(e) => updateStylePreference('allowContractions', e.target.checked)}
                disabled={!canEdit}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
              />
              <span className="text-[11px] text-gray-700">Allow contractions (e.g., "don't", "can't")</span>
            </label>
            {selectedProfile.stylePreferences.useFirstPerson !== undefined && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedProfile.stylePreferences.useFirstPerson}
                  onChange={(e) => updateStylePreference('useFirstPerson', e.target.checked)}
                  disabled={!canEdit}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                />
                <span className="text-[11px] text-gray-700">Use first person ("I", "we")</span>
              </label>
            )}
            {selectedProfile.stylePreferences.allowLightHumor !== undefined && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedProfile.stylePreferences.allowLightHumor}
                  onChange={(e) => updateStylePreference('allowLightHumor', e.target.checked)}
                  disabled={!canEdit}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                />
                <span className="text-[11px] text-gray-700">Allow light humor</span>
              </label>
            )}
          </div>
        </div>
        </section>
      </div>

      {/* Create Profile Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Create New Voice Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="e.g., Admissions, Advancement"
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
                  value={newProfileDescription}
                  onChange={(e) => setNewProfileDescription(e.target.value)}
                  placeholder="Brief description of this profile"
                  className="h-8 text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Start from
                </label>
                <select
                  value={startFromProfileId || ''}
                  onChange={(e) => setStartFromProfileId(e.target.value || null)}
                  className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-900"
                >
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}{profile.isDefault ? ' (Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewProfileName('');
                  setNewProfileDescription('');
                  setStartFromProfileId(null);
                }}
                className="text-[11px]"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreateProfile}
                disabled={!newProfileName.trim()}
                className="text-[11px]"
              >
                Create Profile
              </Button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
