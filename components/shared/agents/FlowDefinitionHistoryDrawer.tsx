"use client";

import * as React from "react";
import { FontAwesomeIcon } from "@/components/ui/font-awesome-icon";
import type { FlowDefinition } from "@/lib/agents/api-types";

interface FlowDefinitionHistoryDrawerProps {
  agentId: string;
  open: boolean;
  onClose: () => void;
}

export function FlowDefinitionHistoryDrawer({
  agentId,
  open,
  onClose,
}: FlowDefinitionHistoryDrawerProps) {
  const [versions, setVersions] = React.useState<FlowDefinition[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [rollingBack, setRollingBack] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!open || !agentId) return;
    setLoading(true);
    fetch(`/api/flow-definitions/versions?agentId=${encodeURIComponent(agentId)}`)
      .then((r) => r.ok ? r.json() : [])
      .then(setVersions)
      .finally(() => setLoading(false));
  }, [open, agentId]);

  const handleRollback = async (version: number) => {
    setRollingBack(version);
    try {
      const res = await fetch(
        `/api/flow-definitions/rollback?agentId=${encodeURIComponent(agentId)}&version=${version}`,
        { method: "POST" }
      );
      if (res.ok) {
        onClose();
        window.location.reload();
      }
    } finally {
      setRollingBack(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/20" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl sm:max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Flow History</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <FontAwesomeIcon icon="fa-solid fa-times" className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          {loading ? (
            <p className="text-xs text-gray-500">Loading versions…</p>
          ) : versions.length === 0 ? (
            <p className="text-xs text-gray-500">No flow versions yet.</p>
          ) : (
            <ul className="space-y-2">
              {versions.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <div>
                    <span className="text-xs font-medium text-gray-700">Version {v.version}</span>
                    <span className="ml-2 text-[11px] text-gray-500">
                      {new Date(v.createdAt).toLocaleString()} · {v.nodes.length} nodes
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRollback(v.version)}
                    disabled={rollingBack !== null}
                    className="rounded border border-indigo-300 bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                  >
                    {rollingBack === v.version ? "Rolling back…" : "Rollback"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
