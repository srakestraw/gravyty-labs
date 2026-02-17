/**
 * Runner types: execution context, action plans, results.
 * TODO: Queue/worker migration - same types can be used for job payloads.
 */

import type { Agent, FlowDefinition, NarrativeProfile } from "../api-types";
import type { AgentActionLogType, AgentActionLogStatus } from "../api-types";
import type { MessageArtifactChannel, MessageArtifactStatus } from "../api-types";

export type ExecuteMode = "DRY_RUN" | "LIVE";

export interface ExecuteInput {
  agentId: string;
  workspaceId: string;
  mode: ExecuteMode;
  /** For AUTONOMOUS: optional sample person IDs to target. If absent, use mock selector. */
  sampleTargets?: string[];
  /** Idempotency key; if repeated within window, return existing run. */
  idempotencyKey?: string;
}

export interface ExecuteResult {
  runId: string;
  summary: string;
  status: "SUCCESS" | "FAILED" | "PARTIAL";
  counts: {
    drafted: number;
    approvalsCreated: number;
    blocked: number;
    executed: number;
    failed: number;
  };
  logs?: string[];
}

/** Single action to be dispatched (email, sms, webhook, sfmc, task, update_field) */
export interface ActionPlanItem {
  type: AgentActionLogType;
  /** For EMAIL/SMS: personId; for WEBHOOK/SFMC: connector + payload ref */
  targetId?: string;
  personId?: string;
  payload: Record<string, unknown>;
  connectorId?: string;
  requiresApproval: boolean;
  /** Narrative profile used for message actions */
  narrativeProfileId?: string;
  narrativeVersion?: number;
}

/** Result of dispatching one action */
export interface ActionResult {
  actionLogId: string;
  status: AgentActionLogStatus;
  approvalRequestId?: string;
  messageArtifactId?: string;
  error?: string;
}

/** Draft message for EMAIL/SMS (Narrative-constrained) */
export interface DraftMessage {
  channel: MessageArtifactChannel;
  personId: string;
  subject?: string;
  body: string;
  narrativeProfileId: string;
  narrativeVersion: number;
  topicsDetected: string[];
  personalizationFieldsUsed: string[];
  blocked: boolean;
  blockReason?: string;
}

/** Mock record context for flow conditions. TODO: Real event/record ingestion. */
export interface RecordContext {
  personId?: string;
  [key: string]: unknown;
}

/** Runner context passed through execution */
export interface RunnerContext {
  agent: Agent;
  workspaceId: string;
  runId: string;
  mode: ExecuteMode;
  flowDefinition?: FlowDefinition;
  narrativeProfile?: NarrativeProfile;
  recordContexts: RecordContext[];
  /** For AUTONOMOUS: optional sample person IDs to target */
  sampleTargets?: string[];
}
