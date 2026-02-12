export type AgentRole =
  | "Admissions"
  | "Registrar"
  | "Student Success"
  | "Career Services"
  | "Alumni Engagement"
  | "Advancement";

export type AgentOpsItemType =
  | "Error"
  | "Guardrail"
  | "QuietHours"
  | "FrequencyCap"
  | "DoNotEngage"
  | "HumanReview"
  | "Escalation"
  | "Task"
  | "OnHold"
  // Agent-generated queue items (drafts, approvals, blocked, exceptions)
  | "AGENT_DRAFT_MESSAGE"
  | "AGENT_APPROVAL_REQUIRED"
  | "AGENT_BLOCKED_ACTION"
  | "AGENT_FLOW_EXCEPTION";

export type AgentOpsSeverity = "Low" | "Medium" | "High" | "Critical";
export type AgentOpsStatus = "Open" | "Snoozed" | "InProgress" | "Resolved";

export interface AgentOpsPersonRef {
  id: string;
  name: string;
  email?: string;
  externalId?: string;
  primaryRole?: AgentRole;
}

/** Severity for agent-generated items (INFO/WARN/ERROR). */
export type AgentOpsAgentSeverity = "INFO" | "WARN" | "ERROR";

/** Status for agent queue items (OPEN/RESOLVED). Maps to AgentOpsStatus in practice. */
export type AgentOpsAgentStatus = "OPEN" | "RESOLVED";

export type AgentOpsSlaStatus = "ON_TRACK" | "AT_RISK" | "BREACHED";

export interface AgentOpsItem {
  id: string;
  type: AgentOpsItemType;
  severity: AgentOpsSeverity;
  status: AgentOpsStatus;

  title: string;
  summary: string;

  person?: AgentOpsPersonRef;
  agentId?: string;
  agentName?: string;
  /** Run that produced this item (agent-generated types). */
  runId?: string;
  /** Agent severity for agent-generated items (INFO/WARN/ERROR). */
  agentSeverity?: AgentOpsAgentSeverity;

  role?: AgentRole;
  sourceSystem?: string;

  createdAt: string;
  updatedAt?: string;
  slaDueAt?: string;
  /** Optional explicit due time (used for SLA calculation). */
  dueAt?: string;
  /** SLA status: ON_TRACK | AT_RISK | BREACHED. Computed from dueAt + type defaults. */
  slaStatus?: AgentOpsSlaStatus;

  createdBy?: "agent" | "system" | "human";
  assignedTo?: string;
  tags?: string[];

  evalId?: string;
  guardrailId?: string;

  // Optional fields for custom detail views (Advancement Pipeline only)
  detailView?: 'default' | 'first-draft';
  /** Payload for detail renderers; redacted in list context. */
  payload?: Record<string, unknown>;
}

export interface AgentOpsFilters {
  role: AgentRole | "All";
  status: AgentOpsStatus | "All";
  type: AgentOpsItemType | "All";
  severity: AgentOpsSeverity | "All";
  assignee: "Me" | "Unassigned" | "All";
  search: string;
}

