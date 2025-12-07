'use client';

import * as React from 'react';
import { PrivacyDataConfig, RoleKey } from '@/lib/guardrails/types';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface PrivacyDataSectionProps {
  config: PrivacyDataConfig;
  onChange: (config: PrivacyDataConfig) => void;
  canEdit: boolean;
}

const ROLE_LABELS: Record<RoleKey, string> = {
  admissions: 'Admissions',
  registrar: 'Registrar',
  student_success: 'Student Success',
  career_services: 'Career Services',
  alumni_engagement: 'Alumni Engagement',
  advancement: 'Advancement',
};

const CHANNEL_POLICY_OPTIONS = [
  { value: 'summary_only', label: 'Summary only' },
  { value: 'no_sensitive', label: 'No sensitive data' },
  { value: 'restricted', label: 'Restricted' },
  { value: 'blocked', label: 'Blocked' },
];

export function PrivacyDataSection({ config, onChange, canEdit }: PrivacyDataSectionProps) {
  const [newSensitiveDomain, setNewSensitiveDomain] = React.useState('');

  function addSensitiveDomain(domain: string) {
    if (!domain.trim() || config.sensitiveDomainsExcluded.includes(domain.trim())) return;
    onChange({
      ...config,
      sensitiveDomainsExcluded: [...config.sensitiveDomainsExcluded, domain.trim()],
    });
    setNewSensitiveDomain('');
  }

  function removeSensitiveDomain(domain: string) {
    onChange({
      ...config,
      sensitiveDomainsExcluded: config.sensitiveDomainsExcluded.filter(d => d !== domain),
    });
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-gray-900">
            Privacy & data scope
          </h2>
          <p className="text-xs text-gray-600">
            Control which data domains agents can use and how much detail they can include per channel.
            These guardrails help align with FERPA and institutional policies.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Data domains */}
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Data domains (read-only)
          </p>
          <div className="flex flex-wrap gap-1">
            {config.allowedDomains.map((domain) => (
              <span
                key={domain}
                className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700 border border-gray-200"
              >
                {ROLE_LABELS[domain]}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-gray-500">
            Domains are managed centrally; guardrails control <em>how</em> they&apos;re used, not what exists.
          </p>
        </div>

        {/* Sensitive domains exclusion */}
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Sensitive domains exclusion
          </p>
          <div className="flex flex-wrap gap-1">
            {config.sensitiveDomainsExcluded.map((domain) => (
              <span
                key={domain}
                className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] text-red-700 border border-red-200"
              >
                {domain.replace(/_/g, ' ')}
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => removeSensitiveDomain(domain)}
                    className="ml-1 text-red-400 hover:text-red-600"
                  >
                    <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
          {canEdit && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="e.g., counseling_notes"
                value={newSensitiveDomain}
                onChange={(e) => setNewSensitiveDomain(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSensitiveDomain(newSensitiveDomain);
                  }
                }}
                className="flex-1 rounded border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-900"
              />
              <button
                type="button"
                onClick={() => addSensitiveDomain(newSensitiveDomain)}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Channel guidelines */}
      <div className="border-t border-gray-100 pt-3 space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
          Channel content guidelines
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {(['email', 'sms', 'phone'] as const).map((channel) => {
            const policyKey = `${channel}Policy` as keyof PrivacyDataConfig;
            const currentPolicy = config[policyKey] as string;
            return (
              <div key={channel} className="space-y-1">
                <label className="block text-[11px] font-medium text-gray-700 capitalize">
                  {channel === 'phone' ? 'Phone / Robocall' : channel.toUpperCase()}
                </label>
                {canEdit ? (
                  <select
                    value={currentPolicy}
                    onChange={(e) => {
                      onChange({
                        ...config,
                        [policyKey]: e.target.value,
                      });
                    }}
                    className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-900"
                  >
                    {CHANNEL_POLICY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[11px] text-gray-600">
                    {CHANNEL_POLICY_OPTIONS.find(opt => opt.value === currentPolicy)?.label || currentPolicy}
                  </p>
                )}
                {channel === 'sms' || channel === 'phone' ? (
                  <p className="text-[10px] text-gray-500">
                    No academic standing decisions, grades, or financial aid amounts.
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-gray-500">
          Agents should never surface mental health notes, confidential documents, or conduct history in their responses.
        </p>
      </div>
    </section>
  );
}

