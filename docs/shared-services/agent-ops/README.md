# Agent Ops Service

**Purpose**: Queue system for agent operations.

**Audience**: Engineers

**Scope**: Queue management, agent operations

**Links**:
- [Context](context.md)
- [Contracts](contracts.md)
- [Architecture](architecture.md)
- [APIs and Events](apis-and-events.md)
- [Runbooks](runbooks.md)

**Ownership**: Engineering Team  
**Update Triggers**: Service changes, contract changes

**Last Updated**: 2025-12-20

---

## Overview

Agent Ops service manages queue items and agent operations.

---

## Real-time updates

Queue updates are delivered in real time so operators don’t rely on manual refresh or polling.

**Approach**: Server-Sent Events (SSE). The repo had no existing real-time transport (no SSE, WebSockets, Pusher/Ably/socket.io), so SSE was added as the baseline.

- **Endpoint**: `GET /api/agent-ops/stream?workspaceId=...`
- **Events** (no PII): `item.created`, `item.updated`, `item.resolved`, `approval.created`, `approval.approved`, `approval.rejected`, `run.updated`, `message.updated`, `sla.breached`. Payloads include `itemId`, `type`, `status`, `severity`, `updatedAt`, `assigneeId`, etc.
- **Client**: `QueuePageClient` subscribes when feature flag `queueRealtime` is on; patches list on event or re-fetches; exponential reconnect backoff; falls back to polling when stream is unavailable.
- **UI**: “Live” indicator when connected; toasts for “New approvals added (N)” and “SLA breached on 1 item”; in Review Mode a “+N new” badge without interrupting the current item.

**Key files**:
- `lib/agent-ops/events/types.ts`, `lib/agent-ops/events/publish.ts` – event types and in-memory publish/SSE
- `app/api/agent-ops/stream/route.ts` – SSE endpoint
- `components/shared/queue/useAgentOpsStream.ts` – client subscription hook
- `components/shared/queue/QueuePageClient.tsx` – subscription, patch, Live indicator, Review “+N new”
- Queue action routes and approval approve/reject routes – emit events after mutations

**Production TODOs**: Fan-out (e.g. Redis pub/sub or fanout service); scaling (per-workspace or global stream limits); auth/boundary enforcement on stream; event retention/replay if required.

---

## See Also

- [Context](context.md) - When to use, alternatives
- [Contracts](contracts.md) - SLOs, limits, guarantees
- [Architecture](architecture.md) - Technical details
- [APIs and Events](apis-and-events.md) - Full API reference




