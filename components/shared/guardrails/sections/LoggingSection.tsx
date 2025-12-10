'use client';

import * as React from 'react';
import { ActionsConfig } from '@/lib/guardrails/types';

interface LoggingSectionProps {
  config: ActionsConfig;
  onChange: (config: ActionsConfig) => void;
  canEdit: boolean;
}

export function LoggingSection({ config, onChange, canEdit }: LoggingSectionProps) {
  return (
    <section className="space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-gray-900">
          Logging & eval expectations
        </h2>
        <p className="text-xs text-gray-600">
          Configure what agent actions should be logged and when evaluations are required.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.loggingRequired}
              onChange={(e) => onChange({ ...config, loggingRequired: e.target.checked })}
              disabled={!canEdit}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-[11px] text-gray-700">
              Log all agent actions with who, when, and why
            </span>
          </label>
          <p className="text-[11px] text-gray-500 ml-6">
            All agent actions should be logged with who, when, and why for audit and compliance purposes.
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.requireEvalBeforeAuto}
              onChange={(e) => onChange({ ...config, requireEvalBeforeAuto: e.target.checked })}
              disabled={!canEdit}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-[11px] text-gray-700">
              Require eval/fairness checks before agents can act automatically
            </span>
          </label>
          <p className="text-[11px] text-gray-500 ml-6">
            Agents should pass safety/fairness evals before auto-actions are enabled. This helps ensure
            consistent behavior across protected groups and flag disparities.
          </p>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <p className="text-[11px] text-gray-500">
            Human review is recommended for any action that could materially affect a student&apos;s standing or finances.
          </p>
        </div>
      </div>
    </section>
  );
}




