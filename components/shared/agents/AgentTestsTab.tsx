"use client";

import * as React from "react";
import { FontAwesomeIcon } from "@/components/ui/font-awesome-icon";
import type { AgentTestCase } from "@/lib/agents/api-types";

interface AgentTestsTabProps {
  agentId: string;
  workspaceId: string;
}

export function AgentTestsTab({ agentId, workspaceId }: AgentTestsTabProps) {
  const [cases, setCases] = React.useState<AgentTestCase[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [runAllResult, setRunAllResult] = React.useState<Array<{ testCaseId: string; name: string; outcome: string }> | null>(null);
  const [runningAll, setRunningAll] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch(`/api/agent-test-cases?agentId=${encodeURIComponent(agentId)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setCases)
      .finally(() => setLoading(false));
  }, [agentId]);

  React.useEffect(() => load(), [load]);

  const runOne = async (testCaseId: string) => {
    const res = await fetch(`/api/agent-test-cases/${testCaseId}/run`, { method: "POST" });
    if (res.ok) load();
  };

  const runAll = async () => {
    setRunningAll(true);
    setRunAllResult(null);
    try {
      const res = await fetch(`/api/agent-test-cases/run-all?agentId=${encodeURIComponent(agentId)}`, {
        method: "POST",
      });
      const data = res.ok ? await res.json() : [];
      setRunAllResult(Array.isArray(data) ? data : []);
      load();
    } finally {
      setRunningAll(false);
    }
  };

  const addCase = async () => {
    const name = window.prompt("Test case name", "Golden case 1");
    if (!name) return;
    await fetch("/api/agent-test-cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId,
        workspaceId,
        name,
        inputContextJson: "{}",
        expectedChecksJson: JSON.stringify({ expectedOutcome: "PASS" }),
      }),
    });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={runAll}
          disabled={runningAll || cases.length === 0}
          className="rounded bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {runningAll ? "Running…" : "Run all"}
        </button>
        <button
          type="button"
          onClick={addCase}
          className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Add test case
        </button>
      </div>
      {runAllResult && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-700">Last run-all result:</p>
          <ul className="mt-1 space-y-1 text-[11px] text-gray-600">
            {runAllResult.map((r) => (
              <li key={r.testCaseId}>
                {r.name} — <span className={r.outcome === "PASS" ? "text-emerald-600" : "text-rose-600"}>{r.outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {loading ? (
        <p className="text-xs text-gray-500">Loading test cases…</p>
      ) : cases.length === 0 ? (
        <p className="text-xs text-gray-500">No test cases. Add one to run regression evals.</p>
      ) : (
        <ul className="space-y-2">
          {cases.map((tc) => (
            <li key={tc.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <span className="text-xs font-medium text-gray-700">{tc.name}</span>
              <button
                type="button"
                onClick={() => runOne(tc.id)}
                className="rounded border border-indigo-300 bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100"
              >
                Run
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
