'use client';

import * as React from 'react';
import { GuardrailsConfig } from '@/lib/guardrails/types';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface SummarySectionProps {
  config: GuardrailsConfig;
}

export function SummarySection({ config }: SummarySectionProps) {
  const fairnessEnabled = config.fairness.fairnessEvalsEnabled;
  const quietHoursEnabled = config.engagement.quietHours.enabled;
  const autoActionsCount = config.actions.rules.filter(r => r.mode === 'auto').length;
  const blockedActionsCount = config.actions.rules.filter(r => r.mode === 'blocked').length;
  const humanReviewActionsCount = config.actions.rules.filter(r => r.mode === 'human_review').length;

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-gray-900">Guardrails Summary</h2>
        <p className="text-xs text-gray-600">
          Overview of your current guardrails configuration.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Fairness & DEI */}
        <div className="rounded-lg border border-gray-100 bg-white p-3 space-y-2">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon="fa-solid fa-shield-halved" className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-semibold text-gray-900">Fairness & DEI</h3>
          </div>
          <ul className="text-[11px] text-gray-600 space-y-1">
            <li>• {config.fairness.protectedAttributes.length} protected attributes</li>
            <li>• {config.fairness.languageGuidelines.avoidFraming.length} discouraged phrases</li>
            <li>• {config.fairness.languageGuidelines.preferredFraming.length} preferred phrases</li>
            <li>• Fairness evals: {fairnessEnabled ? 'Enabled' : 'Disabled'}</li>
          </ul>
        </div>

        {/* Privacy & Data */}
        <div className="rounded-lg border border-gray-100 bg-white p-3 space-y-2">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon="fa-solid fa-lock" className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-semibold text-gray-900">Privacy & Data</h3>
          </div>
          <ul className="text-[11px] text-gray-600 space-y-1">
            <li>• {config.privacy.allowedDomains.length} data domains allowed</li>
            <li>• {config.privacy.sensitiveDomainsExcluded.length} sensitive domains excluded</li>
            <li>• Email: {config.privacy.emailPolicy}</li>
            <li>• SMS: {config.privacy.smsPolicy}</li>
          </ul>
        </div>

        {/* Engagement */}
        <div className="rounded-lg border border-gray-100 bg-white p-3 space-y-2">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon="fa-solid fa-clock" className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-semibold text-gray-900">Engagement</h3>
          </div>
          <ul className="text-[11px] text-gray-600 space-y-1">
            <li>• Quiet hours: {quietHoursEnabled ? 'Enabled' : 'Disabled'}</li>
            <li>• {config.engagement.seasonalQuietPeriods.length} seasonal quiet periods</li>
            <li>• {config.engagement.holidayRules.length} holiday rules</li>
            <li>• Max {config.engagement.frequencyCaps.globalMaxMessagesPerDay} messages/day per person</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="rounded-lg border border-gray-100 bg-white p-3 space-y-2">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon="fa-solid fa-bolt" className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-semibold text-gray-900">Actions</h3>
          </div>
          <ul className="text-[11px] text-gray-600 space-y-1">
            <li>• {autoActionsCount} actions set to Auto (Safe Mode)</li>
            <li>• {humanReviewActionsCount} actions require human review</li>
            <li>• {blockedActionsCount} actions blocked</li>
            <li>• Logging: {config.actions.loggingRequired ? 'Required' : 'Optional'}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

