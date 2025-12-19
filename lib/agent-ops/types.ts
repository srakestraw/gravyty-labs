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
  | "OnHold";

export type AgentOpsSeverity = "Low" | "Medium" | "High" | "Critical";
export type AgentOpsStatus = "Open" | "Snoozed" | "InProgress" | "Resolved";

export interface AgentOpsPersonRef {
  id: string;
  name: string;
  email?: string;
  externalId?: string;
  primaryRole?: AgentRole;
}

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

  role?: AgentRole;
  sourceSystem?: string;

  createdAt: string;
  updatedAt?: string;
  slaDueAt?: string;

  createdBy?: "agent" | "system" | "human";
  assignedTo?: string;
  tags?: string[];

  evalId?: string;
  guardrailId?: string;

  // Optional fields for custom detail views (Advancement Pipeline only)
  detailView?: 'default' | 'first-draft';
  payload?: Record<string, any>;
}

export interface AgentOpsFilters {
  role: AgentRole | "All";
  status: AgentOpsStatus | "All";
  type: AgentOpsItemType | "All";
  severity: AgentOpsSeverity | "All";
  assignee: "Me" | "Unassigned" | "All";
  search: string;
}

