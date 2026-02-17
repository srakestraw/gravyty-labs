"use client";

import * as React from "react";
import { FontAwesomeIcon } from "@/components/ui/font-awesome-icon";
import type { FlowBuilderDefinition, FlowBuilderNode } from "@/lib/agents/types";
import { FlowDefinitionHistoryDrawer } from "@/components/shared/agents/FlowDefinitionHistoryDrawer";
import { cn } from "@/lib/utils";

interface FlowBuilderSectionProps {
  definition?: FlowBuilderDefinition | null;
  readOnly?: boolean;
  lastRun?: string | null;
  /** When set and readOnly, show History button that opens version drawer */
  agentId?: string;
  /** For create mode: callback when user adds a node (mock - no real persistence) */
  onDefinitionChange?: (def: FlowBuilderDefinition) => void;
}

const NODE_PALETTE_ITEMS: { type: FlowBuilderNode["type"]; label: string; icon: string }[] = [
  { type: "trigger", label: "Trigger", icon: "fa-solid fa-play" },
  { type: "condition", label: "Condition", icon: "fa-solid fa-code-branch" },
  { type: "action", label: "Action", icon: "fa-solid fa-bolt" },
];

const EMPTY_DEFINITION: FlowBuilderDefinition = { nodes: [], edges: [] };

export function FlowBuilderSection({
  definition = EMPTY_DEFINITION,
  readOnly = false,
  lastRun,
  agentId,
  onDefinitionChange,
}: FlowBuilderSectionProps) {
  const [localDef, setLocalDef] = React.useState<FlowBuilderDefinition>(definition ?? EMPTY_DEFINITION);
  const [historyOpen, setHistoryOpen] = React.useState(false);

  React.useEffect(() => {
    setLocalDef(definition ?? EMPTY_DEFINITION);
  }, [definition]);

  const handleAddNode = (type: FlowBuilderNode["type"]) => {
    if (readOnly || !onDefinitionChange) return;
    const id = `n${localDef.nodes.length + 1}`;
    const label = type === "trigger" ? "New Trigger" : type === "condition" ? "New Condition" : "New Action";
    const next: FlowBuilderDefinition = {
      nodes: [...localDef.nodes, { id, type, label }],
      edges: localDef.edges,
    };
    setLocalDef(next);
    onDefinitionChange(next);
  };

  const getNodeIcon = (type: FlowBuilderNode["type"]) => {
    const item = NODE_PALETTE_ITEMS.find((n) => n.type === type);
    return item?.icon ?? "fa-solid fa-circle";
  };

  const getNodeStyles = (type: FlowBuilderNode["type"]) => {
    switch (type) {
      case "trigger":
        return "border-emerald-300 bg-emerald-50 text-emerald-800";
      case "condition":
        return "border-amber-300 bg-amber-50 text-amber-800";
      case "action":
        return "border-indigo-300 bg-indigo-50 text-indigo-800";
      default:
        return "border-gray-300 bg-gray-50 text-gray-800";
    }
  };

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
          Flow Builder
        </h2>
        {readOnly && agentId && (
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 rounded"
            aria-label="Open flow definition history"
          >
            History
          </button>
        )}
      </div>
      <FlowDefinitionHistoryDrawer agentId={agentId ?? ""} open={historyOpen} onClose={() => setHistoryOpen(false)} />
      <p className="mb-4 text-xs text-gray-600">
        Define your workflow with triggers, conditions, and actions. Drag nodes to build the flow.
      </p>

      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        {/* Nodes palette - keyboard navigable */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3" role="toolbar" aria-label="Node palette">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500" id="node-palette-label">
            Nodes
          </p>
          <div className="space-y-2" role="group" aria-labelledby="node-palette-label">
            {NODE_PALETTE_ITEMS.map((item) => (
              <button
                key={item.type}
                type="button"
                disabled={readOnly}
                onClick={() => handleAddNode(item.type)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
                  readOnly
                    ? "cursor-default border-gray-200 bg-gray-100 text-gray-500"
                    : "cursor-pointer border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                )}
                aria-label={`Add ${item.label} node`}
              >
                <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5 text-gray-500" aria-hidden />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas placeholder - focusable for keyboard nav */}
        <div
          className="min-h-[200px] rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
          tabIndex={0}
          role="region"
          aria-label="Flow canvas"
        >
          {localDef.nodes.length === 0 ? (
            <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 text-center text-gray-500">
              <FontAwesomeIcon icon="fa-solid fa-diagram-project" className="h-8 w-8" />
              <p className="text-xs font-medium">Canvas</p>
              <p className="text-[11px]">
                {readOnly ? "No nodes in this flow." : "Add nodes from the palette to build your flow."}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {localDef.nodes.map((node, i) => (
                <div
                  key={node.id}
                  tabIndex={0}
                  role="button"
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
                    getNodeStyles(node.type)
                  )}
                  aria-label={`${node.label} node`}
                >
                  <FontAwesomeIcon icon={getNodeIcon(node.type)} className="h-3.5 w-3.5" />
                  <span>{node.label}</span>
                  {i < localDef.nodes.length - 1 && (
                    <span className="text-gray-400">→</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Last run panel (edit mode) */}
      {lastRun !== undefined && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <span className="text-xs font-medium text-gray-500">Last run: </span>
          <span className="text-xs text-gray-700">{lastRun ?? "Not run yet"}</span>
        </div>
      )}
    </section>
  );
}
