"use client";

import * as React from "react";
import { DEFAULT_GUARDRAILS } from "@/lib/guardrails/config";

export default function GuardrailsPage() {
  const config = DEFAULT_GUARDRAILS;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-gray-900">
          Guardrails
        </h1>
        <p className="text-sm text-gray-600">
          Define global safety, fairness, and communication guardrails for all AI assistants and agents.
          Do-Not-Engage rules and permissions are managed in their own sections; this page focuses on
          how agents behave when they are allowed to act.
        </p>
      </header>

      {/* Fairness & DEI */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
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
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Protected attributes (read-only for now)
            </p>
            <div className="flex flex-wrap gap-1">
              {config.fairness.protectedAttributes.map((attr) => (
                <span
                  key={attr}
                  className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700 border border-gray-200"
                >
                  {attr.replace(/_/g, " ")}
                </span>
              ))}
            </div>

            <p className="mt-2 text-[11px] text-gray-500">
              Agents must not segment, prioritize, or exclude based on these attributes, unless explicitly
              configured for approved support programs (for example, first-gen support).
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Language & bias guidance
            </p>
            <ul className="text-[11px] text-gray-600 space-y-1">
              <li>• Use neutral or strength-based language (e.g., "may benefit from support").</li>
              <li>• Avoid deficit framing (e.g., "low-quality student", "bad donor").</li>
              <li>• When in doubt, agents should recommend a human review instead of acting automatically.</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Fairness evals
          </p>
          <p className="text-[11px] text-gray-600">
            New or changed agents that act automatically should pass fairness evals that test for consistent
            behavior across synthetic profiles that differ only on protected attributes.
          </p>
        </div>
      </section>

      {/* Privacy & Data Scope */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Privacy & data scope
        </h2>
        <p className="text-xs text-gray-600">
          Control which data domains agents can use and how much detail they can include per channel.
          These guardrails help align with FERPA and institutional policies.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Data domains (read-only)
            </p>
            <div className="flex flex-wrap gap-1">
              {config.dataScope.allowedDomains.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700 border border-gray-200"
                >
                  {d.replace(/_/g, " ")}
                </span>
              ))}
            </div>

            <ul className="mt-2 text-[11px] text-gray-600 space-y-1">
              <li>• Agents only see data from domains explicitly allowed here.</li>
              <li>• Sensitive domains (counseling, disability) should be excluded upstream.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Channel content guidelines
            </p>
            <ul className="text-[11px] text-gray-600 space-y-1">
              <li>• Email: {config.dataScope.channelContentRules.email === "summary_ok" ? "High-level summaries; avoid full sensitive details." : ""}</li>
              <li>• SMS: {config.dataScope.channelContentRules.sms === "reminders_only" ? 'Reminders only (deadlines, "you have a new message").' : ""}</li>
              <li>• Phone/robocall: {config.dataScope.channelContentRules.phone === "summary_ok" ? "Short summaries; no detailed academic or financial data." : ""}</li>
            </ul>

            <p className="mt-2 text-[11px] text-gray-600">
              Agents should never surface mental health notes, confidential documents, or conduct history in their responses.
            </p>
          </div>
        </div>
      </section>

      {/* Engagement & Contact Policy */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Engagement & contact policy
        </h2>
        <p className="text-xs text-gray-600">
          Define when agents are allowed to reach out. Do-Not-Engage lists are enforced separately;
          these settings control timing, seasonal pauses, and message frequency.
        </p>

        {/* Quiet hours */}
        <div className="space-y-2 border-b border-gray-100 pb-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Quiet hours
          </p>
          <p className="text-[11px] text-gray-600">
            {config.contactPolicy.quietHours.enabled
              ? `Proactive outreach is paused from ${config.contactPolicy.quietHours.startTime} to ${config.contactPolicy.quietHours.endTime} (${config.contactPolicy.quietHours.timezoneMode} timezone).`
              : "Quiet hours are currently disabled."}
          </p>
          <p className="text-[11px] text-gray-500">
            Agents may still analyze data and create internal tasks during quiet hours, but they should not
            send email, SMS, or calls.
          </p>
        </div>

        {/* Quiet periods */}
        <div className="space-y-2 border-b border-gray-100 pb-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Seasonal quiet periods
          </p>
          {config.contactPolicy.quietPeriods.length === 0 ? (
            <p className="text-[11px] text-gray-500">
              No seasonal quiet periods configured yet. Use these to pause proactive outreach during finals,
              institutional breaks, or other sensitive windows.
            </p>
          ) : (
            <ul className="space-y-1 text-[11px] text-gray-600">
              {config.contactPolicy.quietPeriods.map((qp) => (
                <li key={qp.id} className="flex items-center justify-between">
                  <span>
                    {qp.name} ({qp.startDate} → {qp.endDate})
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {qp.appliesToRoles === "all" ? "All roles" : qp.appliesToRoles.join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sensitive dates */}
        <div className="space-y-2 border-b border-gray-100 pb-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Sensitive dates & holidays
          </p>
          {config.contactPolicy.sensitiveDates.length === 0 ? (
            <p className="text-[11px] text-gray-500">
              No sensitive dates configured yet. Consider adding key holidays and days of mourning where
              solicitations should be paused or restricted to supportive messaging.
            </p>
          ) : (
            <ul className="space-y-1 text-[11px] text-gray-600">
              {config.contactPolicy.sensitiveDates.map((sd) => (
                <li key={sd.id} className="flex items-center justify-between">
                  <span>
                    {sd.name} ({sd.date})
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {sd.blockSolicitations ? "No solicitations" : ""}
                    {sd.allowSupportOnly ? "Support-only outreach" : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Frequency caps */}
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Frequency caps
          </p>
          <p className="text-[11px] text-gray-600">
            Global cap: up to {config.contactPolicy.globalFrequencyCaps.maxMessagesPerDay} messages per day
            and {config.contactPolicy.globalFrequencyCaps.maxMessagesPerWeek} per week per person across all agents.
          </p>
          <p className="text-[11px] text-gray-600">
            Default per agent: up to {config.contactPolicy.perAgentFrequencyCapsDefault.maxMessagesPer14Days} messages
            in 14 days per person. After{" "}
            {config.contactPolicy.perAgentFrequencyCapsDefault.escalationAfterUnansweredCount} unanswered attempts, agents
            should escalate to a human instead of continuing to nudge.
          </p>
        </div>
      </section>

      {/* Actions & Logging */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Actions & autonomy
        </h2>
        <p className="text-xs text-gray-600">
          Control which actions agents can take automatically versus when a human must approve.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Default action modes
            </p>
            <ul className="text-[11px] text-gray-600 space-y-1">
              {Object.entries(config.actions.defaults).map(([key, mode]) => (
                <li key={key}>
                  <span className="font-mono text-[10px]">{key}</span>{" "}
                  <span className="text-gray-500">→</span>{" "}
                  <span className="font-medium">{mode}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-gray-500">
              "blocked" = agent may never perform this action. "human_review" = agent drafts, a person approves.
              "auto" = agent may act automatically within other guardrails.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Logging & eval expectations
            </p>
            <ul className="text-[11px] text-gray-600 space-y-1">
              <li>• All agent actions should be logged with who, when, and why.</li>
              {config.logging.requireDneCheckLogging && (
                <li>• Log when Do-Not-Engage rules block an action.</li>
              )}
              {config.logging.requireGuardrailCheckLogging && (
                <li>• Log when quiet hours, quiet periods, or frequency caps prevent outreach.</li>
              )}
              {config.logging.requireEvalStatusBeforeAuto && (
                <li>• Agents should pass safety/fairness evals before auto-actions are enabled.</li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
