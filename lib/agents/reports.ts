/**
 * Admin reporting: adoption, runs, approvals, blocked, success rate, top blocked topics, top connectors.
 */

import {
  listAgents,
  listAgentRuns,
  listApprovalRequests,
  listMessageArtifacts,
  listAgentActionLogs,
} from "./store";

export interface AgentsReport {
  workspaceId: string;
  range: string;
  adoption: { totalAgents: number; activeAgents: number; draftAgents: number };
  runs: { total: number; success: number; failed: number; partial: number; successRatePct: number };
  approvals: { total: number; pending: number; approved: number; rejected: number };
  blocked: { messages: number; actions: number };
  topBlockedTopics: { topic: string; count: number }[];
  topConnectorsUsed: { connectorId: string; count: number }[];
}

function sinceDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export function getAgentsReport(workspaceId: string, rangeDays: number, opts?: { agentIds?: string[] }): AgentsReport {
  const since = sinceDays(rangeDays);
  let agentsList = listAgents(workspaceId);
  if (opts?.agentIds?.length) {
    const idSet = new Set(opts.agentIds);
    agentsList = agentsList.filter((a) => idSet.has(a.id));
  }
  const activeAgents = agentsList.filter((a) => a.status === "ACTIVE").length;
  const draftAgents = agentsList.filter((a) => a.status === "DRAFT").length;

  let totalRuns = 0;
  let successRuns = 0;
  let failedRuns = 0;
  let partialRuns = 0;
  const connectorCounts = new Map<string, number>();

  for (const agent of agentsList) {
    const runs = listAgentRuns(agent.id, 500).filter((r) => r.startedAt >= since);
    totalRuns += runs.length;
    successRuns += runs.filter((r) => r.status === "SUCCESS").length;
    failedRuns += runs.filter((r) => r.status === "FAILED").length;
    partialRuns += runs.filter((r) => r.status === "PARTIAL").length;
    for (const run of runs) {
      const logs = listAgentActionLogs(agent.id, { runId: run.id });
      for (const log of logs) {
        if (log.connectorId) {
          connectorCounts.set(log.connectorId, (connectorCounts.get(log.connectorId) ?? 0) + 1);
        }
      }
    }
  }

  const approvalsList = listApprovalRequests(workspaceId).filter((r) => r.createdAt >= since);
  const pending = approvalsList.filter((r) => r.status === "PENDING").length;
  const approved = approvalsList.filter((r) => r.status === "APPROVED").length;
  const rejected = approvalsList.filter((r) => r.status === "REJECTED").length;

  const topicCounts = new Map<string, number>();
  let blockedMessages = 0;
  let blockedActions = 0;
  for (const agent of agentsList) {
    const artifacts = listMessageArtifacts(agent.id, { limit: 500 });
    for (const m of artifacts) {
      if (m.createdAt >= since && m.status === "BLOCKED") {
        blockedMessages += 1;
        for (const t of m.topicsDetected) {
          topicCounts.set(t, (topicCounts.get(t) ?? 0) + 1);
        }
      }
    }
    const logs = listAgentActionLogs(agent.id, { limit: 500 });
    for (const l of logs) {
      if (l.timestamp >= since && l.status === "BLOCKED") blockedActions += 1;
    }
  }

  const topBlockedTopics = Array.from(topicCounts.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const topConnectorsUsed = Array.from(connectorCounts.entries())
    .map(([connectorId, count]) => ({ connectorId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const successRatePct = totalRuns ? Math.round((successRuns / totalRuns) * 100) : 0;

  return {
    workspaceId,
    range: `${rangeDays}d`,
    adoption: { totalAgents: agentsList.length, activeAgents, draftAgents },
    runs: { total: totalRuns, success: successRuns, failed: failedRuns, partial: partialRuns, successRatePct },
    approvals: { total: approvalsList.length, pending, approved, rejected },
    blocked: { messages: blockedMessages, actions: blockedActions },
    topBlockedTopics,
    topConnectorsUsed,
  };
}

export function agentsReportToCsv(report: AgentsReport): string {
  const rows: string[] = [
    "Metric,Value",
    `Total Agents,${report.adoption.totalAgents}`,
    `Active Agents,${report.adoption.activeAgents}`,
    `Draft Agents,${report.adoption.draftAgents}`,
    `Total Runs,${report.runs.total}`,
    `Success Runs,${report.runs.success}`,
    `Failed Runs,${report.runs.failed}`,
    `Partial Runs,${report.runs.partial}`,
    `Success Rate %,${report.runs.successRatePct}`,
    `Approvals Total,${report.approvals.total}`,
    `Approvals Pending,${report.approvals.pending}`,
    `Blocked Messages,${report.blocked.messages}`,
    `Blocked Actions,${report.blocked.actions}`,
    "",
    "Top Blocked Topics,Topic,Count",
    ...report.topBlockedTopics.map((t) => `,${t.topic},${t.count}`),
    "",
    "Top Connectors,ConnectorId,Count",
    ...report.topConnectorsUsed.map((c) => `,${c.connectorId},${c.count}`),
  ];
  return rows.join("\n");
}
