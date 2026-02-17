"use client";

import * as React from "react";
import { FontAwesomeIcon } from "@/components/ui/font-awesome-icon";
import type { AgentExplainabilityEvent, ExplainabilityKind } from "@/lib/agents/api-types";

interface AgentExplainabilityTabProps {
  agentId: string;
  runId?: string;
}

const KIND_LABELS: Record<ExplainabilityKind, string> = {
  SELECTION_RATIONALE: "Selection",
  MESSAGE_RATIONALE: "Message",
  ACTION_RATIONALE: "Action",
  GUARDRAIL_TRIGGERED: "Guardrail",
};

export function AgentExplainabilityTab({ agentId, runId }: AgentExplainabilityTabProps) {
  const [events, setEvents] = React.useState<AgentExplainabilityEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [kindFilter, setKindFilter] = React.useState<ExplainabilityKind | "">("");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const url = runId
      ? `/api/explainability?agentId=${encodeURIComponent(agentId)}&runId=${encodeURIComponent(runId)}&limit=20`
      : `/api/explainability?agentId=${encodeURIComponent(agentId)}&limit=20`;
    setLoading(true);
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then(setEvents)
      .finally(() => setLoading(false));
  }, [agentId, runId]);

  const filtered = kindFilter
    ? events.filter((e) => e.kind === kindFilter)
    : events;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500">Filter by kind:</label>
        <select
          className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
          value={kindFilter}
          onChange={(e) => setKindFilter((e.target.value || "") as ExplainabilityKind | "")}
        >
          <option value="">All</option>
          {(Object.keys(KIND_LABELS) as ExplainabilityKind[]).map((k) => (
            <option key={k} value={k}>
              {KIND_LABELS[k]}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <p className="text-xs text-gray-500">Loading events…</p>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-gray-500">No explainability events yet. Run the agent to generate events.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((ev) => (
            <li key={ev.id} className="rounded-lg border border-gray-200 bg-gray-50">
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left"
                onClick={() => setExpandedId(expandedId === ev.id ? null : ev.id)}
              >
                <span className="text-xs font-medium text-gray-700">{KIND_LABELS[ev.kind]}</span>
                <span className="text-[11px] text-gray-500">
                  {new Date(ev.timestamp).toLocaleString()}
                  {ev.runId ? ` · Run ${ev.runId.slice(0, 8)}` : ""}
                </span>
                <FontAwesomeIcon
                  icon={expandedId === ev.id ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down"}
                  className="h-3 w-3 text-gray-400"
                />
              </button>
              <p className="border-t border-gray-100 px-3 py-2 text-xs text-gray-600">{ev.summary}</p>
              {expandedId === ev.id && (
                <pre className="max-h-48 overflow-auto border-t border-gray-100 bg-white px-3 py-2 text-[10px] text-gray-800">
                  {ev.detailsJson}
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
