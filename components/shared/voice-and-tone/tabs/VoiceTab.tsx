'use client';

import * as React from 'react';
import { VoiceProfile } from '@/lib/communication/types';
import { Input } from '@/components/ui/input';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface VoiceTabProps {
  profile: VoiceProfile;
  onUpdate: (updater: (p: VoiceProfile) => VoiceProfile) => void;
}

const SLIDER_LABELS = {
  formality: { low: 'Casual', high: 'Formal' },
  warmth: { low: 'Neutral', high: 'Warm' },
  directness: { low: 'Indirect', high: 'Direct' },
  energy: { low: 'Calm', high: 'Energetic' },
  detailLevel: { low: 'Concise', high: 'Detailed' },
  riskPosture: { low: 'Conservative', high: 'Bold' },
} as const;

export function VoiceTab({ profile, onUpdate }: VoiceTabProps) {
  const [newMissionValue, setNewMissionValue] = React.useState('');
  const [newPillar, setNewPillar] = React.useState('');

  function addMissionValue(value: string) {
    if (!value.trim() || profile.missionValues.includes(value.trim())) return;
    onUpdate(p => ({
      ...p,
      missionValues: [...p.missionValues, value.trim()],
    }));
    setNewMissionValue('');
  }

  function removeMissionValue(value: string) {
    onUpdate(p => ({
      ...p,
      missionValues: p.missionValues.filter(v => v !== value),
    }));
  }

  function addPillar(pillar: string) {
    if (!pillar.trim() || profile.communicationPillars.includes(pillar.trim())) return;
    onUpdate(p => ({
      ...p,
      communicationPillars: [...p.communicationPillars, pillar.trim()],
    }));
    setNewPillar('');
  }

  function removePillar(pillar: string) {
    onUpdate(p => ({
      ...p,
      communicationPillars: p.communicationPillars.filter(p => p !== pillar),
    }));
  }

  function updateCharacteristic(key: keyof VoiceProfile['characteristics'], value: number) {
    onUpdate(p => ({
      ...p,
      characteristics: {
        ...p.characteristics,
        [key]: value,
      },
    }));
  }

  function updateStylePreference(key: keyof VoiceProfile['stylePreferences'], value: boolean) {
    onUpdate(p => ({
      ...p,
      stylePreferences: {
        ...p.stylePreferences,
        [key]: value,
      },
    }));
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Voice Settings</h2>
        <p className="text-xs text-gray-600">
          These settings define how this profile sounds. Assignment Rules decide where it is used.
        </p>
      </div>

      {/* Mission Values */}
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
          Mission Values
        </p>
        <div className="flex flex-wrap gap-1">
          {profile.missionValues.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700 border border-gray-200"
            >
              {value}
              <button
                type="button"
                onClick={() => removeMissionValue(value)}
                className="ml-1 text-gray-400 hover:text-red-600"
              >
                <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
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
      </div>

      {/* Communication Pillars */}
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
          Communication Pillars
        </p>
        <div className="flex flex-wrap gap-1">
          {profile.communicationPillars.map((pillar) => (
            <span
              key={pillar}
              className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700 border border-gray-200"
            >
              {pillar}
              <button
                type="button"
                onClick={() => removePillar(pillar)}
                className="ml-1 text-gray-400 hover:text-red-600"
              >
                <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
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
      </div>

      {/* Sliders */}
      <div className="space-y-4 border-t border-gray-100 pt-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
          Voice Characteristics
        </p>
        {Object.entries(profile.characteristics).map(([key, value]) => {
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
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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
              checked={profile.stylePreferences.allowEmojis}
              onChange={(e) => updateStylePreference('allowEmojis', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-[11px] text-gray-700">Allow emojis in messages</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.stylePreferences.allowContractions}
              onChange={(e) => updateStylePreference('allowContractions', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-[11px] text-gray-700">Allow contractions (e.g., "don't", "can't")</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.stylePreferences.useFirstPerson}
              onChange={(e) => updateStylePreference('useFirstPerson', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-[11px] text-gray-700">Use first person ("I", "we")</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.stylePreferences.allowLightHumor}
              onChange={(e) => updateStylePreference('allowLightHumor', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-[11px] text-gray-700">Allow light humor</span>
          </label>
        </div>
      </div>
    </section>
  );
}



