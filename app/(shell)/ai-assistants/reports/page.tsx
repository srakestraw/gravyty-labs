"use client";

import * as React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@/components/ui/font-awesome-icon";
import type { AgentsReport } from "@/lib/agents/reports";

const WORKSPACE_ID = "admissions";
const RANGES = [{ label: "Last 7 days", value: "7d" }, { label: "Last 30 days", value: "30d" }, { label: "Last 90 days", value: "90d" }] as const;

export default function AgentsReportsPage() {
  const [report, setReport] = React.useState<AgentsReport | null>(null);
  const [range, setRange] = React.useState("30d");
  const [loading, setLoading] = React.useState(true);
  const [exporting, setExporting] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ workspaceId: WORKSPACE_ID, range });
    fetch(`/api/reports/agents?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setReport)
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [range]);

  const handleExport = () => {
    setExporting(true);
    const params = new URLSearchParams({ workspaceId: WORKSPACE_ID, range });
    fetch(`/api/reports/agents/export?${params}`)
      .then((r) => (r.ok ? r.blob() : null))
      .then((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `agents-report-${WORKSPACE_ID}-${range}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .finally(() => setExporting(false));
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/ai-assistants" className="text-xs font-medium text-gray-500 hover:text-gray-700">
            ← AI Assistants
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
            Agents Reporting
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
            aria-label="Report range"
          >
            {RANGES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleExport}
            disabled={!report || exporting}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            aria-label="Export report as CSV"
          >
            <FontAwesomeIcon icon="fa-solid fa-download" className="h-4 w-4" />
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading report…</p>}
      {!loading && report && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500">Total agents</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{report.adoption.totalAgents}</p>
              <p className="mt-0.5 text-xs text-gray-600">{report.adoption.activeAgents} active, {report.adoption.draftAgents} draft</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500">Runs ({report.range})</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{report.runs.total}</p>
              <p className="mt-0.5 text-xs text-gray-600">{report.runs.successRatePct}% success rate</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500">Approvals</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{report.approvals.total}</p>
              <p className="mt-0.5 text-xs text-gray-600">{report.approvals.pending} pending</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500">Blocked</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{report.blocked.messages + report.blocked.actions}</p>
              <p className="mt-0.5 text-xs text-gray-600">{report.blocked.messages} messages, {report.blocked.actions} actions</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900">Top blocked topics</h2>
              {report.topBlockedTopics.length === 0 ? (
                <p className="mt-2 text-xs text-gray-500">None</p>
              ) : (
                <table className="mt-2 w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-500">
                      <th className="pb-2 font-medium">Topic</th>
                      <th className="pb-2 font-medium text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topBlockedTopics.map((t) => (
                      <tr key={t.topic} className="border-b border-gray-50">
                        <td className="py-1.5">{t.topic}</td>
                        <td className="py-1.5 text-right">{t.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900">Top connectors used</h2>
              {report.topConnectorsUsed.length === 0 ? (
                <p className="mt-2 text-xs text-gray-500">None</p>
              ) : (
                <table className="mt-2 w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-500">
                      <th className="pb-2 font-medium">Connector ID</th>
                      <th className="pb-2 font-medium text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topConnectorsUsed.map((c) => (
                      <tr key={c.connectorId} className="border-b border-gray-50">
                        <td className="py-1.5 font-mono text-xs">{c.connectorId}</td>
                        <td className="py-1.5 text-right">{c.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
      {!loading && !report && <p className="text-sm text-gray-500">No report data.</p>}
    </div>
  );
}
