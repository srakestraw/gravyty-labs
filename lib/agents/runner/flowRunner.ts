/**
 * FLOW agent execution: trigger -> conditions -> actions, deterministic.
 * TODO: Real event ingestion for triggers; advanced condition operators.
 */

import type { FlowBuilderNode, FlowBuilderEdge } from "../api-types";
import type { RunnerContext, ActionPlanItem, RecordContext, ExecuteResult } from "./types";
import {
  createExplainabilityEvent,
  createAgentActionLog,
  updateAgentRun,
  appendAuditLog,
} from "../store";
import { messageRequiresApproval, connectorActionRequiresApproval } from "./policy";
import { dispatchEmail } from "./dispatchers/emailDispatcher";
import { dispatchSms } from "./dispatchers/smsDispatcher";
import { dispatchWebhook } from "./dispatchers/webhookDispatcher";
import { dispatchSfmc } from "./dispatchers/sfmcDispatcher";
import { buildDraftMessage } from "./policy";

/** Simple condition evaluation. config: { field, operator, value }. TODO: Advanced operators. */
function evaluateCondition(
  node: FlowBuilderNode,
  record: RecordContext
): boolean {
  const config = (node.config ?? {}) as { field?: string; operator?: string; value?: unknown };
  const field = config.field ?? "inactiveDays";
  const op = config.operator ?? "gt";
  const val = config.value ?? 7;
  const recordVal = record[field];
  if (recordVal === undefined) return true; // no data = pass for MVP
  const n = Number(recordVal);
  const v = Number(val);
  if (op === "gt") return n > v;
  if (op === "gte") return n >= v;
  if (op === "lt") return n < v;
  if (op === "eq") return recordVal === val || n === v;
  return true;
}

/** Map flow action node label to action plan items (one per record that passed condition). */
function actionNodesToPlan(
  ctx: RunnerContext,
  actionNodes: FlowBuilderNode[],
  records: RecordContext[]
): ActionPlanItem[] {
  const items: ActionPlanItem[] = [];
  const profile = ctx.narrativeProfile;
  const agent = ctx.agent;

  for (const record of records) {
    const personId = (record.personId as string) ?? "unknown";
    for (const node of actionNodes) {
      const label = (node.label ?? "").toLowerCase();
      if (label.includes("email")) {
        if (!profile) continue;
        const draft = buildDraftMessage(
          agent,
          profile,
          personId,
          "EMAIL",
          `Reminder for ${personId}. Please submit your documents.`,
          "Document reminder"
        );
        items.push({
          type: "EMAIL",
          personId,
          payload: { subject: draft.subject, body: draft.body },
          requiresApproval: messageRequiresApproval(agent),
          narrativeProfileId: profile.id,
          narrativeVersion: profile.version,
        });
      } else if (label.includes("sms")) {
        if (!profile) continue;
        const draft = buildDraftMessage(
          agent,
          profile,
          personId,
          "SMS",
          `Reminder: please submit your documents.`,
          undefined
        );
        items.push({
          type: "SMS",
          personId,
          payload: { body: draft.body },
          requiresApproval: messageRequiresApproval(agent),
          narrativeProfileId: profile.id,
          narrativeVersion: profile.version,
        });
      } else if (label.includes("task")) {
        items.push({
          type: "TASK",
          personId,
          payload: { title: "Follow up", description: `Task for ${personId}` },
          requiresApproval: false,
        });
      } else if (label.includes("webhook")) {
        items.push({
          type: "WEBHOOK",
          connectorId: agent.tools?.webhook?.connectorId,
          payload: { path: "/notify", personId },
          requiresApproval: connectorActionRequiresApproval(agent, "webhook"),
        });
      } else if (label.includes("sfmc") || label.includes("journey")) {
        items.push({
          type: "SFMC",
          connectorId: agent.tools?.sfmc?.connectorId,
          payload: { capability: "trigger_journey" },
          requiresApproval: connectorActionRequiresApproval(agent, "sfmc"),
        });
      }
    }
  }
  return items;
}

export function runFlow(ctx: RunnerContext): Omit<ExecuteResult, "runId"> {
  const { agent, workspaceId, runId, mode, flowDefinition, recordContexts } = ctx;
  if (!flowDefinition) {
    updateAgentRun(runId, { status: "FAILED", summary: "No flow definition", logs: ["No flow definition"] });
    return {
      summary: "No flow definition",
      status: "FAILED",
      counts: { drafted: 0, approvalsCreated: 0, blocked: 0, executed: 0, failed: 0 },
      logs: ["No flow definition"],
    };
  }

  const nodes = flowDefinition.nodes as FlowBuilderNode[];
  const edges = flowDefinition.edges as FlowBuilderEdge[];
  const triggerNodes = nodes.filter((n) => n.type === "trigger");
  const conditionNodes = nodes.filter((n) => n.type === "condition");
  const actionNodes = nodes.filter((n) => n.type === "action");

  if (triggerNodes.length === 0 || actionNodes.length === 0) {
    updateAgentRun(runId, { status: "FAILED", summary: "Flow invalid: need trigger and action", logs: ["Invalid flow"] });
    return {
      summary: "Invalid flow",
      status: "FAILED",
      counts: { drafted: 0, approvalsCreated: 0, blocked: 0, executed: 0, failed: 0 },
    };
  }

  // MVP: treat trigger as fired; use sample record contexts or mock
  const records: RecordContext[] =
    recordContexts.length > 0
      ? recordContexts
      : [{ personId: "p1", inactiveDays: 10 }, { personId: "p2", inactiveDays: 3 }, { personId: "p3", inactiveDays: 14 }];

  let passedRecords = records;
  for (const cond of conditionNodes) {
    passedRecords = passedRecords.filter((r) => evaluateCondition(cond, r));
  }

  createExplainabilityEvent(
    agent.id,
    workspaceId,
    "SELECTION_RATIONALE",
    `Flow evaluated: ${records.length} records, ${passedRecords.length} passed conditions`,
    { recordCount: records.length, passedCount: passedRecords.length }
  );

  const planItems = actionNodesToPlan(
    { ...ctx, recordContexts: passedRecords },
    actionNodes,
    passedRecords
  );

  let drafted = 0;
  let approvalsCreated = 0;
  let blocked = 0;
  let executed = 0;
  let failed = 0;
  const logs: string[] = [];

  for (const item of planItems) {
    if (item.type === "EMAIL" && ctx.narrativeProfile) {
      const draft = buildDraftMessage(
        agent,
        ctx.narrativeProfile,
        item.personId!,
        "EMAIL",
        (item.payload.body as string) ?? "",
        item.payload.subject as string | undefined
      );
      const res = dispatchEmail(
        agent.id,
        workspaceId,
        runId,
        draft,
        mode,
        item.requiresApproval
      );
      if (res.status === "BLOCKED") blocked++;
      else if (res.status === "PENDING_APPROVAL") { drafted++; approvalsCreated++; }
      else if (res.status === "EXECUTED") executed++;
      else drafted++;
    } else if (item.type === "SMS" && ctx.narrativeProfile) {
      const draft = buildDraftMessage(
        agent,
        ctx.narrativeProfile,
        item.personId!,
        "SMS",
        (item.payload.body as string) ?? "",
        undefined
      );
      const res = dispatchSms(agent.id, workspaceId, runId, draft, mode, item.requiresApproval);
      if (res.status === "BLOCKED") blocked++;
      else if (res.status === "PENDING_APPROVAL") { drafted++; approvalsCreated++; }
      else if (res.status === "EXECUTED") executed++;
      else drafted++;
    } else if (item.type === "WEBHOOK") {
      const res = dispatchWebhook(
        agent.id,
        workspaceId,
        runId,
        item,
        item.requiresApproval,
        mode
      );
      if (res.status === "PENDING_APPROVAL") approvalsCreated++;
      else if (res.status === "EXECUTED") executed++;
      else if (res.status === "FAILED") failed++;
      else drafted++;
    } else if (item.type === "SFMC") {
      const res = dispatchSfmc(
        agent.id,
        workspaceId,
        runId,
        item,
        item.requiresApproval,
        mode
      );
      if (res.status === "PENDING_APPROVAL") approvalsCreated++;
      else if (res.status === "EXECUTED") executed++;
      else if (res.status === "FAILED") failed++;
      else drafted++;
    } else if (item.type === "TASK") {
      createAgentActionLog({
        agentId: agent.id,
        workspaceId,
        runId,
        actionType: "TASK",
        status: mode === "LIVE" ? "EXECUTED" : "DRAFTED",
        payloadRedactedJson: JSON.stringify({ type: "TASK", personId: item.personId }),
      });
      executed++;
    }
  }

  const summary = `Flow completed: ${planItems.length} actions, ${drafted} drafted, ${approvalsCreated} approvals, ${blocked} blocked, ${executed} executed`;
  const status = failed > 0 ? "PARTIAL" : "SUCCESS";
  updateAgentRun(runId, {
    status,
    summary,
    metrics: { messagesSent: executed, tasksCreated: planItems.filter((p) => p.type === "TASK").length },
    logs,
    finishedAt: new Date().toISOString(),
  });

  appendAuditLog({
    workspaceId,
    actorId: null,
    actionType: "RUN_REQUESTED",
    entityType: "run",
    entityId: runId,
    diffSummary: `Flow run: ${status}`,
    metadata: { agentId: agent.id, runId },
  });

  return {
    summary,
    status,
    counts: { drafted, approvalsCreated, blocked, executed, failed },
    logs,
  };
}
