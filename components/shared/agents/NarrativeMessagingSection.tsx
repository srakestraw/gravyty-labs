"use client";

import * as React from "react";
import { FontAwesomeIcon } from "@/components/ui/font-awesome-icon";
import {
  MOCK_NARRATIVE_PROFILES,
  NARRATIVE_TONE_OPTIONS,
  NARRATIVE_TOPIC_OPTIONS,
  PERSONALIZATION_BOUNDARY_OPTIONS,
  DEFAULT_NARRATIVE_CONFIG,
  type NarrativeProfile,
} from "@/lib/agents/mock-data";
import type { NarrativeMessagingConfig } from "@/lib/agents/types";
import { NarrativeProfileVersionHistoryDrawer } from "@/components/shared/agents/NarrativeProfileVersionHistoryDrawer";
import { cn } from "@/lib/utils";

interface NarrativeMessagingSectionProps {
  value: NarrativeMessagingConfig;
  onChange: (value: NarrativeMessagingConfig) => void;
  readOnly?: boolean;
  /** When true, show validation warning that config is required to activate */
  showValidationWarning?: boolean;
}

export function NarrativeMessagingSection({
  value,
  onChange,
  readOnly = false,
  showValidationWarning = false,
}: NarrativeMessagingSectionProps) {
  const config = { ...DEFAULT_NARRATIVE_CONFIG, ...value };

  const handleChange = <K extends keyof NarrativeMessagingConfig>(
    key: K,
    val: NarrativeMessagingConfig[K]
  ) => {
    if (readOnly) return;
    onChange({ ...config, [key]: val });
  };

  const [versionHistoryOpen, setVersionHistoryOpen] = React.useState(false);
  const isComplete =
    config.profileId &&
    config.tone &&
    config.escalationMessage &&
    config.personalizationBoundaries.length > 0;

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
          Narrative Messaging
        </h2>
        {config.profileId && (
          <button
            type="button"
            onClick={() => setVersionHistoryOpen(true)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            Version History
          </button>
        )}
      </div>
      <NarrativeProfileVersionHistoryDrawer
        profileId={config.profileId || ""}
        open={versionHistoryOpen}
        onClose={() => setVersionHistoryOpen(false)}
      />
      <p className="mb-4 text-xs text-gray-600">
        Configure voice, tone, and content boundaries for this agent&apos;s messaging.
        Required to activate the agent.
      </p>

      {showValidationWarning && !isComplete && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" className="mt-0.5 h-4 w-4 text-amber-600" />
            <div>
              <p className="text-xs font-semibold text-amber-900">
                Narrative Messaging required to activate
              </p>
              <p className="mt-1 text-xs text-amber-800">
                Please select a profile, tone, escalation message, and at least one personalization boundary.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 border-t border-gray-100 pt-4">
        <div>
          <label className="text-xs font-medium text-gray-500">Profile</label>
          {readOnly ? (
            <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
              {MOCK_NARRATIVE_PROFILES.find((p) => p.id === config.profileId)?.name ?? "—"}
            </div>
          ) : (
            <select
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
              value={config.profileId}
              onChange={(e) => handleChange("profileId", e.target.value)}
              required
            >
              <option value="">Select a profile</option>
              {MOCK_NARRATIVE_PROFILES.map((p: NarrativeProfile) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.description}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500">Tone</label>
          {readOnly ? (
            <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
              {config.tone || "—"}
            </div>
          ) : (
            <select
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
              value={config.tone}
              onChange={(e) => handleChange("tone", e.target.value)}
            >
              {NARRATIVE_TONE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500">Allowed topics</label>
          {readOnly ? (
            <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
              {config.allowedTopics.length ? config.allowedTopics.join(", ") : "—"}
            </div>
          ) : (
            <div className="mt-1 flex flex-wrap gap-2">
              {NARRATIVE_TOPIC_OPTIONS.map((topic) => (
                <label
                  key={topic}
                  className={cn(
                    "inline-flex cursor-pointer items-center rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    config.allowedTopics.includes(topic)
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={config.allowedTopics.includes(topic)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...config.allowedTopics, topic]
                        : config.allowedTopics.filter((t) => t !== topic);
                      handleChange("allowedTopics", next);
                    }}
                  />
                  {topic}
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500">Blocked topics</label>
          {readOnly ? (
            <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
              {config.blockedTopics.length ? config.blockedTopics.join(", ") : "—"}
            </div>
          ) : (
            <div className="mt-1 flex flex-wrap gap-2">
              {NARRATIVE_TOPIC_OPTIONS.map((topic) => (
                <label
                  key={topic}
                  className={cn(
                    "inline-flex cursor-pointer items-center rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    config.blockedTopics.includes(topic)
                      ? "border-rose-500 bg-rose-50 text-rose-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={config.blockedTopics.includes(topic)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...config.blockedTopics, topic]
                        : config.blockedTopics.filter((t) => t !== topic);
                      handleChange("blockedTopics", next);
                    }}
                  />
                  {topic}
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500">Escalation message</label>
          {readOnly ? (
            <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
              {config.escalationMessage || "—"}
            </div>
          ) : (
            <textarea
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
              rows={2}
              placeholder="Message shown when escalating to a human..."
              value={config.escalationMessage}
              onChange={(e) => handleChange("escalationMessage", e.target.value)}
              required
            />
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500">Personalization boundaries</label>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Allowed fields for personalization in messages. At least one required.
          </p>
          {readOnly ? (
            <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
              {config.personalizationBoundaries.length
                ? config.personalizationBoundaries.join(", ")
                : "—"}
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              {PERSONALIZATION_BOUNDARY_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                    checked={config.personalizationBoundaries.includes(opt)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...config.personalizationBoundaries, opt]
                        : config.personalizationBoundaries.filter((p) => p !== opt);
                      handleChange("personalizationBoundaries", next);
                    }}
                  />
                  <span className="text-sm text-gray-900">{opt}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
