'use client';

import * as React from 'react';
import { FairnessDEIConfig } from '@/lib/guardrails/types';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';

interface FairnessDEISectionProps {
  config: FairnessDEIConfig;
  onChange: (config: FairnessDEIConfig) => void;
  canEdit: boolean;
}

const COMMON_ATTRIBUTES = [
  'race',
  'ethnicity',
  'gender_identity',
  'sexual_orientation',
  'religion',
  'national_origin',
  'disability_status',
  'age',
  'veteran_status',
  'first_generation_status',
  'low_income',
];

export function FairnessDEISection({ config, onChange, canEdit }: FairnessDEISectionProps) {
  const [newAttribute, setNewAttribute] = React.useState('');

  function addAttribute(attr: string) {
    if (!attr.trim() || config.protectedAttributes.includes(attr.trim())) return;
    onChange({
      ...config,
      protectedAttributes: [...config.protectedAttributes, attr.trim()],
    });
    setNewAttribute('');
  }

  function removeAttribute(attr: string) {
    onChange({
      ...config,
      protectedAttributes: config.protectedAttributes.filter(a => a !== attr),
    });
  }

  function addCustomAttribute() {
    addAttribute(newAttribute);
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-gray-900">
            Fairness & DEI
          </h2>
          <p className="text-xs text-gray-600">
            Prevent agents from using protected attributes to prioritize, exclude, or treat people differently.
            Focus decisions on behavior and engagement signals, not identity.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Protected attributes */}
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Protected attributes
          </p>
          <div className="flex flex-wrap gap-1">
            {config.protectedAttributes.map((attr) => (
              <span
                key={attr}
                className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700 border border-gray-200"
              >
                {attr.replace(/_/g, ' ')}
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => removeAttribute(attr)}
                    className="ml-1 text-gray-400 hover:text-red-600"
                  >
                    <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>

          {canEdit && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {COMMON_ATTRIBUTES
                  .filter(attr => !config.protectedAttributes.includes(attr))
                  .map((attr) => (
                    <button
                      key={attr}
                      type="button"
                      onClick={() => addAttribute(attr)}
                      className="inline-flex items-center rounded-full border border-gray-300 bg-white px-2 py-0.5 text-[11px] text-gray-600 hover:bg-gray-50"
                    >
                      + {attr.replace(/_/g, ' ')}
                    </button>
                  ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Custom attribute..."
                  value={newAttribute}
                  onChange={(e) => setNewAttribute(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomAttribute();
                    }
                  }}
                  className="h-7 text-[11px]"
                />
                <button
                  type="button"
                  onClick={addCustomAttribute}
                  className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <p className="mt-2 text-[11px] text-gray-500">
            Agents must not segment, prioritize, or exclude based on these attributes, unless explicitly
            configured for approved support programs (for example, first-gen support).
          </p>
        </div>

        {/* Language & bias guidance */}
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Language & bias guidance
          </p>
          
          {canEdit ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Discouraged phrasing
                </label>
                <textarea
                  value={config.languageGuidelines.avoidFraming.join('\n')}
                  onChange={(e) => {
                    const phrases = e.target.value.split('\n').filter(p => p.trim());
                    onChange({
                      ...config,
                      languageGuidelines: {
                        ...config.languageGuidelines,
                        avoidFraming: phrases,
                      },
                    });
                  }}
                  placeholder="low-quality student&#10;bad donor&#10;hopeless case"
                  className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-900"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Preferred phrasing
                </label>
                <textarea
                  value={config.languageGuidelines.preferredFraming.join('\n')}
                  onChange={(e) => {
                    const phrases = e.target.value.split('\n').filter(p => p.trim());
                    onChange({
                      ...config,
                      languageGuidelines: {
                        ...config.languageGuidelines,
                        preferredFraming: phrases,
                      },
                    });
                  }}
                  placeholder="students with fewer supports&#10;under-resourced students"
                  className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-900"
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <ul className="text-[11px] text-gray-600 space-y-1">
              {config.languageGuidelines.avoidFraming.length > 0 && (
                <li className="font-medium">Avoid:</li>
              )}
              {config.languageGuidelines.avoidFraming.map((phrase, i) => (
                <li key={i}>• {phrase}</li>
              ))}
              {config.languageGuidelines.preferredFraming.length > 0 && (
                <li className="font-medium mt-2">Prefer:</li>
              )}
              {config.languageGuidelines.preferredFraming.map((phrase, i) => (
                <li key={i}>• {phrase}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Attribute usage rule */}
      <div className="border-t border-gray-100 pt-3 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.allowAttributeOverrides}
            onChange={(e) => onChange({ ...config, allowAttributeOverrides: e.target.checked })}
              disabled={!canEdit}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-[11px] text-gray-700">
            Allow explicit, audited exceptions for research or support programs
          </span>
        </label>
        <p className="text-[11px] text-gray-500">
          When enabled, agents can use protected attributes only for explicitly approved programs
          (e.g., first-gen support, veteran services) with proper audit trails.
        </p>
      </div>

      {/* Fairness evals */}
      <div className="border-t border-gray-100 pt-3 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.fairnessEvalsEnabled}
            onChange={(e) => onChange({ ...config, fairnessEvalsEnabled: e.target.checked })}
              disabled={!canEdit}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-[11px] font-medium text-gray-700">
            Run fairness evals on agents that take recruitment or outreach actions
          </span>
        </label>
        <p className="text-[11px] text-gray-500">
          We&apos;ll simulate behavior across protected groups and flag disparities.
        </p>
      </div>
    </section>
  );
}

