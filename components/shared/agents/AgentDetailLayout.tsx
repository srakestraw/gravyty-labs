"use client";

import * as React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@/components/ui/font-awesome-icon";
import { AgentMetricsPanel } from "@/components/shared/agents/AgentMetricsPanel";
import { AgentExplainabilityTab } from "@/components/shared/agents/AgentExplainabilityTab";
import { AgentTestsTab } from "@/components/shared/agents/AgentTestsTab";
import { cn } from "@/lib/utils";

type TabId = "summary" | "explainability" | "tests" | "compliance" | "audit" | "runs" | "messages" | "actions";

interface ComplianceEntry {
  id: string;
  controlId: string;
  status: string;
  evidenceLink?: string;
  lastCheckedAt: string;
}

interface AuditLogEntry {
  id: string;
  actionType: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  diffSummary?: string;
  actorEmail?: string;
}

interface AgentRunRow {
  id: string;
  status: string;
  summary: string;
  startedAt: string;
}

interface MessageArtifactRow {
  id: string;
  runId: string;
  personId: string;
  channel: string;
  subject?: string;
  body: string;
  status: string;
  createdAt: string;
}

interface ActionLogRow {
  id: string;
  runId: string;
  timestamp: string;
  actionType: string;
  status: string;
  payloadRedactedJson: string;
  error?: string;
}

interface BoundaryLabel {
  orgId: string;
  campusId?: string;
  departmentId?: string;
}

interface AgentDetailLayoutProps {
  agentId: string;
  workspaceId: string;
  basePath: string;
  agentName: string;
  /** Optional boundary for multi-tenant label */
  boundary?: BoundaryLabel | null;
  children: React.ReactNode;
}

export function AgentDetailLayout({
  agentId,
  workspaceId,
  basePath,
  agentName,
  boundary,
  children,
}: AgentDetailLayoutProps) {
  const [tab, setTab] = React.useState<TabId>("summary");
  const [auditLogs, setAuditLogs] = React.useState<AuditLogEntry[]>([]);
  const [runs, setRuns] = React.useState<AgentRunRow[]>([]);
  const [pendingApprovals, setPendingApprovals] = React.useState(0);
  const [messageArtifacts, setMessageArtifacts] = React.useState<MessageArtifactRow[]>([]);
  const [actionLogs, setActionLogs] = React.useState<ActionLogRow[]>([]);
  const [compliance, setCompliance] = React.useState<ComplianceEntry[]>([]);

  React.useEffect(() => {
    const params = new URLSearchParams({ workspaceId, entityType: "agent", entityId: agentId, limit: "20" });
    fetch(`/api/audit-logs?${params}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setAuditLogs)
      .catch(() => setAuditLogs([]));
  }, [workspaceId, agentId]);

  React.useEffect(() => {
    fetch(`/api/agent-runs?agentId=${agentId}&limit=10`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setRuns)
      .catch(() => setRuns([]));
  }, [agentId]);

  React.useEffect(() => {
    fetch(`/api/approval-requests?workspaceId=${workspaceId}&status=PENDING`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list: { agentId: string }[]) => list.filter((a) => a.agentId === agentId))
      .then((list) => setPendingApprovals(list.length))
      .catch(() => setPendingApprovals(0));
  }, [workspaceId, agentId]);

  React.useEffect(() => {
    fetch(`/api/message-artifacts?agentId=${agentId}&limit=50`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setMessageArtifacts)
      .catch(() => setMessageArtifacts([]));
  }, [agentId]);

  React.useEffect(() => {
    fetch(`/api/agent-action-logs?agentId=${agentId}&limit=50`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setActionLogs)
      .catch(() => setActionLogs([]));
  }, [agentId]);

  React.useEffect(() => {
    const params = new URLSearchParams({ entityType: "agent", entityId: agentId });
    fetch(`/api/compliance-registry?${params}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setCompliance)
      .catch(() => setCompliance([]));
  }, [agentId]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "summary", label: "Summary" },
    { id: "explainability", label: "Explainability" },
    { id: "tests", label: "Tests" },
    { id: "compliance", label: "Compliance" },
    { id: "messages", label: "Messages" },
    { id: "actions", label: "Actions" },
    { id: "audit", label: "Audit" },
    { id: "runs", label: "Run history" },
  ];

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div>
        <Link
          href={`${basePath}/agents`}
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
        >
          ← Back to Agents
        </Link>
      </div>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              {agentName}
            </h1>
            {boundary?.orgId && (
              <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600" title="Boundary scope">
                {[boundary.orgId, boundary.campusId, boundary.departmentId].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
          {pendingApprovals > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              <FontAwesomeIcon icon="fa-solid fa-clock" className="h-3 w-3" />
              {pendingApprovals} pending approval{pendingApprovals !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <AgentMetricsPanel agentId={agentId} />
      </header>

      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1">
        {tab === "summary" && children}
        {tab === "explainability" && (
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Explainability</h2>
            <AgentExplainabilityTab agentId={agentId} />
          </div>
        )}
        {tab === "tests" && (
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Regression tests</h2>
            <AgentTestsTab agentId={agentId} workspaceId={workspaceId} />
          </div>
        )}
        {tab === "compliance" && (
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Compliance checklist</h2>
            <p className="mb-3 text-xs text-gray-500">SOC2 / HECVAT / VPAT readiness. Add evidence links when available.</p>
            <ul className="space-y-2">
              {["SOC2_LOGGING", "SOC2_ACCESS_CONTROL", "VPAT_KEYBOARD_NAV", "VPAT_CONTRAST", "HECVAT_DATA_RETENTION", "HECVAT_VENDOR_RISK"].map((controlId) => {
                const entry = compliance.find((c) => c.controlId === controlId);
                const status = entry?.status ?? "NA";
                return (
                  <li key={controlId} className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-2 text-xs last:border-0">
                    <span className="font-medium text-gray-700">{controlId}</span>
                    <span className={cn("rounded px-1.5 py-0.5 font-medium", status === "PASS" ? "bg-emerald-100 text-emerald-800" : status === "FAIL" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600")}>
                      {status}
                    </span>
                    {entry?.evidenceLink ? (
                      <a href={entry.evidenceLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                        Evidence
                      </a>
                    ) : (
                      <span className="text-gray-400">TODO: evidence link</span>
                    )}
                    {entry?.lastCheckedAt && <span className="text-gray-400">{entry.lastCheckedAt.slice(0, 10)}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {tab === "messages" && (
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Message artifacts</h2>
            {messageArtifacts.length === 0 ? (
              <p className="text-xs text-gray-500">No message drafts yet.</p>
            ) : (
              <ul className="space-y-2">
                {messageArtifacts.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-start gap-2 border-b border-gray-100 pb-2 text-xs last:border-0">
                    <span className="font-mono text-gray-500">{m.createdAt.slice(0, 19)}</span>
                    <span className={cn("font-medium", m.status === "BLOCKED" ? "text-amber-600" : "text-gray-700")}>{m.status}</span>
                    <span className="text-gray-600">{m.channel}</span>
                    <span className="text-gray-500">{m.personId}</span>
                    {m.subject && <span className="text-gray-600">{m.subject}</span>}
                    <span className="max-w-md truncate text-gray-500">{m.body}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {tab === "actions" && (
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Action logs</h2>
            {actionLogs.length === 0 ? (
              <p className="text-xs text-gray-500">No actions yet.</p>
            ) : (
              <ul className="space-y-2">
                {actionLogs.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-baseline gap-2 border-b border-gray-100 pb-2 text-xs last:border-0">
                    <span className="font-mono text-gray-500">{a.timestamp.slice(0, 19)}</span>
                    <span className="font-medium text-gray-700">{a.actionType}</span>
                    <span className={cn("font-medium", a.status === "FAILED" || a.status === "BLOCKED" ? "text-amber-600" : "text-gray-600")}>{a.status}</span>
                    <span className="max-w-sm truncate text-gray-500">{a.payloadRedactedJson}</span>
                    {a.error && <span className="text-amber-600">{a.error}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {tab === "audit" && (
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Audit (last 20 events)</h2>
            {auditLogs.length === 0 ? (
              <p className="text-xs text-gray-500">No audit events for this agent yet.</p>
            ) : (
              <ul className="space-y-2">
                {auditLogs.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-baseline gap-2 border-b border-gray-100 pb-2 text-xs last:border-0">
                    <span className="font-mono text-gray-500">{e.timestamp.slice(0, 19)}</span>
                    <span className="font-medium text-gray-700">{e.actionType}</span>
                    {e.diffSummary && <span className="text-gray-600">{e.diffSummary}</span>}
                    {e.actorEmail && <span className="text-gray-400">{e.actorEmail}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {tab === "runs" && (
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Run history (last 10)</h2>
            {runs.length === 0 ? (
              <p className="text-xs text-gray-500">No runs yet.</p>
            ) : (
              <ul className="space-y-2">
                {runs.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-2 text-xs last:border-0">
                    <span className="font-mono text-gray-500">{r.startedAt.slice(0, 19)}</span>
                    <span className={cn("font-medium", r.status === "SUCCESS" ? "text-emerald-600" : "text-amber-600")}>{r.status}</span>
                    <span className="text-gray-600">{r.summary}</span>
                    <Link href={`${basePath}/agents/${agentId}/runs/${r.id}`} className="text-indigo-600 hover:underline">
                      Details
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
