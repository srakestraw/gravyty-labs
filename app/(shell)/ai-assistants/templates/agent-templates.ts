import type { AgentType } from "@/lib/agents/types";

/** Workspace scope IDs used in context contract and app context */
export type WorkspaceScopeId = "student_lifecycle_ai" | "advancement_giving_intelligence";

/** Sub-workspace IDs: Student Lifecycle (admissions, registrar, …) or Advancement (pipeline, giving, stewardship) */
export type SubWorkspaceId =
  | "admissions"
  | "registrar"
  | "financial-aid"
  | "bursar"
  | "housing"
  | "student-success"
  | "pipeline"
  | "giving"
  | "stewardship";

export type AgentRole =
  | "Admissions"
  | "Registrar"
  | "Student Success"
  | "Career Services"
  | "Alumni Engagement"
  | "Advancement";

export type TemplateCategory = AgentRole;

export type AgentTemplateKey =
  | "blank"
  | "stalled-applicant-recovery"
  | "missing-document-followup"
  | "melt-prevention"
  | "registration-blocker-resolution"
  | "at-risk-early-warning"
  | "flow-missing-transcript"
  | "flow-registration-hold"
  | "lybunt-recovery"
  | "donor-recovery"
  | "pipeline-stalled-prospect"
  | "stewardship-touch"
  | "giving-campaign-nudge"
  | "flow-donor-follow-up"
  | "flow-major-gift-move";

/** Context contract on each seeded template */
export type TemplateWorkspaceScope = {
  workspace_id: WorkspaceScopeId;
  sub_workspace_ids: SubWorkspaceId[];
};

export type TemplateTrigger =
  | { kind: "event"; event_type: string }
  | { kind: "threshold"; metric: string; operator: string; value?: string }
  | { kind: "schedule"; cron?: string; description?: string }
  | { kind: "model_signal"; signal: string };

export type TemplateNarrativeDependency = {
  uses_narrative_messaging: boolean;
  supported_moments: string[];
  supported_intents: string[];
};

export type TemplateCompliance = {
  pii_tier: "none" | "standard" | "sensitive";
  risk_level: "low" | "medium" | "high";
};

export type AgentTemplateContextContract = {
  category: TemplateCategory;
  agent_type: AgentType;
  workspace_scope: TemplateWorkspaceScope;
  default_voice?: string;
  decision_inputs: string[];
  triggers: TemplateTrigger[];
  allowed_actions: string[];
  narrative_dependency: TemplateNarrativeDependency;
  compliance: TemplateCompliance;
};

export type AgentTemplate = {
  key: AgentTemplateKey;
  role: AgentRole | "All";
  type: AgentType | "All";
  name: string;
  description: string;
  /** Context contract for filtering, badges, and instantiation guardrails */
  contextContract?: AgentTemplateContextContract;
};

const NARRATIVE_YES: TemplateNarrativeDependency = {
  uses_narrative_messaging: true,
  supported_moments: ["deadline_reminder", "document_reminder", "status_change"],
  supported_intents: ["nudge", "remind", "escalate"],
};
const NARRATIVE_NO: TemplateNarrativeDependency = {
  uses_narrative_messaging: false,
  supported_moments: [],
  supported_intents: [],
};

const COMPLIANCE_STANDARD: TemplateCompliance = { pii_tier: "standard", risk_level: "medium" };
const COMPLIANCE_LOW: TemplateCompliance = { pii_tier: "none", risk_level: "low" };
const COMPLIANCE_SENSITIVE: TemplateCompliance = { pii_tier: "sensitive", risk_level: "high" };

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    key: "blank",
    role: "All",
    type: "All",
    name: "Blank Agent",
    description: "Start from scratch with no pre-filled configuration.",
  },
  // —— Student Lifecycle (6) ——
  {
    key: "stalled-applicant-recovery",
    role: "Admissions",
    type: "AUTONOMOUS",
    name: "Stalled Applicant Recovery",
    description: "Identify and re-engage applicants who have stopped progressing.",
    contextContract: {
      category: "Admissions",
      agent_type: "AUTONOMOUS",
      workspace_scope: { workspace_id: "student_lifecycle_ai", sub_workspace_ids: ["admissions"] },
      default_voice: "advisor",
      decision_inputs: ["inactivity", "status_change", "time_to_event"],
      triggers: [{ kind: "threshold", metric: "days_since_activity", operator: "gt", value: "14" }],
      allowed_actions: ["draft_message", "create_task", "write_back", "escalate"],
      narrative_dependency: NARRATIVE_YES,
      compliance: COMPLIANCE_STANDARD,
    },
  },
  {
    key: "missing-document-followup",
    role: "Admissions",
    type: "AUTONOMOUS",
    name: "Transcript Collector Agent",
    description: "Automatically checks SIS for missing transcripts, sends reminders, and updates student records.",
    contextContract: {
      category: "Admissions",
      agent_type: "AUTONOMOUS",
      workspace_scope: { workspace_id: "student_lifecycle_ai", sub_workspace_ids: ["admissions", "registrar"] },
      default_voice: "advisor",
      decision_inputs: ["status_change", "time_to_event"],
      triggers: [{ kind: "event", event_type: "document_required" }, { kind: "schedule", description: "Daily check" }],
      allowed_actions: ["draft_message", "send_message", "create_task", "write_back"],
      narrative_dependency: NARRATIVE_YES,
      compliance: COMPLIANCE_STANDARD,
    },
  },
  {
    key: "melt-prevention",
    role: "Admissions",
    type: "AUTONOMOUS",
    name: "Melt Prevention",
    description: "Monitor admitted-but-not-enrolled students and reduce melt risk.",
    contextContract: {
      category: "Admissions",
      agent_type: "AUTONOMOUS",
      workspace_scope: { workspace_id: "student_lifecycle_ai", sub_workspace_ids: ["admissions"] },
      default_voice: "advisor",
      decision_inputs: ["propensity", "time_to_event", "inactivity"],
      triggers: [{ kind: "model_signal", signal: "melt_risk" }, { kind: "threshold", metric: "days_to_deadline", operator: "lt" }],
      allowed_actions: ["draft_message", "send_message", "create_task", "escalate"],
      narrative_dependency: NARRATIVE_YES,
      compliance: COMPLIANCE_SENSITIVE,
    },
  },
  {
    key: "registration-blocker-resolution",
    role: "Registrar",
    type: "AUTONOMOUS",
    name: "Registration Blocker Resolution Agent",
    description: "Detect registration blockers, notify students, and escalate unresolved items.",
    contextContract: {
      category: "Registrar",
      agent_type: "AUTONOMOUS",
      workspace_scope: { workspace_id: "student_lifecycle_ai", sub_workspace_ids: ["registrar", "financial-aid", "bursar"] },
      default_voice: "advisor",
      decision_inputs: ["status_change", "time_to_event"],
      triggers: [{ kind: "event", event_type: "hold_placed" }, { kind: "schedule", description: "Daily" }],
      allowed_actions: ["draft_message", "send_message", "create_task", "write_back", "escalate"],
      narrative_dependency: NARRATIVE_YES,
      compliance: COMPLIANCE_STANDARD,
    },
  },
  {
    key: "at-risk-early-warning",
    role: "Student Success",
    type: "AUTONOMOUS",
    name: "At-Risk Early Warning",
    description: "Surface students showing early signs of academic or engagement risk.",
    contextContract: {
      category: "Student Success",
      agent_type: "AUTONOMOUS",
      workspace_scope: { workspace_id: "student_lifecycle_ai", sub_workspace_ids: ["student-success"] },
      default_voice: "advisor",
      decision_inputs: ["propensity", "inactivity", "status_change"],
      triggers: [{ kind: "model_signal", signal: "at_risk" }, { kind: "threshold", metric: "lms_inactivity_days", operator: "gt" }],
      allowed_actions: ["create_task", "escalate", "draft_message"],
      narrative_dependency: NARRATIVE_YES,
      compliance: COMPLIANCE_SENSITIVE,
    },
  },
  {
    key: "flow-missing-transcript",
    role: "Admissions",
    type: "FLOW",
    name: "Missing Transcript Flow",
    description: "Rule-based flow for missing transcript reminders and follow-ups.",
    contextContract: {
      category: "Admissions",
      agent_type: "FLOW",
      workspace_scope: { workspace_id: "student_lifecycle_ai", sub_workspace_ids: ["admissions", "registrar"] },
      default_voice: "advisor",
      decision_inputs: ["time_to_event", "status_change"],
      triggers: [{ kind: "event", event_type: "transcript_missing" }, { kind: "schedule", description: "Weekly" }],
      allowed_actions: ["draft_message", "send_message", "create_task"],
      narrative_dependency: NARRATIVE_NO,
      compliance: COMPLIANCE_STANDARD,
    },
  },
  {
    key: "flow-registration-hold",
    role: "Registrar",
    type: "FLOW",
    name: "Registration Hold Flow",
    description: "Automated flow for registration hold notifications and escalations.",
    contextContract: {
      category: "Registrar",
      agent_type: "FLOW",
      workspace_scope: { workspace_id: "student_lifecycle_ai", sub_workspace_ids: ["registrar", "bursar"] },
      default_voice: "advisor",
      decision_inputs: ["status_change"],
      triggers: [{ kind: "event", event_type: "registration_hold" }],
      allowed_actions: ["send_message", "create_task", "escalate"],
      narrative_dependency: NARRATIVE_NO,
      compliance: COMPLIANCE_STANDARD,
    },
  },
  // —— Advancement (6) ——
  {
    key: "lybunt-recovery",
    role: "Advancement",
    type: "AUTONOMOUS",
    name: "Donor Recovery Agent",
    description: "Identifies LYBUNT/SYBUNT donors, triggers outreach, and monitors follow-ups.",
    contextContract: {
      category: "Advancement",
      agent_type: "AUTONOMOUS",
      workspace_scope: { workspace_id: "advancement_giving_intelligence", sub_workspace_ids: ["pipeline", "giving"] },
      default_voice: "gift_officer",
      decision_inputs: ["propensity", "time_to_event", "inactivity"],
      triggers: [{ kind: "event", event_type: "lybunt" }, { kind: "schedule", description: "Fiscal year" }],
      allowed_actions: ["draft_message", "send_message", "create_task", "write_back", "escalate"],
      narrative_dependency: NARRATIVE_YES,
      compliance: COMPLIANCE_SENSITIVE,
    },
  },
  {
    key: "donor-recovery",
    role: "Advancement",
    type: "AUTONOMOUS",
    name: "LYBUNT Recovery",
    description: "Re-engage donors who gave last year but not this year.",
    contextContract: {
      category: "Advancement",
      agent_type: "AUTONOMOUS",
      workspace_scope: { workspace_id: "advancement_giving_intelligence", sub_workspace_ids: ["giving", "pipeline"] },
      default_voice: "gift_officer",
      decision_inputs: ["propensity", "inactivity"],
      triggers: [{ kind: "threshold", metric: "months_since_last_gift", operator: "gte", value: "12" }],
      allowed_actions: ["draft_message", "create_task", "escalate"],
      narrative_dependency: NARRATIVE_YES,
      compliance: COMPLIANCE_SENSITIVE,
    },
  },
  {
    key: "pipeline-stalled-prospect",
    role: "Advancement",
    type: "AUTONOMOUS",
    name: "Pipeline Stalled Prospect",
    description: "Flag high-potential prospects with stalled activity and suggest next steps.",
    contextContract: {
      category: "Advancement",
      agent_type: "AUTONOMOUS",
      workspace_scope: { workspace_id: "advancement_giving_intelligence", sub_workspace_ids: ["pipeline"] },
      default_voice: "gift_officer",
      decision_inputs: ["propensity", "inactivity", "time_to_event"],
      triggers: [{ kind: "model_signal", signal: "stalled_prospect" }, { kind: "threshold", metric: "days_since_contact", operator: "gt" }],
      allowed_actions: ["create_task", "draft_message", "escalate"],
      narrative_dependency: NARRATIVE_YES,
      compliance: COMPLIANCE_STANDARD,
    },
  },
  {
    key: "stewardship-touch",
    role: "Advancement",
    type: "AUTONOMOUS",
    name: "Stewardship Touch Agent",
    description: "Ensure timely thank-yous and stewardship touches after gifts.",
    contextContract: {
      category: "Advancement",
      agent_type: "AUTONOMOUS",
      workspace_scope: { workspace_id: "advancement_giving_intelligence", sub_workspace_ids: ["stewardship", "giving"] },
      default_voice: "gift_officer",
      decision_inputs: ["time_to_event", "status_change"],
      triggers: [{ kind: "event", event_type: "gift_received" }, { kind: "schedule", description: "Daily" }],
      allowed_actions: ["draft_message", "send_message", "create_task"],
      narrative_dependency: NARRATIVE_YES,
      compliance: COMPLIANCE_STANDARD,
    },
  },
  {
    key: "giving-campaign-nudge",
    role: "Advancement",
    type: "AUTONOMOUS",
    name: "Giving Campaign Nudge",
    description: "Nudge likely donors during campaigns based on propensity and past engagement.",
    contextContract: {
      category: "Advancement",
      agent_type: "AUTONOMOUS",
      workspace_scope: { workspace_id: "advancement_giving_intelligence", sub_workspace_ids: ["giving", "pipeline"] },
      default_voice: "gift_officer",
      decision_inputs: ["propensity", "time_to_event"],
      triggers: [{ kind: "event", event_type: "campaign_launch" }, { kind: "schedule", description: "Campaign window" }],
      allowed_actions: ["draft_message", "send_message", "create_task"],
      narrative_dependency: NARRATIVE_YES,
      compliance: COMPLIANCE_SENSITIVE,
    },
  },
  {
    key: "flow-donor-follow-up",
    role: "Advancement",
    type: "FLOW",
    name: "Donor Follow-up Flow",
    description: "Rule-based flow for post-meeting and post-gift follow-up tasks.",
    contextContract: {
      category: "Advancement",
      agent_type: "FLOW",
      workspace_scope: { workspace_id: "advancement_giving_intelligence", sub_workspace_ids: ["pipeline", "stewardship"] },
      default_voice: "gift_officer",
      decision_inputs: ["time_to_event", "status_change"],
      triggers: [{ kind: "event", event_type: "meeting_completed" }, { kind: "event", event_type: "gift_received" }],
      allowed_actions: ["create_task", "draft_message", "send_message"],
      narrative_dependency: NARRATIVE_NO,
      compliance: COMPLIANCE_STANDARD,
    },
  },
  {
    key: "flow-major-gift-move",
    role: "Advancement",
    type: "FLOW",
    name: "Major Gift Move Flow",
    description: "Automated steps when a major-gift prospect moves stage in the pipeline.",
    contextContract: {
      category: "Advancement",
      agent_type: "FLOW",
      workspace_scope: { workspace_id: "advancement_giving_intelligence", sub_workspace_ids: ["pipeline"] },
      default_voice: "gift_officer",
      decision_inputs: ["status_change", "propensity"],
      triggers: [{ kind: "event", event_type: "pipeline_stage_change" }],
      allowed_actions: ["create_task", "escalate", "write_back"],
      narrative_dependency: NARRATIVE_NO,
      compliance: COMPLIANCE_SENSITIVE,
    },
  },
];

/** Resolve current workspace scope from app context (appId + workspaceId) */
export function getWorkspaceScopeFromContext(context: {
  appId?: string;
  workspaceId?: string;
}): { workspaceScopeId: WorkspaceScopeId; subWorkspaceId: string } | null {
  if (!context.appId || !context.workspaceId) return null;
  if (context.appId === "student-lifecycle") {
    return { workspaceScopeId: "student_lifecycle_ai", subWorkspaceId: context.workspaceId };
  }
  if (context.appId === "advancement") {
    return { workspaceScopeId: "advancement_giving_intelligence", subWorkspaceId: context.workspaceId };
  }
  return null;
}

/** Templates that match current workspace (recommended): workspace_id match; sub_workspace match ranks first */
export function getTemplatesForWorkspace(
  context: { appId?: string; workspaceId?: string },
  allTemplates: AgentTemplate[] = AGENT_TEMPLATES
): AgentTemplate[] {
  const scope = getWorkspaceScopeFromContext(context);
  if (!scope) return allTemplates.filter((t) => t.key !== "blank" && t.contextContract);

  const list = allTemplates.filter(
    (t): t is AgentTemplate & { contextContract: AgentTemplateContextContract } =>
      !!t.contextContract && t.key !== "blank"
  );
  const matching = list.filter(
    (t) => t.contextContract.workspace_scope.workspace_id === scope.workspaceScopeId
  );
  const exact = matching.filter((t) =>
    t.contextContract.workspace_scope.sub_workspace_ids.includes(scope.subWorkspaceId as SubWorkspaceId)
  );
  const fallback = matching.filter(
    (t) =>
      !t.contextContract.workspace_scope.sub_workspace_ids.includes(scope.subWorkspaceId as SubWorkspaceId)
  );
  return [...exact, ...fallback];
}

/** Human-readable workspace scope label for badges */
export function workspaceScopeLabel(workspaceId: WorkspaceScopeId): string {
  return workspaceId === "advancement_giving_intelligence" ? "Advancement" : "Student Lifecycle";
}

/** Human-readable sub-workspace label for badges */
export function subWorkspaceLabel(subId: SubWorkspaceId): string {
  const map: Record<SubWorkspaceId, string> = {
    admissions: "Admissions",
    registrar: "Registrar",
    "financial-aid": "Financial Aid",
    bursar: "Bursar",
    housing: "Housing",
    "student-success": "Student Success",
    pipeline: "Pipeline & Portfolio",
    giving: "Giving",
    stewardship: "Stewardship",
  };
  return map[subId] ?? subId;
}

/** Default voice for template instantiation from context */
export function getDefaultVoiceFromContext(context: { appId?: string; defaultVoice?: string }): string {
  if (context.defaultVoice) return context.defaultVoice;
  if (context.appId === "advancement") return "gift_officer";
  return "advisor";
}

/** Whether template is allowed in current workspace (no cross-workspace) */
export function isTemplateAllowedInContext(
  template: AgentTemplate,
  context: { appId?: string; workspaceId?: string }
): boolean {
  const scope = getWorkspaceScopeFromContext(context);
  if (!scope) return true;
  if (!template.contextContract) return true; // blank
  return template.contextContract.workspace_scope.workspace_id === scope.workspaceScopeId;
}

/** Badge: has Decision Intelligence (propensity or time_to_event) */
export function templateHasDecisionIntelligence(template: AgentTemplate): boolean {
  const inputs = template.contextContract?.decision_inputs ?? [];
  return inputs.includes("propensity") || inputs.includes("time_to_event");
}