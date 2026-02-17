/**
 * Agent configuration types
 * Shared types for AI agent configuration across the application
 */

export type AgentPriorityWeight = 1 | 2 | 3 | 4 | 5;

export type AgentStatus = "active" | "paused" | "error" | "draft";

/** Agent type: No-Code Flow Builder vs Autonomous (Agentic) */
export type AgentType = "AUTONOMOUS" | "FLOW";

export type AgentRole =
  | "Admissions"
  | "Registrar"
  | "Student Success"
  | "Career Services"
  | "Alumni Engagement"
  | "Advancement";

export type RoleKey =
  | "admissions"
  | "registrar"
  | "student_success"
  | "career_services"
  | "alumni_engagement"
  | "advancement";

export interface AgentConfig {
  id: string;
  name: string;
  purpose?: string;
  role: AgentRole;
  roleKey?: RoleKey;
  /** Agent type: AUTONOMOUS (Agentic) or FLOW (No-Code). Defaults to AUTONOMOUS when omitted. */
  type?: AgentType;
  status?: AgentStatus;
  goal?: string;
  priorityWeight: AgentPriorityWeight; // 1 = informational, 5 = critical
  allowOverrideCaps?: boolean; // optional, for future use
  lastRun?: string | null;
  nextRun?: string | null;
}

/** Narrative Messaging config for Autonomous agents */
export interface NarrativeMessagingConfig {
  profileId: string;
  tone: string;
  allowedTopics: string[];
  blockedTopics: string[];
  escalationMessage: string;
  personalizationBoundaries: string[];
}

/** Flow Builder definition (nodes + edges, no real execution) */
export interface FlowBuilderNode {
  id: string;
  type: "trigger" | "condition" | "action";
  label: string;
  config?: Record<string, unknown>;
}

export interface FlowBuilderEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface FlowBuilderDefinition {
  nodes: FlowBuilderNode[];
  edges: FlowBuilderEdge[];
}




