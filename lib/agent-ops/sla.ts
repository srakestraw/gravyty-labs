/**
 * SLA calculation for queue items.
 * Default SLA by type: approvals 4h, drafts 24h, blocked 8h, exceptions 2h.
 * ON_TRACK / AT_RISK / BREACHED; if breached, severity is escalated.
 */

import type { AgentOpsItem, AgentOpsItemType, AgentOpsSlaStatus } from "./types";

const DEFAULT_SLA_HOURS: Partial<Record<AgentOpsItemType, number>> = {
  AGENT_APPROVAL_REQUIRED: 4,
  AGENT_DRAFT_MESSAGE: 24,
  AGENT_BLOCKED_ACTION: 8,
  AGENT_FLOW_EXCEPTION: 2,
  HumanReview: 4,
  Escalation: 4,
  Error: 2,
};

const DEFAULT_SLA_HOURS_FALLBACK = 24;

export function getDefaultSlaHours(type: AgentOpsItemType): number {
  return DEFAULT_SLA_HOURS[type] ?? DEFAULT_SLA_HOURS_FALLBACK;
}

export function computeDueAt(
  createdAt: string,
  type: AgentOpsItemType
): string {
  const hours = getDefaultSlaHours(type);
  const created = new Date(createdAt).getTime();
  return new Date(created + hours * 60 * 60 * 1000).toISOString();
}

/**
 * AT_RISK when within 25% of due time; BREACHED when past due.
 */
export function computeSlaStatus(
  dueAt: string,
  createdAt: string
): AgentOpsSlaStatus {
  const now = Date.now();
  const due = new Date(dueAt).getTime();
  const created = new Date(createdAt).getTime();
  const total = due - created;
  const remaining = due - now;

  if (remaining <= 0) return "BREACHED";
  if (total > 0 && remaining <= total * 0.25) return "AT_RISK";
  return "ON_TRACK";
}

/**
 * Apply SLA fields to an item: dueAt, slaStatus.
 * If BREACHED, escalate severity (Critical for severity, ERROR for agentSeverity).
 */
export function applySlaToItem(item: AgentOpsItem): AgentOpsItem {
  const dueAt = item.dueAt ?? item.slaDueAt ?? computeDueAt(item.createdAt, item.type);
  const slaStatus = item.slaStatus ?? computeSlaStatus(dueAt, item.createdAt);

  let out: AgentOpsItem = {
    ...item,
    dueAt,
    slaStatus,
    ...(item.slaDueAt == null && { slaDueAt: dueAt }),
  };

  if (slaStatus === "BREACHED") {
    out = {
      ...out,
      severity: "Critical",
      agentSeverity: "ERROR",
    };
  }

  return out;
}
