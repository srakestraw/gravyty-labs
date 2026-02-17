/**
 * Persistence layer for agent-ops queue actions.
 * Stores status, snooze, hold, assign, and severity overrides per item id.
 * No raw PII — only personRef IDs and redacted previews.
 * TODO: Replace with DB (e.g. Prisma) for production.
 */

import type { AgentOpsStatus, AgentOpsSeverity } from "./types";
import type { AgentOpsAgentSeverity } from "./types";

export interface QueueItemActionState {
  status?: AgentOpsStatus;
  snoozedUntil?: string; // ISO date string
  assignedTo?: string | null;
  severity?: AgentOpsSeverity;
  agentSeverity?: AgentOpsAgentSeverity;
  updatedAt?: string;
}

const store = new Map<string, QueueItemActionState>();

function now() {
  return new Date().toISOString();
}

export function getActionState(itemId: string): QueueItemActionState | undefined {
  return store.get(itemId);
}

export function getAllActionState(): Record<string, QueueItemActionState> {
  return Object.fromEntries(store.entries());
}

export function setResolved(itemId: string): QueueItemActionState {
  const state: QueueItemActionState = {
    status: "Resolved",
    updatedAt: now(),
  };
  store.set(itemId, state);
  return state;
}

export function setSnoozed(itemId: string, until: string): QueueItemActionState {
  const existing = store.get(itemId) ?? {};
  const state: QueueItemActionState = {
    ...existing,
    status: "Snoozed",
    snoozedUntil: until,
    updatedAt: now(),
  };
  store.set(itemId, state);
  return state;
}

export function setHold(itemId: string): QueueItemActionState {
  const existing = store.get(itemId) ?? {};
  const state: QueueItemActionState = {
    ...existing,
    status: "InProgress",
    updatedAt: now(),
  };
  store.set(itemId, state);
  return state;
}

export function setAssign(itemId: string, assigneeId: string | null): QueueItemActionState {
  const existing = store.get(itemId) ?? {};
  const state: QueueItemActionState = {
    ...existing,
    assignedTo: assigneeId ?? undefined,
    updatedAt: now(),
  };
  store.set(itemId, state);
  return state;
}

export function setSeverity(
  itemId: string,
  severity: AgentOpsAgentSeverity
): QueueItemActionState {
  const existing = store.get(itemId) ?? {};
  const state: QueueItemActionState = {
    ...existing,
    agentSeverity: severity,
    updatedAt: now(),
  };
  store.set(itemId, state);
  return state;
}

export function setUnsnoozed(itemId: string): QueueItemActionState {
  const existing = store.get(itemId) ?? {};
  const state: QueueItemActionState = {
    ...existing,
    status: "Open",
    snoozedUntil: undefined,
    updatedAt: now(),
  };
  store.set(itemId, state);
  return state;
}

export function setReopened(itemId: string): QueueItemActionState {
  const existing = store.get(itemId) ?? {};
  const state: QueueItemActionState = {
    ...existing,
    status: "Open",
    updatedAt: now(),
  };
  store.set(itemId, state);
  return state;
}
