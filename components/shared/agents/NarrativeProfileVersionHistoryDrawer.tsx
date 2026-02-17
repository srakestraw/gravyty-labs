"use client";

import * as React from "react";
import { FontAwesomeIcon } from "@/components/ui/font-awesome-icon";
import type { NarrativeProfileVersion } from "@/lib/agents/api-types";
import { cn } from "@/lib/utils";

interface NarrativeProfileVersionHistoryDrawerProps {
  profileId: string;
  open: boolean;
  onClose: () => void;
}

export function NarrativeProfileVersionHistoryDrawer({
  profileId,
  open,
  onClose,
}: NarrativeProfileVersionHistoryDrawerProps) {
  const [versions, setVersions] = React.useState<NarrativeProfileVersion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [rollingBack, setRollingBack] = React.useState<number | null>(null);
  const [viewSnapshot, setViewSnapshot] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || !profileId) return;
    setLoading(true);
    fetch(`/api/narrative-profiles/${profileId}/versions`)
      .then((r) => r.ok ? r.json() : [])
      .then(setVersions)
      .finally(() => setLoading(false));
  }, [open, profileId]);

  const handleRollback = async (version: number) => {
    setRollingBack(version);
    try {
      const res = await fetch(`/api/narrative-profiles/${profileId}/rollback?version=${version}`, { method: "POST" });
      if (res.ok) {
        onClose();
        window.location.reload(); // Refresh to show rolled-back profile
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
          <h2 className="text-sm font-semibold text-gray-900">Version History</h2>
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
            <p className="text-xs text-gray-500">No version history yet.</p>
          ) : (
            <ul className="space-y-2">
              {versions.map((v) => (
                <li
                  key={v.id}
                  className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">Version {v.version}</span>
                    <span className="text-[11px] text-gray-500">
                      {new Date(v.createdAt).toLocaleString()} {v.actorId ? `· ${v.actorId}` : ""}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setViewSnapshot(viewSnapshot === v.id ? null : v.id)}
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {viewSnapshot === v.id ? "Hide snapshot" : "View snapshot"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRollback(v.version)}
                      disabled={rollingBack !== null}
                      className="rounded border border-indigo-300 bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                    >
                      {rollingBack === v.version ? "Rolling back…" : "Rollback"}
                    </button>
                  </div>
                  {viewSnapshot === v.id && (
                    <pre className="max-h-48 overflow-auto rounded border border-gray-200 bg-white p-2 text-[10px] text-gray-800">
                      {v.snapshotJson}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
