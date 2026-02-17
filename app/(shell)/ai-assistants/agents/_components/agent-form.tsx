"use client";

import * as React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@/components/ui/font-awesome-icon";
import { AgentDneSection } from "./agent-dne-section";
import { NarrativeMessagingSection } from "@/components/shared/agents/NarrativeMessagingSection";
import { AgentPriorityWeight, type AgentType } from "@/lib/agents/types";
import type { NarrativeMessagingConfig } from "@/lib/agents/types";
import type { AgentRateLimits } from "@/lib/agents/api-types";
import { DEFAULT_NARRATIVE_CONFIG } from "@/lib/agents/mock-data";
import { AgentTypeBadge } from "@/components/shared/agents/AgentTypeBadge";
import { cn } from "@/lib/utils";

type ActionMode = "auto" | "approval";

interface ToolConfig {
  id: string;
  label: string;
  description: string;
  mode: ActionMode;
  supportsAuto: boolean;
  supportsApproval: boolean;
  settings?: string;
  aiNote?: string;
}

const TOOL_CONFIGS: ToolConfig[] = [
  {
    id: "email",
    label: "Email Tool",
    description: "Send approved email messages using institutional templates.",
    mode: "approval",
    supportsAuto: true,
    supportsApproval: true,
    settings: "Template: Missing Requirement Reminder · Channel: Institutional Email · Rate limit: 100/hour",
    aiNote: "Because this communication may reference deadlines, approval is recommended by default.",
  },
  {
    id: "sms",
    label: "SMS Tool",
    description: "Send short text messages to students, alumni, or donors.",
    mode: "approval",
    supportsAuto: true,
    supportsApproval: true,
    settings: "Short-form message templates · Opt-out language included · Rate limit: 50/hour",
    aiNote: "SMS is often configured as human-in-the-loop due to regulatory and sensitivity concerns.",
  },
  {
    id: "robocall",
    label: "Robocall Tool",
    description: "Trigger automated voice calls using pre-approved scripts.",
    mode: "approval",
    supportsAuto: true,
    supportsApproval: true,
    settings: "Script: Deadline Reminder v1 · Voice: Standard · Max retries: 1",
    aiNote: "Robocalls can be disruptive. Many institutions require explicit approval.",
  },
  {
    id: "flag",
    label: "Flag Tool",
    description: "Apply internal flags so staff can see risk, priority, or status at a glance.",
    mode: "auto",
    supportsAuto: true,
    supportsApproval: true,
    settings: "Flag types: At-risk, Missing Requirement, High Priority · Visibility: Advisors & Staff",
    aiNote: "Flags are generally safe to apply automatically for this agent.",
  },
  {
    id: "task",
    label: "Create Task Tool",
    description: "Create follow-up tasks for advisors, success staff, or gift officers.",
    mode: "auto",
    supportsAuto: true,
    supportsApproval: true,
    settings: "Owner: Assigned staff or team queue · Due date: Based on deadline proximity · Priority: Configurable",
    aiNote: "Tasks can be created automatically to reduce manual tracking.",
  },
];

const ROLES = [
  "Admissions",
  "Registrar",
  "Student Success",
  "Career Services",
  "Alumni Engagement",
  "Advancement",
] as const;

type Role =
  | "Admissions"
  | "Registrar"
  | "Student Success"
  | "Career Services"
  | "Alumni Engagement"
  | "Advancement";

interface AgentFormProps {
  mode: "create" | "edit";
  agentId?: string;
  /** Workspace for connector lists; defaults to admissions. */
  workspaceId?: string;
  /** When true, omit back link and main title (e.g. when embedded in AgentDetailLayout). */
  embedInLayout?: boolean;
  /** Agent type: AUTONOMOUS (default) or FLOW. Used for Narrative Messaging section and Step 1 display. */
  agentType?: AgentType;
  initialData?: {
    name?: string;
    purpose?: string;
    role?: Role;
    goal?: string;
    status?: string;
    lastRun?: string;
    nextRun?: string;
    priorityWeight?: AgentPriorityWeight;
    narrativeConfig?: NarrativeMessagingConfig;
    rateLimits?: AgentRateLimits;
    boundary?: { orgId: string; campusId?: string; departmentId?: string };
    /** When set, workspace/sub-workspace/default voice are fixed from template (read-only in UI, sent on create). */
    lockedScope?: { workspaceScopeId: string; subWorkspaceId?: string; defaultVoice?: string };
  };
  basePath?: string;
}

type AgentPermissions = {
  VIEW_AGENTS: boolean;
  MANAGE_AGENTS: boolean;
  RUN_AGENTS: boolean;
  MANAGE_NARRATIVE_PROFILES: boolean;
  MANAGE_CONNECTORS: boolean;
};

export function AgentForm({ mode, agentId, workspaceId: wsId = "admissions", embedInLayout = false, agentType = "AUTONOMOUS", initialData, basePath = "/ai-assistants" }: AgentFormProps) {
  const isCreate = mode === "create";
  const isAutonomous = agentType === "AUTONOMOUS";

  const [permissions, setPermissions] = React.useState<AgentPermissions | null>(null);
  React.useEffect(() => {
    fetch("/api/agents/permissions")
      .then((r) => (r.ok ? r.json() : null))
      .then(setPermissions)
      .catch(() => setPermissions(null));
  }, []);

  const canManage = permissions?.MANAGE_AGENTS !== false;
  const canRun = permissions?.RUN_AGENTS !== false;

  const [webhookConnectors, setWebhookConnectors] = React.useState<{ id: string; name: string }[]>([]);
  const [sfmcConnectors, setSfmcConnectors] = React.useState<{ id: string; name: string }[]>([]);
  React.useEffect(() => {
    if (!permissions?.MANAGE_CONNECTORS) return;
    fetch(`/api/connectors/webhooks?workspaceId=${wsId}`).then((r) => (r.ok ? r.json() : [])).then((list: { id: string; name: string }[]) => setWebhookConnectors(list)).catch(() => setWebhookConnectors([]));
    fetch(`/api/connectors/sfmc?workspaceId=${wsId}`).then((r) => (r.ok ? r.json() : [])).then((list: { id: string; name: string }[]) => setSfmcConnectors(list)).catch(() => setSfmcConnectors([]));
  }, [wsId, permissions?.MANAGE_CONNECTORS]);

  const [webhookEnabled, setWebhookEnabled] = React.useState(false);
  const [webhookRequiresApproval, setWebhookRequiresApproval] = React.useState(true);
  const [webhookConnectorId, setWebhookConnectorId] = React.useState("");
  const [sfmcEnabled, setSfmcEnabled] = React.useState(false);
  const [sfmcRequiresApproval, setSfmcRequiresApproval] = React.useState(true);
  const [sfmcConnectorId, setSfmcConnectorId] = React.useState("");
  const [sfmcJourneys, setSfmcJourneys] = React.useState("");
  const [sfmcDataExtensions, setSfmcDataExtensions] = React.useState("");
  const [boundary, setBoundary] = React.useState<{ orgId: string; campusId?: string; departmentId?: string }>(() => ({
    orgId: initialData?.boundary?.orgId ?? "",
    campusId: initialData?.boundary?.campusId ?? "",
    departmentId: initialData?.boundary?.departmentId ?? "",
  }));

  const [lastExecuteResult, setLastExecuteResult] = React.useState<{
    runId: string; summary: string; status: string; counts: { drafted: number; approvalsCreated: number; blocked: number; executed: number; failed: number };
  } | null>(null);
  const [executeLoading, setExecuteLoading] = React.useState(false);
  const handleRunNow = React.useCallback(async () => {
    if (!agentId || !canRun) return;
    setExecuteLoading(true);
    setLastExecuteResult(null);
    try {
      const res = await fetch(`/api/agents/${agentId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "DRY_RUN" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Run failed");
      }
      const data = await res.json();
      setLastExecuteResult({
        runId: data.runId,
        summary: data.summary,
        status: data.status,
        counts: data.counts ?? { drafted: 0, approvalsCreated: 0, blocked: 0, executed: 0, failed: 0 },
      });
    } catch (err) {
      console.error(err);
      setLastExecuteResult({
        runId: "",
        summary: err instanceof Error ? err.message : "Run failed",
        status: "FAILED",
        counts: { drafted: 0, approvalsCreated: 0, blocked: 0, executed: 0, failed: 0 },
      });
    } finally {
      setExecuteLoading(false);
    }
  }, [agentId, canRun]);

  const [evalResult, setEvalResult] = React.useState<{
    outcome: "PASS" | "FAIL";
    profileName?: string;
    profileVersion?: number;
    topicsDetected: string[];
    checks: { blockedTopicDetected: boolean; allowedTopicsRespected: boolean; personalizationAllowedOnly: boolean };
    remediation?: string;
  } | null>(null);
  const [evalLoading, setEvalLoading] = React.useState(false);
  const runEval = React.useCallback(() => {
    if (!agentId) return;
    setEvalLoading(true);
    fetch("/api/agent-eval", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId, sampleContext: { messagePreview: "Sample message with deadline and document reminder." } }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then(setEvalResult)
      .catch(() => setEvalResult(null))
      .finally(() => setEvalLoading(false));
  }, [agentId]);
  React.useEffect(() => {
    if (agentId && !isCreate) runEval();
  }, [agentId, isCreate, runEval]);

  // Initialize state with defaults or initial data
  const [agentName, setAgentName] = React.useState<string>(
    initialData?.name || ""
  );
  const [narrativeConfig, setNarrativeConfig] = React.useState<NarrativeMessagingConfig>(
    () => ({ ...DEFAULT_NARRATIVE_CONFIG, ...initialData?.narrativeConfig })
  );
  const [purpose, setPurpose] = React.useState<string>(
    initialData?.purpose || ""
  );
  const [selectedRole, setSelectedRole] = React.useState<Role>(
    initialData?.role || "Admissions"
  );
  const [goalText, setGoalText] = React.useState<string>(
    initialData?.goal || ""
  );
  const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false);
  const [priorityWeight, setPriorityWeight] = React.useState<AgentPriorityWeight>(
    initialData?.priorityWeight ?? 3
  );
  const [rateLimits, setRateLimits] = React.useState<AgentRateLimits>(() => ({
    maxActionsPerHour: initialData?.rateLimits?.maxActionsPerHour ?? 100,
    maxMessagesPerDay: initialData?.rateLimits?.maxMessagesPerDay ?? 50,
    maxErrorsPerHour: initialData?.rateLimits?.maxErrorsPerHour ?? 10,
    autoPauseOnErrorSpike: initialData?.rateLimits?.autoPauseOnErrorSpike ?? true,
    errorSpikeThreshold: initialData?.rateLimits?.errorSpikeThreshold ?? 5,
  }));

  // Role-based outcome-focused goals
  const ROLE_GOALS: Record<string, string[]> = {
    Admissions: [
      "Increase application completion rates",
      "Reduce stalled applicants and inactivity",
      "Improve document submission timelines",
      "Increase inquiry to application conversion",
      "Reduce melt risk before enrollment",
      "Improve yield among high-intent prospects",
    ],
    Registrar: [
      "Reduce registration blockers and holds",
      "Improve on-time enrollment rates",
      "Increase completion of required documentation",
      "Reduce late adds/drops through early alerts",
      "Improve compliance with academic and financial requirements",
    ],
    "Student Success": [
      "Improve persistence and retention rates",
      "Reduce academic risk through early identification",
      "Increase student milestone completion",
      "Improve engagement and reduce disengagement",
      "Improve graduation-rate trajectory",
    ],
    "Career Services": [
      "Increase internship and job placement rates",
      "Improve career readiness milestone completion",
      "Reduce students stalling in the preparation process",
      "Increase engagement with employers and events",
      "Improve résumé and profile completeness",
    ],
    "Alumni Engagement": [
      "Increase alumni engagement and participation",
      "Improve volunteer and mentorship activation",
      "Increase event attendance",
      "Reduce declining-engagement segments",
      "Improve alumni profile completeness",
    ],
    Advancement: [
      "Improve donor retention (LYBUNT/SYBUNT)",
      "Increase total annual giving",
      "Accelerate pipeline movement",
      "Improve proposal conversion rates",
      "Reduce donor lapse and disengagement",
    ],
  };

  const DEFAULT_GOALS = ROLE_GOALS[selectedRole] ?? ROLE_GOALS["Admissions"];
  const [suggestedPrompts, setSuggestedPrompts] = React.useState<string[]>(DEFAULT_GOALS);

  // Reset suggestions when role changes
  React.useEffect(() => {
    const newGoals = ROLE_GOALS[selectedRole] ?? ROLE_GOALS["Admissions"];
    setSuggestedPrompts(newGoals);
  }, [selectedRole]);

  // Generate more suggestions using OpenAI
  const handleGenerateMoreSuggestions = async () => {
    try {
      setIsLoadingSuggestions(true);
      const res = await fetch("/api/agent-goal-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          role: selectedRole, 
          currentGoal: goalText || undefined 
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await res.json();
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestedPrompts(data.suggestions);
      }
    } catch (err) {
      console.error("Error generating suggestions:", err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // For edit mode, use initial data or defaults
  const status = initialData?.status || (isCreate ? undefined : "Active");
  const lastRun = initialData?.lastRun || (isCreate ? undefined : "Never");
  const nextRun = initialData?.nextRun || (isCreate ? undefined : "Not scheduled");

  // State management for tool modes
  const [toolModes, setToolModes] = React.useState<Record<string, ActionMode>>(() => {
    const initial: Record<string, ActionMode> = {};
    TOOL_CONFIGS.forEach((tool) => {
      initial[tool.id] = tool.mode;
    });
    return initial;
  });

  const handleModeChange = (toolId: string, mode: ActionMode) => {
    setToolModes((prev) => ({ ...prev, [toolId]: mode }));
  };

  const narrativeComplete =
    narrativeConfig.profileId &&
    narrativeConfig.tone &&
    narrativeConfig.escalationMessage &&
    narrativeConfig.personalizationBoundaries.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAutonomous && isCreate && !narrativeComplete) {
      // UI validation: do not submit, warning is shown in NarrativeMessagingSection
      return;
    }
    // TODO: Implement API call to create or update agent
    const boundaryPayload = boundary.orgId ? { orgId: boundary.orgId, campusId: boundary.campusId, departmentId: boundary.departmentId } : undefined;
    if (isCreate) {
      console.log("Creating agent:", { agentName, purpose, selectedRole, goalText, toolModes, priorityWeight, narrativeConfig, boundary: boundaryPayload, lockedScope: initialData?.lockedScope });
      // POST /api/agents with body.boundary and body.lockedScope (workspace_id, sub_workspace_id, default_voice)
    } else {
      console.log("Updating agent:", { agentId, agentName, purpose, selectedRole, goalText, toolModes, priorityWeight, narrativeConfig, rateLimits, boundary: boundaryPayload });
      // PUT /api/agents/[id] with body.boundary
    }
  };

  const title = isCreate ? "CREATE NEW AGENT" : `EDIT AGENT — ${agentName || "Unnamed Agent"}`;
  const primaryCta = isCreate ? "Create Agent" : "Save Changes";

  return (
    <>
    {permissions && !canManage && (
      <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        You do not have permission to create or save agents.
      </p>
    )}
    <div className="flex h-full flex-col gap-6 p-4">
      {!embedInLayout && (
        <>
          <div>
            <Link
              href={`${basePath}/agents`}
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              <FontAwesomeIcon icon="fa-solid fa-arrow-left" className="h-3 w-3" />
              Back to Agents
            </Link>
          </div>
          <header>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              {title}
            </h1>
            {isCreate && (
              <p className="mt-1 text-sm text-gray-600">
                Configure an outcome-focused agent to act on your behalf.
              </p>
            )}
          </header>
        </>
      )}

      <form onSubmit={handleSubmit}>
        {isCreate && initialData?.lockedScope && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            <span className="font-medium">Scope (locked from template):</span>
            <span>{initialData.lockedScope.workspaceScopeId === "advancement_giving_intelligence" ? "Advancement" : "Student Lifecycle"}</span>
            {initialData.lockedScope.subWorkspaceId && (
              <span>· {initialData.lockedScope.subWorkspaceId}</span>
            )}
            {initialData.lockedScope.defaultVoice && (
              <span>· Voice: {initialData.lockedScope.defaultVoice.replace(/_/g, " ")}</span>
            )}
          </div>
        )}
        {/* STEP 1 — Agent Summary */}
        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
            STEP 1 — Agent Summary
          </h2>
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Agent Name</label>
              {isCreate ? (
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Enter agent name"
                  required
                />
              ) : (
                <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
                  {agentName || "Unnamed Agent"}
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Purpose</label>
              {isCreate ? (
                <textarea
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Describe what this agent does"
                />
              ) : (
                <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
                  {purpose || "Agent purpose description"}
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Role</label>
              <select
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            {(!isCreate || isAutonomous) && (
              <div>
                <label className="text-xs font-medium text-gray-500">Agent Type</label>
                <div className="mt-1">
                  <AgentTypeBadge type={agentType} />
                </div>
              </div>
            )}
            {!isCreate && status && (
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-xs font-medium text-gray-500">Status: </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    {status}
                  </span>
                </div>
                {lastRun && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">Last Run: </span>
                    <span className="text-xs text-gray-700">{lastRun}</span>
                  </div>
                )}
                {nextRun && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">Next Scheduled Run: </span>
                    <span className="text-xs text-gray-700">{nextRun}</span>
                  </div>
                )}
              </div>
            )}
            {!isCreate && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <div className="mb-2 flex items-start gap-2">
                  <FontAwesomeIcon icon="fa-solid fa-lightbulb" className="mt-0.5 h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-900">AI Recommendation:</span>
                </div>
                <p className="text-xs text-blue-800">
                  "This agent is working efficiently. Consider adding a deadline-based urgency rule."
                </p>
                <button type="button" className="mt-3 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                  Accept ▸
                </button>
              </div>
            )}
          </div>
        </section>

        {/* STEP 2 — Define Agent Goal */}
        <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">
            STEP 2 — Define Agent Goal
          </h2>
          <p className="text-xs text-gray-600">
            Choose what this agent should focus on. Goals help the system suggest prompts,
            evaluate performance, and keep actions aligned with your outcomes.
          </p>

          <div className="border-t border-gray-100 pt-3 space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Refine the goal
            </p>

            <label className="block text-[11px] font-medium text-gray-600">
              What is the goal you want this agent to work toward?
            </label>

            <textarea
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] text-gray-800 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              rows={2}
              placeholder="Describe the outcome you want this agent to achieve, or tap a goal below…"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
            />

            <div className="space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                Tap a goal to use it
              </p>

              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setGoalText(prompt)}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-left text-gray-700 hover:border-gray-300 hover:bg-gray-100"
                  >
                    <span className="text-gray-400">💬</span>
                    <span className="whitespace-normal">{prompt}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleGenerateMoreSuggestions}
                disabled={isLoadingSuggestions}
                className="mt-1 inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                <span className="text-xs">↻</span>
                <span>{isLoadingSuggestions ? "Generating…" : "Generate more goal options"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Engagement Priority */}
        <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-2">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-gray-900">Engagement priority</h2>
            <p className="text-xs text-gray-600">
              Use priority to decide which agents send messages first when global frequency caps are reached.
            </p>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            {[
              { value: 5 as AgentPriorityWeight, label: "Critical", description: "Safety, legal, or urgent deadlines." },
              { value: 4 as AgentPriorityWeight, label: "High", description: "Required deadlines or enrollment tasks." },
              { value: 3 as AgentPriorityWeight, label: "Standard", description: "Typical operational nudges." },
              { value: 2 as AgentPriorityWeight, label: "Low", description: "Optional or advisory messaging." },
              { value: 1 as AgentPriorityWeight, label: "Informational", description: "Marketing or general info." },
            ].map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer flex-col gap-1 rounded-lg border px-3 py-2 text-xs",
                  priorityWeight === opt.value
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-gray-50 text-gray-800 hover:border-gray-300"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{opt.label}</span>
                  <input
                    type="radio"
                    className="h-3 w-3"
                    checked={priorityWeight === opt.value}
                    onChange={() => setPriorityWeight(opt.value)}
                  />
                </div>
                <p className={cn("text-[11px]", priorityWeight === opt.value ? "text-gray-200" : "text-gray-600")}>
                  {opt.description}
                </p>
              </label>
            ))}
          </div>

          <p className="text-[11px] text-gray-500">
            Example: If multiple agents want to message the same student, higher-priority agents
            win tie-breakers and lower-priority agents may be postponed when limits are reached.
          </p>
        </section>

        {/* STEP 3 — Action Tools */}
        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              STEP 3 — Action Tools
            </h2>
            <p className="text-xs text-gray-500 max-w-md">
              Tools define how this agent can act: send messages, create tasks, or flag records. Use
              human-in-the-loop when actions are sensitive or high impact.
            </p>
          </div>
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <div className="grid gap-3 md:grid-cols-2">
              {TOOL_CONFIGS.map((tool) => (
                <div
                  key={tool.id}
                  className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{tool.label}</h3>
                      <p className="mt-0.5 text-xs text-gray-600">{tool.description}</p>
                    </div>
                  </div>

                  {/* Mode selector */}
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {tool.supportsAuto && (
                      <button
                        type="button"
                        onClick={() => handleModeChange(tool.id, "auto")}
                        className={
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors " +
                          (toolModes[tool.id] === "auto"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300")
                        }
                      >
                        Agent can act automatically
                      </button>
                    )}
                    {tool.supportsApproval && (
                      <button
                        type="button"
                        onClick={() => handleModeChange(tool.id, "approval")}
                        className={
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors " +
                          (toolModes[tool.id] === "approval"
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300")
                        }
                      >
                        Requires human approval
                      </button>
                    )}
                  </div>

                  {/* Settings summary */}
                  {tool.settings && (
                    <p className="mt-1 text-[11px] text-gray-600">
                      <span className="font-semibold text-gray-700">Settings: </span>
                      {tool.settings}
                    </p>
                  )}

                  {/* AI note */}
                  {tool.aiNote && (
                    <div className="mt-1 rounded border border-blue-100 bg-blue-50 px-2 py-1.5">
                      <p className="text-[11px] italic text-blue-800">
                        <span className="font-semibold text-blue-900">AI note: </span>
                        {tool.aiNote}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Webhook Push — capability-scoped */}
              <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">Webhook Push</h3>
                    <p className="mt-0.5 text-xs text-gray-600">Send payloads to pre-registered webhook endpoints. Only allowlisted connectors can be used.</p>
                  </div>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={webhookEnabled} onChange={(e) => setWebhookEnabled(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
                    <span className="text-xs font-medium text-gray-700">Enabled</span>
                  </label>
                </div>
                {webhookEnabled && (
                  <>
                    <label className="flex items-center gap-1.5">
                      <input type="checkbox" checked={webhookRequiresApproval} onChange={(e) => setWebhookRequiresApproval(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
                      <span className="text-xs font-medium text-gray-700">Requires human approval</span>
                    </label>
                    <div>
                      <label className="text-[11px] font-medium text-gray-600">Connector</label>
                      <select value={webhookConnectorId} onChange={(e) => setWebhookConnectorId(e.target.value)} className="mt-1 w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900">
                        <option value="">Select a webhook connection</option>
                        {webhookConnectors.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <p className="text-[11px] text-gray-500">Capability: push_payload</p>
                  </>
                )}
              </div>

              {/* Salesforce Marketing Cloud — capability-scoped */}
              <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">Salesforce Marketing Cloud</h3>
                    <p className="mt-0.5 text-xs text-gray-600">Upsert data extensions or trigger journeys via a registered SFMC connection.</p>
                  </div>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={sfmcEnabled} onChange={(e) => setSfmcEnabled(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
                    <span className="text-xs font-medium text-gray-700">Enabled</span>
                  </label>
                </div>
                {sfmcEnabled && (
                  <>
                    <label className="flex items-center gap-1.5">
                      <input type="checkbox" checked={sfmcRequiresApproval} onChange={(e) => setSfmcRequiresApproval(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
                      <span className="text-xs font-medium text-gray-700">Requires human approval</span>
                    </label>
                    <div>
                      <label className="text-[11px] font-medium text-gray-600">Connector</label>
                      <select value={sfmcConnectorId} onChange={(e) => setSfmcConnectorId(e.target.value)} className="mt-1 w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900">
                        <option value="">Select an SFMC connection</option>
                        {sfmcConnectors.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-gray-600">Allowed journeys (comma-separated)</label>
                      <input type="text" value={sfmcJourneys} onChange={(e) => setSfmcJourneys(e.target.value)} placeholder="e.g. Journey A, Journey B" className="mt-1 w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-gray-600">Allowed data extensions (comma-separated)</label>
                      <input type="text" value={sfmcDataExtensions} onChange={(e) => setSfmcDataExtensions(e.target.value)} placeholder="e.g. DE_Contacts" className="mt-1 w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900" />
                    </div>
                    <p className="text-[11px] text-gray-500">Capabilities: upsert_data_extension, trigger_journey</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Narrative Messaging — Autonomous only, after Action Tools, before Scope */}
        {isAutonomous && (
          <NarrativeMessagingSection
            value={narrativeConfig}
            onChange={setNarrativeConfig}
            readOnly={!isCreate}
            showValidationWarning={isCreate && !narrativeComplete}
          />
        )}

        {/* STEP 4 — Scope & Population Filters */}
        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
            STEP 4 — Scope & Population Filters
          </h2>
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Boundary scope (optional)</label>
              <p className="mt-0.5 text-[11px] text-gray-500">Org / campus / department for multi-tenant governance. Default inherits workspace.</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <div>
                  <label className="text-[11px] text-gray-600">Org ID</label>
                  <input type="text" value={boundary.orgId} onChange={(e) => setBoundary((b) => ({ ...b, orgId: e.target.value }))} placeholder="e.g. acme-edu" className="mt-0.5 w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-600">Campus ID</label>
                  <input type="text" value={boundary.campusId ?? ""} onChange={(e) => setBoundary((b) => ({ ...b, campusId: e.target.value || undefined }))} placeholder="optional" className="mt-0.5 w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-600">Department ID</label>
                  <input type="text" value={boundary.departmentId ?? ""} onChange={(e) => setBoundary((b) => ({ ...b, departmentId: e.target.value || undefined }))} placeholder="optional" className="mt-0.5 w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Population Scope</label>
              <div className="mt-1">
                <label className="text-xs text-gray-600">Program / Term:</label>
                <select className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900">
                  <option>MBA – Fall 2026</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Filters:</label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked className="h-4 w-4 text-indigo-600" readOnly />
                  <span className="text-sm text-gray-900">Missing Transcript</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 text-indigo-600" readOnly />
                  <span className="text-sm text-gray-900">International</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 text-indigo-600" readOnly />
                  <span className="text-sm text-gray-900">Scholarship Applicants</span>
                </label>
              </div>
              <button type="button" className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700">
                Add Filter
              </button>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <span className="text-xs font-medium text-gray-700">Matching population: </span>
              <span className="text-xs font-semibold text-gray-900">214 applicants</span>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
              <div className="mb-1 flex items-start gap-2">
                <FontAwesomeIcon icon="fa-solid fa-info-circle" className="mt-0.5 h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-900">AI Insight:</span>
              </div>
              <p className="text-xs text-blue-800">
                "This scope targets applicants with high stall risk and strong improvement potential."
              </p>
            </div>
          </div>
        </section>

        {/* STEP 5 — Guardrails */}
        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
            STEP 5 — Guardrails
          </h2>
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <h3 className="text-xs font-semibold text-gray-700">Rate limits & auto-pause</h3>
              <p className="mt-0.5 text-[11px] text-gray-500">
                Enforced when running the agent. Exceeding limits returns 429; errors can auto-pause the agent.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-medium text-gray-600">Max actions/hour</label>
                  <input
                    type="number"
                    min={1}
                    value={rateLimits.maxActionsPerHour ?? 100}
                    onChange={(e) => setRateLimits((r) => ({ ...r, maxActionsPerHour: parseInt(e.target.value, 10) || undefined }))}
                    className="mt-1 w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-600">Max messages/day</label>
                  <input
                    type="number"
                    min={1}
                    value={rateLimits.maxMessagesPerDay ?? 50}
                    onChange={(e) => setRateLimits((r) => ({ ...r, maxMessagesPerDay: parseInt(e.target.value, 10) || undefined }))}
                    className="mt-1 w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-600">Max errors/hour</label>
                  <input
                    type="number"
                    min={0}
                    value={rateLimits.maxErrorsPerHour ?? 10}
                    onChange={(e) => setRateLimits((r) => ({ ...r, maxErrorsPerHour: parseInt(e.target.value, 10) || undefined }))}
                    className="mt-1 w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-600">Error spike threshold</label>
                  <input
                    type="number"
                    min={0}
                    value={rateLimits.errorSpikeThreshold ?? 5}
                    onChange={(e) => setRateLimits((r) => ({ ...r, errorSpikeThreshold: parseInt(e.target.value, 10) || undefined }))}
                    className="mt-1 w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900"
                  />
                </div>
              </div>
              <label className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rateLimits.autoPauseOnErrorSpike ?? true}
                  onChange={(e) => setRateLimits((r) => ({ ...r, autoPauseOnErrorSpike: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-xs text-gray-700">Auto-pause on error spike</span>
              </label>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Messaging Limits</label>
              <div className="mt-1">
                <label className="text-xs text-gray-600">Max messages per applicant per day:</label>
                <input
                  type="number"
                  defaultValue={1}
                  className="mt-1 w-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                  readOnly
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Quiet Hours</label>
              <div className="mt-1 flex items-center gap-2">
                <div>
                  <label className="text-xs text-gray-600">Start:</label>
                  <input
                    type="time"
                    defaultValue="21:00"
                    className="mt-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">End:</label>
                  <input
                    type="time"
                    defaultValue="08:00"
                    className="mt-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Action Restrictions</label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked className="h-4 w-4 text-indigo-600" readOnly />
                  <span className="text-sm text-gray-900">Cannot modify SIS records</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked className="h-4 w-4 text-indigo-600" readOnly />
                  <span className="text-sm text-gray-900">
                    Cannot escalate to advisor without approval
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked className="h-4 w-4 text-indigo-600" readOnly />
                  <span className="text-sm text-gray-900">
                    Approval required for external messaging
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked className="h-4 w-4 text-indigo-600" readOnly />
                  <span className="text-sm text-gray-900">
                    Approval required for external system actions (webhook / SFMC)
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked className="h-4 w-4 text-indigo-600" readOnly />
                  <span className="text-sm text-gray-900">Block if narrative confidence low</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked className="h-4 w-4 text-indigo-600" readOnly />
                  <span className="text-sm text-gray-900">SMS always requires approval</span>
                </label>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Data Permissions</label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked className="h-4 w-4 text-indigo-600" readOnly />
                  <span className="text-sm text-gray-900">Application data</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked className="h-4 w-4 text-indigo-600" readOnly />
                  <span className="text-sm text-gray-900">Document checklist</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 text-indigo-600" readOnly />
                  <span className="text-sm text-gray-900">Financial aid data</span>
                </label>
              </div>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
              <div className="mb-1 flex items-start gap-2">
                <FontAwesomeIcon icon="fa-solid fa-shield-check" className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-900">AI Guardrail Check:</span>
              </div>
              <p className="text-xs text-emerald-800">
                "All guardrails are valid. No conflicts detected."
              </p>
            </div>
          </div>
        </section>

        {/* Engagement Rules — Do-Not-Engage */}
        {!isCreate && agentId && (
          <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Engagement Rules
            </h2>
            <div className="border-t border-gray-100 pt-4">
              <AgentDneSection agentId={agentId} />
            </div>
          </section>
        )}

        {/* STEP 6 — Eval Preview (Narrative + topic checks) */}
        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
            STEP 6 — Eval Preview (Narrative safety)
          </h2>
          <div className="space-y-4 border-t border-gray-100 pt-4">
            {agentId && !isCreate && (
              <div className="flex items-center gap-2">
                <button type="button" onClick={runEval} disabled={evalLoading} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  {evalLoading ? "Running…" : "Run narrative check"}
                </button>
              </div>
            )}
            {evalResult && (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="text-xs font-medium text-gray-500">Profile</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">{evalResult.profileName ?? "—"} {evalResult.profileVersion != null && `v${evalResult.profileVersion}`}</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="text-xs font-medium text-gray-500">Outcome</div>
                    <div className={cn("mt-1 text-sm font-semibold", evalResult.outcome === "PASS" ? "text-emerald-700" : "text-amber-700")}>{evalResult.outcome}</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="text-xs font-medium text-gray-500">Topics detected</div>
                    <div className="mt-1 text-xs text-gray-700">{evalResult.topicsDetected.length ? evalResult.topicsDetected.join(", ") : "None"}</div>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="text-xs font-medium text-gray-700">Checks</div>
                  <ul className="mt-1 space-y-0.5 text-xs text-gray-600">
                    <li>{evalResult.checks.blockedTopicDetected ? "❌ Blocked topic detected" : "✓ No blocked topic"}</li>
                    <li>{evalResult.checks.allowedTopicsRespected ? "✓ Allowed topics respected" : "❌ Allowed topics not respected"}</li>
                    <li>{evalResult.checks.personalizationAllowedOnly ? "✓ Personalization allowlist OK" : "❌ Disallowed personalization used"}</li>
                  </ul>
                </div>
                {evalResult.remediation && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                    <span className="text-xs font-medium text-amber-900">Remediation: </span>
                    <span className="text-xs text-amber-800">{evalResult.remediation}</span>
                  </div>
                )}
              </>
            )}
            {!evalResult && !agentId && (
              <p className="text-xs text-gray-500">Save the agent to run narrative safety checks.</p>
            )}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="mb-2 text-sm font-medium text-gray-900">Simulation example</div>
              <div className="space-y-2 text-xs text-gray-700">
                <div>
                  <span className="font-medium">Input: </span>
                  "Inactive 8 days + missing transcript + 11-day deadline."
                </div>
                <div>
                  <span className="font-medium">Eval: </span>
                  Topic detection and profile allowlist/denylist are checked. Blocked topic or disallowed personalization → FAIL.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
          <Link
            href={`${basePath}/agents`}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          {!isCreate && (
            <>
              {(webhookEnabled && webhookRequiresApproval) || (sfmcEnabled && sfmcRequiresApproval) ? (
                <span className="text-xs text-gray-600">This run may require approval for external actions (webhook/SFMC).</span>
              ) : null}
              {permissions && !canRun && (
                <span className="text-xs text-amber-700">You do not have permission to run this agent.</span>
              )}
              <button
                type="button"
                disabled={!canRun || executeLoading}
                onClick={handleRunNow}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                aria-label="Run agent now"
              >
                {executeLoading ? "Running…" : "Run Now"}
              </button>
            </>
          )}
          {lastExecuteResult && !isCreate && (
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-700">Last run (DRY_RUN)</p>
              <p className="mt-0.5 text-xs text-gray-600">{lastExecuteResult.summary}</p>
              <p className="mt-1 text-xs text-gray-500">
                Drafted: {lastExecuteResult.counts.drafted} · Approvals: {lastExecuteResult.counts.approvalsCreated} · Blocked: {lastExecuteResult.counts.blocked} · Executed: {lastExecuteResult.counts.executed}
              </p>
              {lastExecuteResult.runId && (
                <Link
                  href={`${basePath}/agents/${agentId}?tab=runs`}
                  className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  View Run History →
                </Link>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={!canManage}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            aria-label={isCreate ? "Create agent" : "Save agent changes"}
          >
            {primaryCta}
          </button>
        </div>
      </form>
    </div>
    </>
  );
}

