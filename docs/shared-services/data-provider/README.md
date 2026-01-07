# Data Provider Service

**Purpose**: Unified data access layer that abstracts data sources (mock, HTTP API, MCP).

**Audience**: Engineers

**Scope**: Data access API, provider abstraction, context-based filtering

**Non-goals**: Domain-specific data models (see domain docs), data source implementation details

**Key Terms**:
- **Provider**: Implementation of data access (mock, HTTP, MCP)
- **DataContext**: Filtering context (workspace, app, mode, userId)
- **DataClient**: Public API for accessing data

**Links**:
- [Context](context.md)
- [Contracts](contracts.md)
- [Architecture](architecture.md)
- [APIs and Events](apis-and-events.md)
- [Runbooks](runbooks.md)

**Ownership**: Engineering Team  
**Update Triggers**: API changes, provider changes, contract changes

**Last Updated**: 2025-12-20

---

## Quick Start

```typescript
import { dataClient } from '@/lib/data';

// List queue items
const items = await dataClient.listQueueItems({
  workspace: 'admissions',
  app: 'student-lifecycle',
  mode: 'operator',
  userId: currentUser?.id,
});
```

---

## Context-Based Filtering

All data access requires a `DataContext`:
- `workspace`: Workspace ID (e.g., 'admissions', 'registrar')
- `app`: App ID (e.g., 'student-lifecycle', 'advancement')
- `mode`: Working mode ('operator', 'leadership', 'global', 'workspace')
- `userId`: Current user ID for user-specific filtering

---

## Available Methods

- `listQueueItems(ctx)` - Queue/agent ops items
- `listContacts(ctx)` - Contact list
- `getContact(ctx, id)` - Single contact
- `listSegments(ctx)` - Segments
- `getSegment(ctx, id)` - Single segment
- `listSegmentDefinitions(ctx)` - Segment definitions
- `getSegmentDefinition(ctx, id)` - Single segment definition
- `listGuardrailPolicies(ctx)` - Guardrail policies
- `listDoNotEngage(ctx)` - Do-not-engage entries

---

## See Also

- [Context](context.md) - When to use, alternatives
- [Contracts](contracts.md) - SLOs, limits, guarantees
- [Architecture](architecture.md) - Technical details
- [APIs and Events](apis-and-events.md) - Full API reference




