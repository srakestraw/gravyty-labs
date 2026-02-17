"use client";

import * as React from "react";

interface AgentMetricsPanelProps {
  agentId: string;
}

export function AgentMetricsPanel({ agentId }: AgentMetricsPanelProps) {
  const [metrics, setMetrics] = React.useState<Record<string, number | undefined> | null>(null);

  React.useEffect(() => {
    fetch(`/api/agents/${agentId}/metrics?range=7d`)
      .then((r) => (r.ok ? r.json() : {}))
      .then(setMetrics);
  }, [agentId]);

  if (!metrics) return null;

  const items = [
    { label: "Runs (7d)", value: metrics.runsLast7d ?? 0 },
    { label: "Messages (7d)", value: metrics.messagesSentLast7d ?? 0 },
    { label: "Blocked (7d)", value: metrics.blockedActionsLast7d ?? 0 },
    { label: "Success rate (30d)", value: metrics.successRateLast30d != null ? `${metrics.successRateLast30d}%` : "—" },
  ];

  return (
    <div className="flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
      {items.map(({ label, value }) => (
        <div key={label}>
          <span className="text-[11px] font-medium text-gray-500">{label}</span>
          <span className="ml-1 text-xs font-semibold text-gray-900">{value}</span>
        </div>
      ))}
    </div>
  );
}
