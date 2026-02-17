/**
 * Execution orchestrator: invokes flow or autonomous runner.
 * TODO: Queue/worker migration - this module can enqueue a job instead of running sync.
 */

import type { ExecuteInput, ExecuteResult } from "./types";
import {
  getAgent,
  getAgentRun,
  getNarrativeProfile,
  listFlowDefinitionVersions,
  getFlowDefinition,
  createAgentRun,
  checkRateLimitsAndMaybePause,
  createExplainabilityEvent,
  getIdempotentRunId,
  setIdempotentRunId,
} from "../store";
import { logAgentEvent } from "../api-helpers";
import { runFlow } from "./flowRunner";
import { runAutonomous } from "./autonomousRunner";

export type { ExecuteInput, ExecuteResult } from "./types";

export function execute(input: ExecuteInput): ExecuteResult {
  const { agentId, workspaceId, mode, sampleTargets, idempotencyKey } = input;

  const agent = getAgent(agentId);
  if (!agent) {
    throw new Error("Agent not found");
  }
  if (agent.workspaceId !== workspaceId) {
    throw new Error("Workspace mismatch");
  }

  const key = idempotencyKey ?? `run-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const existingRunId = getIdempotentRunId(key, agentId);
  if (existingRunId) {
    const run = getAgentRun(existingRunId);
    return {
      runId: existingRunId,
      summary: run?.summary ?? "Replayed (idempotent)",
      status: run?.status ?? "SUCCESS",
      counts: { drafted: 0, approvalsCreated: 0, blocked: 0, executed: 0, failed: 0 },
    };
  }

  const rateCheck = checkRateLimitsAndMaybePause(agentId);
  if (!rateCheck.allowed) {
    createExplainabilityEvent(
      agentId,
      workspaceId,
      "GUARDRAIL_TRIGGERED",
      "Run blocked: " + (rateCheck.reason ?? "rate limit"),
      { reason: rateCheck.reason }
    );
    throw new Error(rateCheck.reason ?? "Rate limit exceeded");
  }

  const run = createAgentRun(
    agentId,
    workspaceId,
    "SUCCESS",
    "Running…",
    undefined,
    [],
    agent.boundary
  );
  const runId = run.id;
  setIdempotentRunId(key, agentId, runId);

  let result: Omit<ExecuteResult, "runId">;

  if (agent.type === "FLOW") {
    const versions = listFlowDefinitionVersions(agentId);
    const flowDef = agent.flow
      ? getFlowDefinition(agent.flow.definitionId, agent.flow.version)
      : versions[0];
    const ctx = {
      agent,
      workspaceId,
      runId,
      mode,
      flowDefinition: flowDef,
      narrativeProfile: agent.narrative ? getNarrativeProfile(agent.narrative.profileId) : undefined,
      recordContexts: [],
      sampleTargets,
    };
    result = runFlow(ctx);
  } else {
    const profile = agent.narrative ? getNarrativeProfile(agent.narrative.profileId) : undefined;
    const ctx = {
      agent,
      workspaceId,
      runId,
      mode,
      narrativeProfile: profile,
      recordContexts: [],
      sampleTargets,
    };
    result = runAutonomous(ctx);
  }

  logAgentEvent("run_completed", {
    agentId,
    runId,
    mode,
    status: result.status,
    counts: result.counts,
  });

  return {
    runId,
    summary: result.summary,
    status: result.status,
    counts: result.counts,
    logs: result.logs,
  };
}
