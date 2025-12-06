"use client";

import * as React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@/components/ui/font-awesome-icon";

interface AgentPageProps {
  params: { id: string };
}

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

interface GoalOption {
  id: string;
  label: string;
  suggestedPrompts: string[];
}

const GOALS_BY_ROLE: Record<Role, GoalOption[]> = {
  Admissions: [
    {
      id: "reduce-stalled",
      label: "Reduce stalled applicants",
      suggestedPrompts: [
        "Who stalled this week?",
        "Show applicants inactive for 7+ days.",
        "Which students are missing documents?",
      ],
    },
    {
      id: "prevent-melt",
      label: "Prevent melt",
      suggestedPrompts: [
        "Which admits have not logged in recently?",
        "Who is at melt risk today?",
        "Show pre-enrollment drop-off patterns.",
      ],
    },
    {
      id: "improve-completion",
      label: "Boost application completion",
      suggestedPrompts: [
        "Who is closest to completing?",
        "Which steps cause the most delays?",
      ],
    },
  ],
  Registrar: [
    {
      id: "resolve-blockers",
      label: "Resolve registration blockers",
      suggestedPrompts: [
        "Who cannot register and why?",
        "Show students with prerequisites issues.",
      ],
    },
    {
      id: "degree-progress",
      label: "Monitor degree progress",
      suggestedPrompts: [
        "Who is off-track for graduation?",
        "Which students need schedule cleanup?",
      ],
    },
  ],
  "Student Success": [
    {
      id: "identify-risk",
      label: "Identify at-risk students",
      suggestedPrompts: [
        "Who is academically at risk?",
        "Show disengaged students this week.",
      ],
    },
    {
      id: "persistence",
      label: "Improve persistence",
      suggestedPrompts: [
        "Which students missed key milestones?",
        "Who needs advisor follow-up?",
      ],
    },
  ],
  "Career Services": [
    {
      id: "milestones",
      label: "Support career milestones",
      suggestedPrompts: [
        "Who hasn't completed résumé steps?",
        "Which students need internship nudges?",
      ],
    },
    {
      id: "engagement",
      label: "Increase engagement",
      suggestedPrompts: [
        "Show students not engaging with postings.",
      ],
    },
  ],
  "Alumni Engagement": [
    {
      id: "declining-engagement",
      label: "Detect declining engagement",
      suggestedPrompts: [
        "Who has dropped off in engagement?",
        "Show alumni likely to re-engage.",
      ],
    },
    {
      id: "volunteering",
      label: "Promote mentoring & volunteering",
      suggestedPrompts: [
        "Who would make a good volunteer?",
        "Show mentoring-ready alumni.",
      ],
    },
  ],
  Advancement: [
    {
      id: "lybunt-recovery",
      label: "Recover LYBUNT donors",
      suggestedPrompts: [
        "Show LYBUNTs to recover this month.",
        "Who has the highest giving potential?",
      ],
    },
    {
      id: "pipeline",
      label: "Move pipeline forward",
      suggestedPrompts: [
        "Which proposals are stalled?",
        "Who should I contact today?",
      ],
    },
  ],
};

export default function AgentEditPage({ params }: AgentPageProps) {
  const { id } = params;

  // Simple mapping for now
  const isTranscriptHelper = id === "agent-transcript-helper";

  const agentName = isTranscriptHelper ? "Transcript Helper Agent" : `Agent ${id}`;
  const [selectedRole, setSelectedRole] = React.useState<Role>(
    isTranscriptHelper ? "Admissions" : "Admissions"
  );
  const [selectedGoal, setSelectedGoal] = React.useState<string | null>(null);
  const [customGoalText, setCustomGoalText] = React.useState<string>("");
  const [isCustomGoal, setIsCustomGoal] = React.useState<boolean>(false);
  const [semanticValidation, setSemanticValidation] = React.useState<{
    status: "valid" | "invalid" | null;
    message: string;
  }>({ status: null, message: "" });

  // Reset goal when role changes
  React.useEffect(() => {
    setSelectedGoal(null);
    setIsCustomGoal(false);
    setCustomGoalText("");
    setSemanticValidation({ status: null, message: "" });
  }, [selectedRole]);

  const purpose = isTranscriptHelper
    ? "Identifies applicants with missing transcripts and triggers reminder workflows."
    : "Agent purpose description";
  const status = isTranscriptHelper ? "Active" : "Active";
  const lastRun = isTranscriptHelper ? "12 minutes ago" : "Never";
  const nextRun = isTranscriptHelper ? "Tomorrow at 8:00 AM" : "Not scheduled";

  // Get goals for current role
  const availableGoals = GOALS_BY_ROLE[selectedRole] || [];
  const selectedGoalData = availableGoals.find((g) => g.id === selectedGoal);

  // Handle custom goal text changes with semantic validation placeholder
  const handleCustomGoalChange = (text: string) => {
    setCustomGoalText(text);
    if (text.trim().length > 10) {
      // Placeholder semantic validation - in real app, this would call an API
      const hasKeywords = /status|activity|requirement|document|deadline/i.test(text);
      if (hasKeywords) {
        setSemanticValidation({
          status: "valid",
          message: "✔ Mapped to fields: status, last_activity, missing_requirements",
        });
      } else {
        setSemanticValidation({
          status: "invalid",
          message: "⚠ Unable to map — please rephrase or select a suggested goal",
        });
      }
    } else {
      setSemanticValidation({ status: null, message: "" });
    }
  };

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

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      {/* Back link */}
      <div>
        <Link
          href="/ai-assistants/agents"
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
        >
          <FontAwesomeIcon icon="fa-solid fa-arrow-left" className="h-3 w-3" />
          Back to Agents
        </Link>
      </div>

      {/* Title */}
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          EDIT AGENT — {agentName}
        </h1>
      </header>

      {/* STEP 1 — Agent Summary */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
          STEP 1 — Agent Summary
        </h2>
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <div>
            <label className="text-xs font-medium text-gray-500">Agent Name</label>
            <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
              {agentName}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Purpose</label>
            <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
              {purpose}
            </div>
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
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs font-medium text-gray-500">Status: </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                {status}
              </span>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500">Last Run: </span>
              <span className="text-xs text-gray-700">{lastRun}</span>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500">Next Scheduled Run: </span>
              <span className="text-xs text-gray-700">{nextRun}</span>
            </div>
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
            <div className="mb-2 flex items-start gap-2">
              <FontAwesomeIcon icon="fa-solid fa-lightbulb" className="mt-0.5 h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-900">AI Recommendation:</span>
            </div>
            <p className="text-xs text-blue-800">
              "This agent is working efficiently. Consider adding a deadline-based urgency rule."
            </p>
            <button className="mt-3 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
              Accept ▸
            </button>
          </div>
        </div>
      </section>

      {/* STEP 2 — Define Agent Goal */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
          STEP 2 — Define Agent Goal
        </h2>
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-700">What is this agent primarily trying to achieve?</p>
          <div className="space-y-2">
            {/* Role-based goals */}
            {availableGoals.map((goal) => (
              <label
                key={goal.id}
                className={`flex items-center gap-2 rounded-lg border p-3 transition-colors ${
                  selectedGoal === goal.id && !isCustomGoal
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="goal"
                  checked={selectedGoal === goal.id && !isCustomGoal}
                  onChange={() => {
                    setSelectedGoal(goal.id);
                    setIsCustomGoal(false);
                    setCustomGoalText("");
                    setSemanticValidation({ status: null, message: "" });
                  }}
                  className="h-4 w-4 text-indigo-600"
                />
                <span className="text-sm text-gray-900">{goal.label}</span>
              </label>
            ))}

            {/* Custom Goal option */}
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="goal"
                  checked={isCustomGoal}
                  onChange={() => {
                    setIsCustomGoal(true);
                    setSelectedGoal(null);
                  }}
                  className="h-4 w-4 text-indigo-600"
                />
                <span className="text-sm text-gray-900">Custom goal</span>
              </label>
              {isCustomGoal && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={customGoalText}
                    onChange={(e) => handleCustomGoalChange(e.target.value)}
                    placeholder="Describe your custom goal..."
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    rows={3}
                  />
                  {semanticValidation.message && (
                    <div
                      className={`rounded-lg border px-3 py-2 text-xs ${
                        semanticValidation.status === "valid"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-amber-200 bg-amber-50 text-amber-800"
                      }`}
                    >
                      {semanticValidation.message}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Suggested Prompts */}
          {selectedGoalData && !isCustomGoal && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
              <div className="mb-2 text-xs font-semibold text-blue-900">Suggested prompts:</div>
              <ul className="space-y-1">
                {selectedGoalData.suggestedPrompts.map((prompt, index) => (
                  <li key={index} className="flex gap-2 text-xs text-blue-800">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                    <span>{prompt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Note */}
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
            <div className="mb-1 flex items-start gap-2">
              <FontAwesomeIcon icon="fa-solid fa-info-circle" className="mt-0.5 h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-900">AI Note:</span>
            </div>
            <p className="text-xs text-blue-800">
              {isCustomGoal
                ? "Custom goals allow you to define specific objectives. The semantic model will help map your goal to relevant data fields."
                : "This goal aligns with your institution's current bottlenecks."}
            </p>
          </div>
        </div>
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
          </div>
        </div>
      </section>

      {/* STEP 4 — Scope & Population Filters */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
          STEP 4 — Scope & Population Filters
        </h2>
        <div className="space-y-4 border-t border-gray-100 pt-4">
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
            <button className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700">
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
                  Messaging involving deadlines requires approval
                </span>
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

      {/* STEP 6 — Eval Preview (AI Simulation) */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
          STEP 6 — Eval Preview (AI Simulation)
        </h2>
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs font-medium text-gray-500">Eval Score</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">94/100</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs font-medium text-gray-500">Safety Rating</div>
              <div className="mt-1 text-lg font-semibold text-emerald-700">High</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs font-medium text-gray-500">Expected Impact</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">
                22–34% improvement in transcript completion
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
            <span className="text-xs font-medium text-emerald-900">Redundancy Check: </span>
            <span className="text-xs text-emerald-800">Passed</span>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-2 text-sm font-medium text-gray-900">Simulation Example</div>
            <div className="mb-3 space-y-2 text-xs">
              <div>
                <span className="font-medium text-gray-700">Input:</span>
                <div className="mt-1 rounded bg-white px-2 py-1 text-gray-900">
                  "Inactive 8 days + missing transcript + 11-day deadline."
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Agent Reasoning:</span>
                <ol className="ml-4 mt-1 list-decimal space-y-1 text-gray-700">
                  <li>Fetch applicant status</li>
                  <li>Detect missing transcript</li>
                  <li>Assess stall probability</li>
                  <li>Select approved template</li>
                  <li>Run guardrail check</li>
                  <li>Generate reminder draft</li>
                  <li>Queue delivery</li>
                </ol>
              </div>
              <div>
                <span className="font-medium text-gray-700">Eval Result: </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">
                  <FontAwesomeIcon icon="fa-solid fa-check" className="h-3 w-3" />
                  Correct, safe, goal-aligned
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
            <div className="mb-1 flex items-start gap-2">
              <FontAwesomeIcon icon="fa-solid fa-info-circle" className="mt-0.5 h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-900">AI Note:</span>
            </div>
            <p className="text-xs text-blue-800">
              "Adding a deadline urgency modifier could increase impact."
            </p>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Run Now
        </button>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Save Changes
        </button>
      </div>
    </div>
  );
}

