/**
 * AUTONOMOUS agent execution: select targets, draft messages (Narrative-constrained), create approvals.
 * No automatic send unless explicitly enabled + feature flag.
 * TODO: Real people data (SIS/CRM) for target selection.
 */

import type { RunnerContext, ExecuteResult, RecordContext } from "./types";
import {
  createExplainabilityEvent,
  updateAgentRun,
  appendAuditLog,
} from "../store";
import { messageRequiresApproval, buildDraftMessage } from "./policy";
import { dispatchEmail } from "./dispatchers/emailDispatcher";
import { dispatchSms } from "./dispatchers/smsDispatcher";

/** MVP: simple target selection. scope filters + mock list or sampleTargets. TODO: Real people (SIS/CRM). */
function selectTargets(ctx: RunnerContext): RecordContext[] {
  if (ctx.recordContexts.length > 0) return ctx.recordContexts;
  if (Array.isArray(ctx.sampleTargets) && ctx.sampleTargets.length > 0) {
    return ctx.sampleTargets.map((personId) => ({ personId } as RecordContext));
  }
  return [
    { personId: "p1", inactiveDays: 10, missingTranscript: true },
    { personId: "p2", inactiveDays: 5, missingTranscript: true },
    { personId: "p3", inactiveDays: 14, missingTranscript: true },
  ];
}

export function runAutonomous(ctx: RunnerContext): Omit<ExecuteResult, "runId"> {
  const { agent, workspaceId, runId, mode, narrativeProfile } = ctx;
  const runLogs: string[] = [];

  if (!narrativeProfile) {
    updateAgentRun(runId, { status: "FAILED", summary: "No narrative profile", logs: ["No narrative profile"] });
    return {
      summary: "No narrative profile",
      status: "FAILED",
      counts: { drafted: 0, approvalsCreated: 0, blocked: 0, executed: 0, failed: 0 },
      logs: ["No narrative profile"],
    };
  }

  const targets = selectTargets(ctx);
  createExplainabilityEvent(
    agent.id,
    workspaceId,
    "SELECTION_RATIONALE",
    `Selected ${targets.length} targets for messaging`,
    { targetCount: targets.length, personIds: targets.map((t) => t.personId) }
  );
  runLogs.push(`Targets selected: ${targets.length}`);

  const requiresApproval = messageRequiresApproval(agent);
  let drafted = 0;
  let approvalsCreated = 0;
  let blocked = 0;
  let executed = 0;
  let failed = 0;

  const emailEnabled = agent.tools?.email?.enabled !== false;
  const smsEnabled = agent.tools?.sms?.enabled !== false;

  for (const record of targets) {
    const personId = (record.personId as string) ?? "unknown";

    if (emailEnabled) {
      const body = `Hi {{First name}}, your transcript is still missing. Please submit by {{Deadline date}}.`;
      const draft = buildDraftMessage(
        agent,
        narrativeProfile,
        personId,
        "EMAIL",
        body,
        "Reminder: Missing document"
      );
      const res = dispatchEmail(agent.id, workspaceId, runId, draft, mode, requiresApproval);
      if (res.status === "BLOCKED") blocked++;
      else if (res.status === "PENDING_APPROVAL") {
        drafted++;
        approvalsCreated++;
      } else if (res.status === "EXECUTED") executed++;
      else drafted++;
    }

    if (smsEnabled) {
      const body = `Reminder: please submit your missing document.`;
      const draft = buildDraftMessage(agent, narrativeProfile, personId, "SMS", body, undefined);
      const res = dispatchSms(agent.id, workspaceId, runId, draft, mode, requiresApproval);
      if (res.status === "BLOCKED") blocked++;
      else if (res.status === "PENDING_APPROVAL") {
        drafted++;
        approvalsCreated++;
      } else if (res.status === "EXECUTED") executed++;
      else drafted++;
    }
  }

  const summary = `Autonomous run: ${drafted} drafted, ${approvalsCreated} approvals, ${blocked} blocked, ${executed} executed`;
  const status = failed > 0 ? "PARTIAL" : "SUCCESS";
  updateAgentRun(runId, {
    status,
    summary,
    metrics: { messagesSent: executed },
    logs: runLogs,
    finishedAt: new Date().toISOString(),
  });

  appendAuditLog({
    workspaceId,
    actorId: null,
    actionType: "RUN_REQUESTED",
    entityType: "run",
    entityId: runId,
    diffSummary: `Autonomous run: ${status}`,
    metadata: { agentId: agent.id, runId },
  });

  return {
    summary,
    status,
    counts: { drafted, approvalsCreated, blocked, executed, failed },
    logs: runLogs,
  };
}
