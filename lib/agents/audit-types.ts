/**
 * Audit log model for config changes and outbound actions.
 */

export type AuditActionType =
  | "AGENT_CREATED"
  | "AGENT_UPDATED"
  | "AGENT_ACTIVATED"
  | "AGENT_PAUSED"
  | "NARRATIVE_PROFILE_CREATED"
  | "NARRATIVE_PROFILE_UPDATED"
  | "FLOW_DEFINITION_SAVED"
  | "CONNECTOR_CREATED"
  | "CONNECTOR_UPDATED"
  | "RUN_REQUESTED"
  | "OUTBOUND_ACTION_ATTEMPTED";

export type AuditEntityType =
  | "agent"
  | "narrative_profile"
  | "flow_definition"
  | "connector_webhook"
  | "connector_sfmc"
  | "run"
  | "approval_request";

export interface AuditLogEntry {
  id: string;
  workspaceId: string;
  actorId: string | null;
  actorEmail?: string;
  actionType: AuditActionType;
  entityType: AuditEntityType;
  entityId: string;
  timestamp: string;
  diffSummary?: string;
  metadata?: Record<string, unknown>;
}
