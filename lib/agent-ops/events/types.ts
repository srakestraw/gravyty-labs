/**
 * Agent-ops real-time event types.
 * No PII: item IDs + minimal metadata only.
 */

export type AgentOpsStreamEventType =
  | "item.created"
  | "item.updated"
  | "item.resolved"
  | "approval.created"
  | "approval.approved"
  | "approval.rejected"
  | "run.updated"
  | "message.updated"
  | "sla.breached";

/** Minimal payload for item events (no message bodies, no PII). */
export interface AgentOpsStreamEventPayload {
  itemId?: string;
  type?: string;
  status?: string;
  severity?: string;
  agentSeverity?: string;
  updatedAt?: string;
  assigneeId?: string | null;
  workspaceId?: string;
  runId?: string;
  approvalRequestId?: string;
  slaStatus?: string;
  /** Count for batch notifications e.g. "3 new approvals" */
  count?: number;
}

export interface AgentOpsStreamEvent {
  event: AgentOpsStreamEventType;
  payload: AgentOpsStreamEventPayload;
  timestamp: string; // ISO
}
