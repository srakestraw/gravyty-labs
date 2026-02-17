/**
 * In-memory store for Agents, Narrative Profiles, Flow Definitions, Runs,
 * Version History, Explainability, and Test Cases.
 * TODO: Replace with DB (Prisma/Postgres) or external API.
 */

import type {
  Agent,
  NarrativeProfile,
  NarrativeProfileVersion,
  FlowDefinition,
  FlowBuilderNode,
  FlowBuilderEdge,
  AgentRun,
  AgentExplainabilityEvent,
  AgentTestCase,
  AgentTestCaseResult,
  AgentRateLimits,
  AgentActionLog,
  MessageArtifact,
  Boundary,
} from "./api-types";
import type { AuditLogEntry, AuditEntityType } from "./audit-types";
import type { WebhookConnector, SfmcConnector } from "./connectors-types";
import type { ComplianceRegistryEntry, ComplianceControlId, ComplianceStatus } from "./compliance-types";
import { MOCK_AGENTS } from "./mock-data";

export type ApprovalRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export interface ApprovalRequest {
  id: string;
  workspaceId: string;
  agentId: string;
  runId?: string;
  actionType: string;
  payloadPreview: string;
  status: ApprovalRequestStatus;
  reviewerId?: string | null;
  boundary?: Boundary;
  createdAt: string;
  updatedAt: string;
}

const now = () => new Date().toISOString();
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// --- In-memory maps (preserve seeded agent IDs) ---
const agents = new Map<string, Agent>();
const narrativeProfiles = new Map<string, NarrativeProfile>();
const narrativeProfileVersions: NarrativeProfileVersion[] = [];
const flowDefinitions = new Map<string, FlowDefinition>();
const flowDefinitionVersionsByAgent = new Map<string, FlowDefinition[]>();
const agentRuns: AgentRun[] = [];
const explainabilityEvents: AgentExplainabilityEvent[] = [];
const agentTestCases = new Map<string, AgentTestCase>();
const agentTestCaseResults: AgentTestCaseResult[] = [];
const auditLogs: AuditLogEntry[] = [];
const webhookConnectors = new Map<string, WebhookConnector>();
const sfmcConnectors = new Map<string, SfmcConnector>();
const approvalRequests: ApprovalRequest[] = [];
const agentActionLogs: AgentActionLog[] = [];
const messageArtifacts: MessageArtifact[] = [];

function seedAgents() {
  const statusMap = { active: "ACTIVE" as const, paused: "PAUSED" as const, error: "ERROR" as const };
  MOCK_AGENTS.forEach((m) => {
    agents.set(m.id, {
      id: m.id,
      workspaceId: "admissions",
      role: m.role,
      type: m.type,
      name: m.name,
      purpose: m.purpose,
      status: statusMap[(m.status as "active" | "paused" | "error")] ?? "ACTIVE",
      scheduling: {},
      narrative: m.narrativeConfig
        ? {
            profileId: m.narrativeConfig.profileId,
            overrides: {
              tone: m.narrativeConfig.tone,
              allowedTopics: m.narrativeConfig.allowedTopics,
              blockedTopics: m.narrativeConfig.blockedTopics,
              escalationMessage: m.narrativeConfig.escalationMessage,
              allowedPersonalizationFields: m.narrativeConfig.personalizationBoundaries,
            },
          }
        : undefined,
      flow: undefined,
      rateLimits: {
        maxActionsPerHour: 100,
        maxMessagesPerDay: 50,
        maxErrorsPerHour: 10,
        autoPauseOnErrorSpike: true,
        errorSpikeThreshold: 5,
      },
      createdAt: now(),
      updatedAt: now(),
    });
  });
  // Seed registrar workspace agents
  ["agent-registration-requirements", "agent-flow-registration-hold"].forEach((aid) => {
    const a = agents.get(aid);
    if (a) {
      const copy = { ...a, workspaceId: "registrar" as const };
      agents.set(`${aid}-registrar`, { ...copy, id: `${aid}-registrar` });
    }
  });
}

function seedNarrativeProfiles() {
  const list = [
    { id: "profile-admissions-reminder", name: "Admissions Reminder", workspaceId: "admissions", tone: "Warm", allowedTopics: ["Deadlines", "Documents"], blockedTopics: ["Financial aid"], escalationMessage: "Please contact your admissions counselor.", allowedPersonalizationFields: ["First name", "Deadline date", "Document name"] },
    { id: "profile-registrar-compliance", name: "Registrar Compliance", workspaceId: "admissions", tone: "Professional", allowedTopics: ["Holds", "Documents", "Enrollment"], blockedTopics: [], escalationMessage: "For questions about your hold, visit the Registrar office.", allowedPersonalizationFields: ["First name", "Document name", "Institution name"] },
    { id: "profile-student-success-support", name: "Student Success Support", workspaceId: "admissions", tone: "Supportive", allowedTopics: ["Academic progress", "Events"], blockedTopics: [], escalationMessage: "", allowedPersonalizationFields: ["First name", "Program name"] },
  ];
  list.forEach((p) => {
    const profile: NarrativeProfile = {
      ...p,
      version: 1,
      createdAt: now(),
      updatedAt: now(),
    };
    narrativeProfiles.set(p.id, profile);
    narrativeProfileVersions.push({
      id: id(),
      profileId: p.id,
      workspaceId: p.workspaceId,
      version: 1,
      snapshotJson: JSON.stringify(profile, null, 2),
      createdAt: now(),
      actorId: "seed",
    });
  });
}

function seedFlowDefinitions() {
  const flowAgents = MOCK_AGENTS.filter((a) => a.type === "FLOW");
  flowAgents.forEach((m) => {
    if (!m.flowDefinition) return;
    const defId = `fd-${m.id}`;
    const def: FlowDefinition = {
      id: defId,
      agentId: m.id,
      workspaceId: "admissions",
      version: 1,
      nodes: m.flowDefinition.nodes as FlowBuilderNode[],
      edges: m.flowDefinition.edges as FlowBuilderEdge[],
      createdAt: now(),
    };
    flowDefinitions.set(defId, def);
    flowDefinitionVersionsByAgent.set(m.id, [def]);
  });
}

let seeded = false;
function ensureSeed() {
  if (seeded) return;
  seeded = true;
  seedAgents();
  seedNarrativeProfiles();
  seedFlowDefinitions();
}

// --- Agents ---
export function listAgents(workspaceId: string): Agent[] {
  ensureSeed();
  return Array.from(agents.values()).filter((a) => a.workspaceId === workspaceId);
}

export function getAgent(id: string): Agent | undefined {
  ensureSeed();
  return agents.get(id);
}

export function createAgent(body: Omit<Agent, "createdAt" | "updatedAt">): Agent {
  ensureSeed();
  const agent: Agent = {
    ...body,
    id: body.id ?? id(),
    createdAt: now(),
    updatedAt: now(),
  };
  agents.set(agent.id, agent);
  return agent;
}

export function updateAgent(id: string, body: Partial<Omit<Agent, "id" | "workspaceId" | "createdAt">>): Agent | undefined {
  ensureSeed();
  const existing = agents.get(id);
  if (!existing) return undefined;
  const updated: Agent = { ...existing, ...body, updatedAt: now() };
  agents.set(id, updated);
  return updated;
}

// --- Narrative profiles ---
export function listNarrativeProfiles(workspaceId: string): NarrativeProfile[] {
  ensureSeed();
  return Array.from(narrativeProfiles.values()).filter((p) => p.workspaceId === workspaceId);
}

export function getNarrativeProfile(profileId: string): NarrativeProfile | undefined {
  ensureSeed();
  return narrativeProfiles.get(profileId);
}

export function createNarrativeProfile(body: Omit<NarrativeProfile, "id" | "version" | "createdAt" | "updatedAt">): NarrativeProfile {
  ensureSeed();
  const profile: NarrativeProfile = {
    ...body,
    id: id(),
    version: 1,
    createdAt: now(),
    updatedAt: now(),
  };
  narrativeProfiles.set(profile.id, profile);
  narrativeProfileVersions.push({
    id: id(),
    profileId: profile.id,
    workspaceId: profile.workspaceId,
    version: 1,
    snapshotJson: JSON.stringify(profile, null, 2),
    createdAt: now(),
  });
  return profile;
}

export function updateNarrativeProfile(profileId: string, body: Partial<Omit<NarrativeProfile, "id" | "workspaceId" | "version" | "createdAt">>, actorId?: string): NarrativeProfile | undefined {
  ensureSeed();
  const existing = narrativeProfiles.get(profileId);
  if (!existing) return undefined;
  narrativeProfileVersions.push({
    id: id(),
    profileId: profileId,
    workspaceId: existing.workspaceId,
    version: existing.version,
    snapshotJson: JSON.stringify(existing, null, 2),
    createdAt: now(),
    actorId,
  });
  const updated: NarrativeProfile = {
    ...existing,
    ...body,
    version: existing.version + 1,
    updatedAt: now(),
  };
  narrativeProfiles.set(profileId, updated);
  return updated;
}

export function listNarrativeProfileVersions(profileId: string): NarrativeProfileVersion[] {
  return narrativeProfileVersions.filter((v) => v.profileId === profileId).sort((a, b) => b.version - a.version);
}

export function rollbackNarrativeProfile(profileId: string, version: number, actorId?: string): NarrativeProfile | undefined {
  const versions = listNarrativeProfileVersions(profileId);
  const target = versions.find((v) => v.version === version);
  if (!target) return undefined;
  const snapshot = JSON.parse(target.snapshotJson) as NarrativeProfile;
  const updated: NarrativeProfile = {
    ...snapshot,
    id: profileId,
    workspaceId: snapshot.workspaceId,
    version: (getNarrativeProfile(profileId)?.version ?? 0) + 1,
    updatedAt: now(),
  };
  narrativeProfiles.set(profileId, updated);
  narrativeProfileVersions.push({
    id: id(),
    profileId,
    workspaceId: updated.workspaceId,
    version: updated.version,
    snapshotJson: JSON.stringify(updated, null, 2),
    createdAt: now(),
    actorId,
  });
  return updated;
}

// --- Flow definitions (versioned) ---
export function listFlowDefinitionsByAgent(agentId: string): FlowDefinition[] {
  ensureSeed();
  return flowDefinitionVersionsByAgent.get(agentId) ?? [];
}

export function getFlowDefinition(definitionId: string, version?: number): FlowDefinition | undefined {
  ensureSeed();
  const def = flowDefinitions.get(definitionId);
  if (!def) return undefined;
  if (version != null && def.version !== version) {
    const byAgent = flowDefinitionVersionsByAgent.get(def.agentId) ?? [];
    return byAgent.find((d) => d.version === version);
  }
  return def;
}

export function createFlowDefinitionVersion(agentId: string, workspaceId: string, nodes: FlowBuilderNode[], edges: FlowBuilderEdge[]): FlowDefinition {
  ensureSeed();
  const versions = flowDefinitionVersionsByAgent.get(agentId) ?? [];
  const nextVersion = versions.length ? Math.max(...versions.map((v) => v.version)) + 1 : 1;
  const def: FlowDefinition = {
    id: `fd-${agentId}-v${nextVersion}`,
    agentId,
    workspaceId,
    version: nextVersion,
    nodes,
    edges,
    createdAt: now(),
  };
  flowDefinitions.set(def.id, def);
  flowDefinitionVersionsByAgent.set(agentId, [...versions, def]);
  return def;
}

export function listFlowDefinitionVersions(agentId: string): FlowDefinition[] {
  const list = flowDefinitionVersionsByAgent.get(agentId) ?? [];
  return [...list].sort((a, b) => b.version - a.version);
}

export function rollbackFlowDefinition(agentId: string, version: number): FlowDefinition | undefined {
  const versions = listFlowDefinitionVersions(agentId);
  const target = versions.find((v) => v.version === version);
  if (!target) return undefined;
  return createFlowDefinitionVersion(agentId, target.workspaceId, target.nodes, target.edges);
}

// --- Agent runs ---
export function createAgentRun(
  agentId: string,
  workspaceId: string,
  status: AgentRun["status"],
  summary: string,
  metrics?: AgentRun["metrics"],
  logs?: string[],
  boundary?: Boundary
): AgentRun {
  const run: AgentRun = {
    id: id(),
    agentId,
    workspaceId,
    startedAt: now(),
    finishedAt: now(),
    status,
    summary,
    metrics,
    logs,
    boundary,
  };
  agentRuns.push(run);
  return run;
}

export function listAgentRuns(agentId: string, limit = 50): AgentRun[] {
  return agentRuns
    .filter((r) => r.agentId === agentId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, limit);
}

export function getAgentRun(runId: string): AgentRun | undefined {
  return agentRuns.find((r) => r.id === runId);
}

export function updateAgentRun(
  runId: string,
  updates: Partial<Pick<AgentRun, "status" | "summary" | "metrics" | "logs" | "finishedAt">>
): AgentRun | undefined {
  const run = agentRuns.find((r) => r.id === runId);
  if (!run) return undefined;
  if (updates.finishedAt !== undefined) run.finishedAt = updates.finishedAt;
  if (updates.status !== undefined) run.status = updates.status;
  if (updates.summary !== undefined) run.summary = updates.summary;
  if (updates.metrics !== undefined) run.metrics = { ...run.metrics, ...updates.metrics };
  if (updates.logs !== undefined) run.logs = updates.logs;
  return run;
}

// --- Explainability ---
export function createExplainabilityEvent(
  agentId: string,
  workspaceId: string,
  kind: AgentExplainabilityEvent["kind"],
  summary: string,
  details: Record<string, unknown>,
  runId?: string,
  personId?: string
): AgentExplainabilityEvent {
  const ev: AgentExplainabilityEvent = {
    id: id(),
    agentId,
    workspaceId,
    runId,
    personId,
    timestamp: now(),
    kind,
    summary,
    detailsJson: JSON.stringify(details),
  };
  explainabilityEvents.push(ev);
  return ev;
}

export function listExplainabilityEvents(agentId: string, runId?: string, limit = 20): AgentExplainabilityEvent[] {
  let list = explainabilityEvents.filter((e) => e.agentId === agentId);
  if (runId) list = list.filter((e) => e.runId === runId);
  return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
}

// --- Test cases ---
export function listAgentTestCases(agentId: string): AgentTestCase[] {
  return Array.from(agentTestCases.values()).filter((t) => t.agentId === agentId);
}

export function getAgentTestCase(testCaseId: string): AgentTestCase | undefined {
  return agentTestCases.get(testCaseId);
}

export function createAgentTestCase(agentId: string, workspaceId: string, name: string, inputContextJson: string, expectedChecksJson: string): AgentTestCase {
  const tc: AgentTestCase = {
    id: id(),
    agentId,
    workspaceId,
    name,
    inputContextJson,
    expectedChecksJson,
    createdAt: now(),
    updatedAt: now(),
  };
  agentTestCases.set(tc.id, tc);
  return tc;
}

export function updateAgentTestCase(testCaseId: string, body: Partial<Pick<AgentTestCase, "name" | "inputContextJson" | "expectedChecksJson">>): AgentTestCase | undefined {
  const existing = agentTestCases.get(testCaseId);
  if (!existing) return undefined;
  const updated = { ...existing, ...body, updatedAt: now() };
  agentTestCases.set(testCaseId, updated);
  return updated;
}

export function saveAgentTestCaseResult(result: AgentTestCaseResult): void {
  agentTestCaseResults.push(result);
}

export function getAgentTestCaseResults(testCaseId: string, limit = 10): AgentTestCaseResult[] {
  return agentTestCaseResults
    .filter((r) => r.testCaseId === testCaseId)
    .sort((a, b) => b.runAt.localeCompare(a.runAt))
    .slice(0, limit);
}

// --- Metrics (aggregation) ---
export function getAgentMetrics(agentId: string, range: "7d" | "30d" = "7d") {
  const since = range === "7d" ? Date.now() - 7 * 24 * 60 * 60 * 1000 : Date.now() - 30 * 24 * 60 * 60 * 1000;
  const sinceStr = new Date(since).toISOString();
  const runs = agentRuns.filter((r) => r.agentId === agentId && r.startedAt >= sinceStr);
  const success = runs.filter((r) => r.status === "SUCCESS").length;
  const total = runs.length;
  let messagesSent = 0;
  runs.forEach((r) => {
    messagesSent += r.metrics?.messagesSent ?? 0;
  });
  const guardrailEvents = explainabilityEvents.filter((e) => e.agentId === agentId && e.kind === "GUARDRAIL_TRIGGERED" && e.timestamp >= sinceStr);
  return {
    runsLast7d: range === "7d" ? total : undefined,
    runsLast30d: range === "30d" ? total : undefined,
    successRateLast30d: total ? Math.round((success / total) * 100) : 0,
    messagesSentLast7d: range === "7d" ? messagesSent : undefined,
    messagesSentLast30d: range === "30d" ? messagesSent : undefined,
    blockedActionsLast7d: range === "7d" ? guardrailEvents.length : undefined,
    approvalsLast7d: 0, // TODO: from ApprovalRequests when wired
  };
}

// --- Rate limit check and auto-pause ---
export function checkRateLimitsAndMaybePause(agentId: string): { allowed: boolean; reason?: string } {
  const agent = agents.get(agentId);
  if (!agent?.rateLimits) return { allowed: true };
  const rl = agent.rateLimits;
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const recentRuns = agentRuns.filter((r) => r.agentId === agentId && r.startedAt >= oneHourAgo);
  const errorsLastHour = recentRuns.filter((r) => r.status === "FAILED").length;
  const actionsLastHour = recentRuns.length;
  const runsLastDay = agentRuns.filter((r) => r.agentId === agentId && r.startedAt >= oneDayAgo);
  let messagesLastDay = 0;
  runsLastDay.forEach((r) => {
    messagesLastDay += r.metrics?.messagesSent ?? 0;
  });

  if (rl.maxActionsPerHour != null && actionsLastHour >= rl.maxActionsPerHour) {
    return { allowed: false, reason: `maxActionsPerHour (${rl.maxActionsPerHour}) exceeded` };
  }
  if (rl.maxMessagesPerDay != null && messagesLastDay >= rl.maxMessagesPerDay) {
    return { allowed: false, reason: `maxMessagesPerDay (${rl.maxMessagesPerDay}) exceeded` };
  }
  if (rl.maxErrorsPerHour != null && errorsLastHour >= rl.maxErrorsPerHour) {
    if (rl.autoPauseOnErrorSpike && (rl.errorSpikeThreshold ?? 0) <= errorsLastHour) {
      updateAgent(agentId, { status: "PAUSED" });
      createExplainabilityEvent(agentId, agent.workspaceId, "GUARDRAIL_TRIGGERED", "Agent auto-paused due to error spike", {
        errorsLastHour,
        threshold: rl.errorSpikeThreshold,
      });
    }
    return { allowed: false, reason: `maxErrorsPerHour (${rl.maxErrorsPerHour}) exceeded` };
  }
  return { allowed: true };
}

// --- Audit ---
export function appendAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">): AuditLogEntry {
  const e: AuditLogEntry = {
    ...entry,
    id: id(),
    timestamp: now(),
  };
  auditLogs.push(e);
  return e;
}

export function listAuditLogs(
  workspaceId: string,
  opts?: { entityType?: AuditEntityType; entityId?: string; limit?: number }
): AuditLogEntry[] {
  let list = auditLogs.filter((a) => a.workspaceId === workspaceId);
  if (opts?.entityType) list = list.filter((a) => a.entityType === opts.entityType);
  if (opts?.entityId) list = list.filter((a) => a.entityId === opts.entityId);
  return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, opts?.limit ?? 50);
}

// --- Webhook connectors ---
export function listWebhookConnectors(workspaceId: string): WebhookConnector[] {
  return Array.from(webhookConnectors.values()).filter((c) => c.workspaceId === workspaceId);
}
export function getWebhookConnector(connectorId: string): WebhookConnector | undefined {
  return webhookConnectors.get(connectorId);
}
export function createWebhookConnector(body: Omit<WebhookConnector, "id" | "createdAt" | "updatedAt">): WebhookConnector {
  const c: WebhookConnector = {
    ...body,
    id: id(),
    createdAt: now(),
    updatedAt: now(),
  };
  webhookConnectors.set(c.id, c);
  return c;
}
export function updateWebhookConnector(connectorId: string, body: Partial<Omit<WebhookConnector, "id" | "workspaceId" | "createdAt">>): WebhookConnector | undefined {
  const existing = webhookConnectors.get(connectorId);
  if (!existing) return undefined;
  const updated = { ...existing, ...body, updatedAt: now() };
  webhookConnectors.set(connectorId, updated);
  return updated;
}

// --- SFMC connectors ---
export function listSfmcConnectors(workspaceId: string): SfmcConnector[] {
  return Array.from(sfmcConnectors.values()).filter((c) => c.workspaceId === workspaceId);
}
export function getSfmcConnector(connectorId: string): SfmcConnector | undefined {
  return sfmcConnectors.get(connectorId);
}
export function createSfmcConnector(body: Omit<SfmcConnector, "id" | "createdAt" | "updatedAt">): SfmcConnector {
  const c: SfmcConnector = {
    ...body,
    id: id(),
    createdAt: now(),
    updatedAt: now(),
  };
  sfmcConnectors.set(c.id, c);
  return c;
}
export function updateSfmcConnector(connectorId: string, body: Partial<Omit<SfmcConnector, "id" | "workspaceId" | "createdAt">>): SfmcConnector | undefined {
  const existing = sfmcConnectors.get(connectorId);
  if (!existing) return undefined;
  const updated = { ...existing, ...body, updatedAt: now() };
  sfmcConnectors.set(connectorId, updated);
  return updated;
}

// --- Approval requests ---
export function createApprovalRequest(
  workspaceId: string,
  agentId: string,
  actionType: string,
  payloadPreview: string,
  runId?: string,
  boundary?: Boundary
): ApprovalRequest {
  const r: ApprovalRequest = {
    id: id(),
    workspaceId,
    agentId,
    runId,
    actionType,
    payloadPreview,
    status: "PENDING",
    boundary,
    createdAt: now(),
    updatedAt: now(),
  };
  approvalRequests.push(r);
  return r;
}
export function listApprovalRequests(workspaceId: string, status?: ApprovalRequestStatus): ApprovalRequest[] {
  let list = approvalRequests.filter((r) => r.workspaceId === workspaceId);
  if (status) list = list.filter((r) => r.status === status);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function getApprovalRequest(id: string): ApprovalRequest | undefined {
  return approvalRequests.find((r) => r.id === id);
}
export function approveApprovalRequest(id: string, reviewerId: string): ApprovalRequest | undefined {
  const r = approvalRequests.find((x) => x.id === id);
  if (!r || r.status !== "PENDING") return undefined;
  r.status = "APPROVED";
  r.reviewerId = reviewerId;
  r.updatedAt = now();
  return r;
}
export function rejectApprovalRequest(id: string, reviewerId: string): ApprovalRequest | undefined {
  const r = approvalRequests.find((x) => x.id === id);
  if (!r || r.status !== "PENDING") return undefined;
  r.status = "REJECTED";
  r.reviewerId = reviewerId;
  r.updatedAt = now();
  return r;
}
export function listApprovalRequestsByAgent(agentId: string, status?: ApprovalRequestStatus): ApprovalRequest[] {
  let list = approvalRequests.filter((r) => r.agentId === agentId);
  if (status) list = list.filter((r) => r.status === status);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// --- Agent action logs ---
export function createAgentActionLog(entry: Omit<AgentActionLog, "id" | "timestamp">): AgentActionLog {
  const e: AgentActionLog = {
    ...entry,
    id: id(),
    timestamp: now(),
  };
  agentActionLogs.push(e);
  return e;
}

export function listAgentActionLogs(agentId: string, opts?: { runId?: string; limit?: number }): AgentActionLog[] {
  let list = agentActionLogs.filter((a) => a.agentId === agentId);
  if (opts?.runId) list = list.filter((a) => a.runId === opts.runId);
  return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, opts?.limit ?? 100);
}

// --- Message artifacts ---
export function createMessageArtifact(entry: Omit<MessageArtifact, "id" | "createdAt">): MessageArtifact {
  const m: MessageArtifact = {
    ...entry,
    id: id(),
    createdAt: now(),
  };
  messageArtifacts.push(m);
  return m;
}

export function listMessageArtifacts(agentId: string, opts?: { runId?: string; limit?: number }): MessageArtifact[] {
  let list = messageArtifacts.filter((m) => m.agentId === agentId);
  if (opts?.runId) list = list.filter((m) => m.runId === opts.runId);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, opts?.limit ?? 100);
}

export function updateMessageArtifact(artifactId: string, updates: Partial<Pick<MessageArtifact, "status" | "subject" | "body">>): MessageArtifact | undefined {
  const idx = messageArtifacts.findIndex((m) => m.id === artifactId);
  if (idx === -1) return undefined;
  messageArtifacts[idx] = { ...messageArtifacts[idx], ...updates };
  return messageArtifacts[idx];
}

/** Retention cleanup: remove message artifacts older than cutoff. Returns count deleted. */
export function deleteMessageArtifactsOlderThan(cutoff: string): number {
  const before = messageArtifacts.length;
  for (let i = messageArtifacts.length - 1; i >= 0; i--) {
    if (messageArtifacts[i].createdAt < cutoff) messageArtifacts.splice(i, 1);
  }
  return before - messageArtifacts.length;
}

/** Retention cleanup: remove action logs older than cutoff. */
export function deleteAgentActionLogsOlderThan(cutoff: string): number {
  const before = agentActionLogs.length;
  for (let i = agentActionLogs.length - 1; i >= 0; i--) {
    if (agentActionLogs[i].timestamp < cutoff) agentActionLogs.splice(i, 1);
  }
  return before - agentActionLogs.length;
}

/** Retention cleanup: remove audit logs older than cutoff. */
export function deleteAuditLogsOlderThan(cutoff: string): number {
  const before = auditLogs.length;
  for (let i = auditLogs.length - 1; i >= 0; i--) {
    if (auditLogs[i].timestamp < cutoff) auditLogs.splice(i, 1);
  }
  return before - auditLogs.length;
}

// --- Idempotency (execute calls) ---
const idempotencyMap = new Map<string, { runId: string; createdAt: string }>();
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000;

export function getIdempotentRunId(key: string, agentId: string): string | undefined {
  const entry = idempotencyMap.get(`${agentId}:${key}`);
  if (!entry) return undefined;
  const age = Date.now() - new Date(entry.createdAt).getTime();
  if (age > IDEMPOTENCY_TTL_MS) {
    idempotencyMap.delete(`${agentId}:${key}`);
    return undefined;
  }
  return entry.runId;
}

export function setIdempotentRunId(key: string, agentId: string, runId: string): void {
  idempotencyMap.set(`${agentId}:${key}`, { runId, createdAt: now() });
}

// --- Compliance registry ---
const complianceEntries: ComplianceRegistryEntry[] = [];

export function listComplianceByEntity(entityType: string, entityId: string): ComplianceRegistryEntry[] {
  return complianceEntries
    .filter((e) => e.entityType === entityType && e.entityId === entityId)
    .sort((a, b) => a.controlId.localeCompare(b.controlId));
}

export function upsertComplianceEntry(
  entityType: string,
  entityId: string,
  controlId: ComplianceControlId,
  status: ComplianceStatus,
  evidenceLink?: string
): ComplianceRegistryEntry {
  const existing = complianceEntries.find(
    (e) => e.entityType === entityType && e.entityId === entityId && e.controlId === controlId
  );
  const entry: ComplianceRegistryEntry = {
    id: existing?.id ?? id(),
    entityType,
    entityId,
    controlId,
    status,
    evidenceLink,
    lastCheckedAt: now(),
  };
  if (existing) {
    const idx = complianceEntries.indexOf(existing);
    complianceEntries[idx] = entry;
  } else {
    complianceEntries.push(entry);
  }
  return entry;
}
