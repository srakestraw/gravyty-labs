/**
 * Agent configuration types
 * Shared types for AI agent configuration across the application
 */

export type AgentPriorityWeight = 1 | 2 | 3 | 4 | 5;

export type AgentStatus = "active" | "paused" | "error" | "draft";

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
  status?: AgentStatus;
  goal?: string;
  priorityWeight: AgentPriorityWeight; // 1 = informational, 5 = critical
  allowOverrideCaps?: boolean; // optional, for future use
  lastRun?: string | null;
  nextRun?: string | null;
}


