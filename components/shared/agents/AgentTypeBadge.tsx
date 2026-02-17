"use client";

import type { AgentType } from "@/lib/agents/types";
import { cn } from "@/lib/utils";

interface AgentTypeBadgeProps {
  type: AgentType;
  className?: string;
}

const TYPE_LABELS: Record<AgentType, string> = {
  AUTONOMOUS: "Autonomous",
  FLOW: "Flow Builder",
};

export function AgentTypeBadge({ type, className }: AgentTypeBadgeProps) {
  const label = TYPE_LABELS[type];
  const isFlow = type === "FLOW";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border",
        isFlow
          ? "bg-indigo-50 text-indigo-700 border-indigo-100"
          : "bg-violet-50 text-violet-700 border-violet-100",
        className
      )}
    >
      {label}
    </span>
  );
}
