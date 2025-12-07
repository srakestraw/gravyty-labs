'use client';

import * as React from 'react';
import { PersonalityConfig } from '@/lib/communication/types';

interface PersonalitySectionProps {
  config: PersonalityConfig;
  onChange: (config: PersonalityConfig) => void;
  canEdit: boolean;
}

const ARCHETYPES = [
  { value: 'mentor', label: 'Mentor' },
  { value: 'peer', label: 'Peer' },
  { value: 'guide', label: 'Guide' },
  { value: 'administrator', label: 'Administrator' },
  { value: 'professional', label: 'Professional' },
  { value: 'counselor', label: 'Counselor' },
] as const;

const EMPATHY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;

const ENTHUSIASM_OPTIONS = [
  { value: 'reserved', label: 'Reserved' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'cheerful', label: 'Cheerful' },
] as const;

export function PersonalitySection({ config, onChange, canEdit }: PersonalitySectionProps) {
  function updateField<K extends keyof PersonalityConfig>(key: K, value: PersonalityConfig[K]) {
    onChange({
      ...config,
      [key]: value,
    });
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-gray-900">
            Assistant Personality
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Set default assistant personality traits that individual agents can inherit or refine.
          </p>
        </div>
      </div>

      {/* Archetype */}
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-gray-700">
          Archetype
        </label>
        {canEdit ? (
          <select
            value={config.archetype}
            onChange={(e) => updateField('archetype', e.target.value as PersonalityConfig['archetype'])}
            className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-900"
          >
            {ARCHETYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-[11px] text-gray-600">
            {ARCHETYPES.find(opt => opt.value === config.archetype)?.label || config.archetype}
          </p>
        )}
        <p className="text-[10px] text-gray-500">
          The fundamental role the assistant takes when communicating.
        </p>
      </div>

      {/* Empathy */}
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-gray-700">
          Empathy Level
        </label>
        {canEdit ? (
          <div className="flex gap-2">
            {EMPATHY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateField('empathy', opt.value)}
                className={`
                  flex-1 rounded border px-3 py-1.5 text-[11px] font-medium transition-colors
                  ${config.empathy === opt.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-gray-600">
            {EMPATHY_OPTIONS.find(opt => opt.value === config.empathy)?.label || config.empathy}
          </p>
        )}
      </div>

      {/* Enthusiasm */}
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-gray-700">
          Enthusiasm Level
        </label>
        {canEdit ? (
          <div className="flex gap-2">
            {ENTHUSIASM_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateField('enthusiasm', opt.value)}
                className={`
                  flex-1 rounded border px-3 py-1.5 text-[11px] font-medium transition-colors
                  ${config.enthusiasm === opt.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-gray-600">
            {ENTHUSIASM_OPTIONS.find(opt => opt.value === config.enthusiasm)?.label || config.enthusiasm}
          </p>
        )}
      </div>

      {/* Style Preferences */}
      <div className="space-y-3 border-t border-gray-100 pt-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
          Communication Style
        </p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.humorAllowed}
              onChange={(e) => updateField('humorAllowed', e.target.checked)}
              disabled={!canEdit}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
            />
            <span className="text-[11px] text-gray-700">Allow humor in messages</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.figurativeLanguage}
              onChange={(e) => updateField('figurativeLanguage', e.target.checked)}
              disabled={!canEdit}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
            />
            <span className="text-[11px] text-gray-700">Allow figurative language (metaphors, analogies)</span>
          </label>
        </div>
      </div>
    </section>
  );
}

