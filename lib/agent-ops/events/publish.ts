/**
 * In-memory event bus for agent-ops real-time updates.
 * Scoped by workspaceId; no PII in events.
 * TODO: Production: replace with Redis pub/sub or fanout service; add auth/boundary checks.
 */

import type { AgentOpsStreamEvent } from "./types";

type Listener = (event: AgentOpsStreamEvent) => void;

const listenersByWorkspace = new Map<string, Set<Listener>>();

function getListeners(workspaceId: string): Set<Listener> {
  let set = listenersByWorkspace.get(workspaceId);
  if (!set) {
    set = new Set();
    listenersByWorkspace.set(workspaceId, set);
  }
  return set;
}

/**
 * Subscribe to events for a workspace. Returns an unsubscribe function.
 */
export function subscribe(
  workspaceId: string,
  listener: Listener
): () => void {
  const listeners = getListeners(workspaceId);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) listenersByWorkspace.delete(workspaceId);
  };
}

/**
 * Publish an event to all subscribers for the workspace.
 * Events are not persisted; only live subscribers receive them.
 */
export function publish(workspaceId: string, event: AgentOpsStreamEvent): void {
  const listeners = listenersByWorkspace.get(workspaceId);
  if (!listeners) return;
  const payload = { ...event, timestamp: event.timestamp || new Date().toISOString() };
  listeners.forEach((listener) => {
    try {
      listener(payload);
    } catch (e) {
      console.warn("[agent-ops/events] listener error:", e);
    }
  });
}

/** SSE: register a sender that receives raw SSE text chunks (for GET /api/agent-ops/stream). */
const sseSendersByWorkspace = new Map<string, Set<(chunk: string) => void>>();

export function addSseSender(workspaceId: string, send: (chunk: string) => void): () => void {
  let set = sseSendersByWorkspace.get(workspaceId);
  if (!set) {
    set = new Set();
    sseSendersByWorkspace.set(workspaceId, set);
  }
  set.add(send);
  return () => {
    set!.delete(send);
    if (set!.size === 0) sseSendersByWorkspace.delete(workspaceId);
  };
}

function formatSse(event: AgentOpsStreamEvent): string {
  const data = JSON.stringify(event);
  return `data: ${data}\n\n`;
}

/**
 * Publish event to SSE clients for the workspace.
 */
export function publishSse(workspaceId: string, event: AgentOpsStreamEvent): void {
  publish(workspaceId, event);
  const senders = sseSendersByWorkspace.get(workspaceId);
  if (!senders) return;
  const chunk = formatSse({ ...event, timestamp: event.timestamp || new Date().toISOString() });
  senders.forEach((send) => {
    try {
      send(chunk);
    } catch (e) {
      console.warn("[agent-ops/events] SSE send error:", e);
    }
  });
}

/** Emit item.updated after a queue action (status/assign/severity). Call from API routes. */
export function emitItemUpdated(
  workspaceId: string,
  itemId: string,
  payload: { status?: string; assigneeId?: string | null; agentSeverity?: string; updatedAt?: string }
): void {
  publishSse(workspaceId, {
    event: "item.updated",
    payload: { itemId, ...payload, updatedAt: payload.updatedAt || new Date().toISOString() },
    timestamp: new Date().toISOString(),
  });
}

/** Emit approval.approved or approval.rejected. Call from approval API routes. */
export function emitApprovalResolved(
  workspaceId: string,
  approvalRequestId: string,
  kind: "approval.approved" | "approval.rejected"
): void {
  publishSse(workspaceId, {
    event: kind,
    payload: { approvalRequestId, workspaceId },
    timestamp: new Date().toISOString(),
  });
}
