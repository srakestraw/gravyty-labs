/**
 * API and persistence data models for Agents.
 * Used by API routes and store; UI may map to/from these for display.
 */

/** Multi-tenant boundary: org / campus / department. */
export interface Boundary {
  orgId: string;
  campusId?: string;
  departmentId?: string;
}

export type AgentType = "AUTONOMOUS" | "FLOW";

export type AgentStatus = "ACTIVE" | "PAUSED" | "ERROR" | "DRAFT";

export interface AgentScheduling {
  cadence?: string;
  nextRunAt?: string;
}

export interface AgentScope {
  programTerm?: string;
  filters?: string[];
}

export interface AgentGuardrails {
  messagingLimits?: { maxPerDay?: number };
  quietHours?: { start?: string; end?: string };
  approvals?: string[];
}

/** Capability-scoped tool config: webhook push (allowlist connectors only) */
export interface AgentToolWebhook {
  enabled: boolean;
  requiresApproval: boolean;
  capabilities: ("push_payload")[];
  connectorId?: string;
  allowedEvents?: string[];
}

/** Capability-scoped tool config: Salesforce Marketing Cloud */
export interface AgentToolSfmc {
  enabled: boolean;
  requiresApproval: boolean;
  capabilities: ("upsert_data_extension" | "trigger_journey")[];
  connectorId?: string;
  allowlist?: { journeys?: string[]; dataExtensions?: string[] };
}

export interface AgentTools {
  email?: { enabled?: boolean; requiresApproval?: boolean; mode?: string; templateId?: string; capabilities?: string[] };
  sms?: { enabled?: boolean; requiresApproval?: boolean; mode?: string; capabilities?: string[] };
  webhook?: AgentToolWebhook;
  sfmc?: AgentToolSfmc;
}

export interface AgentNarrative {
  profileId: string;
  overrides?: {
    tone?: string;
    allowedTopics?: string[];
    blockedTopics?: string[];
    escalationMessage?: string;
    allowedPersonalizationFields?: string[];
  };
}

export interface AgentFlowRef {
  definitionId: string;
  version: number;
}

/** Rate limiting and auto-pause policy (Trust + Operability) */
export interface AgentRateLimits {
  maxActionsPerHour?: number;
  maxMessagesPerDay?: number;
  maxErrorsPerHour?: number;
  autoPauseOnErrorSpike?: boolean;
  errorSpikeThreshold?: number;
}

export interface Agent {
  id: string;
  workspaceId: string;
  role: string;
  type: AgentType;
  name: string;
  purpose: string;
  status: AgentStatus;
  scheduling?: AgentScheduling;
  scope?: AgentScope;
  guardrails?: AgentGuardrails;
  tools?: AgentTools;
  narrative?: AgentNarrative;
  flow?: AgentFlowRef;
  rateLimits?: AgentRateLimits;
  boundary?: Boundary;
  createdAt: string;
  updatedAt: string;
}

export interface NarrativeProfile {
  id: string;
  name: string;
  workspaceId: string;
  tone: string;
  allowedTopics: string[];
  blockedTopics: string[];
  escalationMessage: string;
  allowedPersonalizationFields: string[];
  version: number;
  boundary?: Boundary;
  createdAt: string;
  updatedAt: string;
}

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

export interface FlowDefinition {
  id: string;
  agentId: string;
  workspaceId: string;
  version: number;
  nodes: FlowBuilderNode[];
  edges: FlowBuilderEdge[];
  boundary?: Boundary;
  createdAt: string;
}

export type AgentRunStatus = "SUCCESS" | "FAILED" | "PARTIAL";

export interface AgentRun {
  id: string;
  agentId: string;
  workspaceId: string;
  startedAt: string;
  finishedAt?: string;
  status: AgentRunStatus;
  summary: string;
  metrics?: { messagesSent?: number; tasksCreated?: number };
  logs?: string[];
  boundary?: Boundary;
}

/** Request/response shapes for API */
export type CreateAgentBody = Omit<Agent, "id" | "createdAt" | "updatedAt"> & { id?: string };

export type UpdateAgentBody = Partial<Omit<Agent, "id" | "workspaceId" | "createdAt">>;

export type CreateNarrativeProfileBody = Omit<NarrativeProfile, "id" | "version" | "createdAt" | "updatedAt">;

export type UpdateNarrativeProfileBody = Partial<Omit<NarrativeProfile, "id" | "workspaceId" | "version" | "createdAt">>;

export type CreateFlowDefinitionBody = Omit<FlowDefinition, "id" | "version" | "createdAt">;

/** Narrative profile version history (snapshot before each update) */
export interface NarrativeProfileVersion {
  id: string;
  profileId: string;
  workspaceId: string;
  version: number;
  snapshotJson: string;
  createdAt: string;
  actorId?: string;
}

/** Explainability event kinds for autonomous decisions */
export type ExplainabilityKind =
  | "SELECTION_RATIONALE"
  | "MESSAGE_RATIONALE"
  | "ACTION_RATIONALE"
  | "GUARDRAIL_TRIGGERED";

export interface AgentExplainabilityEvent {
  id: string;
  agentId: string;
  workspaceId: string;
  runId?: string;
  personId?: string;
  timestamp: string;
  kind: ExplainabilityKind;
  summary: string;
  detailsJson: string;
}

/** Golden test case for regression eval harness */
export interface AgentTestCaseExpectedChecks {
  expectedBlockedTopics?: string[];
  expectedAllowedTopics?: string[];
  requiresApproval?: boolean;
  allowedPersonalizationFieldsUsedOnly?: boolean;
  expectedOutcome: "PASS" | "FAIL";
}

export interface AgentTestCase {
  id: string;
  agentId: string;
  workspaceId: string;
  name: string;
  inputContextJson: string;
  expectedChecksJson: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentTestCaseResult {
  testCaseId: string;
  runAt: string;
  outcome: "PASS" | "FAIL";
  expectedChecks: AgentTestCaseExpectedChecks;
  actualChecks?: Record<string, unknown>;
  diff?: string;
}

/** Action log for execution runner (email, sms, webhook, sfmc, task, update_field) */
export type AgentActionLogType =
  | "EMAIL"
  | "SMS"
  | "WEBHOOK"
  | "SFMC"
  | "TASK"
  | "UPDATE_FIELD";

export type AgentActionLogStatus =
  | "DRAFTED"
  | "PENDING_APPROVAL"
  | "EXECUTED"
  | "FAILED"
  | "BLOCKED";

export interface AgentActionLog {
  id: string;
  agentId: string;
  workspaceId: string;
  runId: string;
  timestamp: string;
  actionType: AgentActionLogType;
  status: AgentActionLogStatus;
  payloadRedactedJson: string;
  connectorId?: string;
  approvalRequestId?: string;
  error?: string;
}

/** Drafted message artifact (Narrative-constrained) */
export type MessageArtifactChannel = "EMAIL" | "SMS";

export type MessageArtifactStatus = "DRAFT" | "APPROVED" | "SENT" | "BLOCKED";

export interface MessageArtifact {
  id: string;
  agentId: string;
  workspaceId: string;
  runId: string;
  personId: string;
  channel: MessageArtifactChannel;
  subject?: string;
  body: string;
  narrativeProfileId: string;
  narrativeVersion: number;
  topicsDetected: string[];
  personalizationFieldsUsed: string[];
  status: MessageArtifactStatus;
  createdAt: string;
}
