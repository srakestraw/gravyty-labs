'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { AgentOpsStreamEvent } from '@/lib/agent-ops/events/types';

const MAX_BACKOFF_MS = 30_000;
const INITIAL_BACKOFF_MS = 1_000;

export interface UseAgentOpsStreamOptions {
  enabled: boolean;
  workspaceId: string | undefined;
  onEvent?: (event: AgentOpsStreamEvent) => void;
  /** When true (e.g. Review Mode), do not apply patches; caller will track "new" count. */
  deferApply?: boolean;
}

export interface UseAgentOpsStreamResult {
  connected: boolean;
  newEventsCount: number;
  clearNewEventsCount: () => void;
}

/**
 * Subscribe to agent-ops SSE stream for the workspace.
 * Exponential backoff on reconnect. No PII in events.
 */
export function useAgentOpsStream({
  enabled,
  workspaceId,
  onEvent,
  deferApply = false,
}: UseAgentOpsStreamOptions): UseAgentOpsStreamResult {
  const [connected, setConnected] = useState(false);
  const [newEventsCount, setNewEventsCount] = useState(0);
  const backoffRef = useRef(INITIAL_BACKOFF_MS);
  const eventSourceRef = useRef<EventSource | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const clearNewEventsCount = useCallback(() => setNewEventsCount(0), []);

  useEffect(() => {
    if (!enabled || !workspaceId) {
      setConnected(false);
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const connect = () => {
      if (cancelled) return;
      const url = `/api/agent-ops/stream?workspaceId=${encodeURIComponent(workspaceId)}`;
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = () => {
        if (cancelled) return;
        backoffRef.current = INITIAL_BACKOFF_MS;
        setConnected(true);
      };

      es.onmessage = (e: MessageEvent) => {
        if (cancelled) return;
        try {
          const event = JSON.parse(e.data) as AgentOpsStreamEvent;
          if (deferApply) {
            setNewEventsCount((n) => n + 1);
          }
          onEventRef.current?.(event);
        } catch (_) {
          // ignore parse errors
        }
      };

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        setConnected(false);
        if (cancelled) return;
        timeoutId = setTimeout(() => {
          connect();
          backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS);
        }, backoffRef.current);
      };
    };

    connect();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      setConnected(false);
    };
  }, [enabled, workspaceId, deferApply]);

  return { connected, newEventsCount, clearNewEventsCount };
}
