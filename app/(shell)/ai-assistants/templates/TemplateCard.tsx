"use client";

import * as React from "react";
import {
  templateHasDecisionIntelligence,
  workspaceScopeLabel,
  subWorkspaceLabel,
  type AgentTemplate,
} from "./agent-templates";
import { cn } from "@/lib/utils";

type TemplateCardProps = {
  template: AgentTemplate;
  selected?: boolean;
  selectable?: boolean;
  onSelect?: (key: string) => void;
  onClickNavigate?: () => void;
  showBlankBadge?: boolean;
};

export function TemplateCard({
  template,
  selected = false,
  selectable = true,
  onSelect,
  onClickNavigate,
  showBlankBadge,
}: TemplateCardProps) {
  const isBlank = template.key === "blank";

  const hasAction = (selectable && onSelect) || onClickNavigate;
  
  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(template.key);
    } else if (onClickNavigate) {
      onClickNavigate();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!hasAction}
      className={cn(
        "flex w-full flex-col items-start rounded-xl border px-4 py-3 text-left shadow-sm transition",
        !hasAction && "cursor-not-allowed opacity-60",
        hasAction && "hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-200",
        selected
          ? "border-indigo-500 bg-indigo-50"
          : "border-gray-200 bg-white"
      )}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {selected && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-semibold text-white">
                ✓
              </span>
            )}
            <h3 className="text-sm font-semibold text-gray-900">
              {template.name}
            </h3>
            {isBlank && showBlankBadge && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-700">
                Blank
              </span>
            )}
          </div>
          {template.role !== "All" && (
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
              {template.role}
            </p>
          )}
          {template.contextContract && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              <span className="inline-flex rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                {workspaceScopeLabel(template.contextContract.workspace_scope.workspace_id)}
              </span>
              {template.contextContract.workspace_scope.sub_workspace_ids.slice(0, 2).map((id) => (
                <span key={id} className="inline-flex rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                  {subWorkspaceLabel(id)}
                </span>
              ))}
              {template.contextContract.narrative_dependency?.uses_narrative_messaging && (
                <span className="inline-flex rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                  Narrative Messaging
                </span>
              )}
              {templateHasDecisionIntelligence(template) && (
                <span className="inline-flex rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                  Decision Intelligence
                </span>
              )}
            </div>
          )}
        </div>

        {selected && (
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700 whitespace-nowrap">
            Selected
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-700">{template.description}</p>

      {!selected && hasAction && (
        <p className="mt-3 text-[11px] font-medium text-gray-500">
          Tap to use this template.
        </p>
      )}
    </button>
  );
}
