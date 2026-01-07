# Data Provider - APIs and Events

**Purpose**: Complete API reference and event schemas.

**Audience**: Engineers

**Last Updated**: 2025-12-20

---

## DataContext

```typescript
interface DataContext {
  workspace: string;  // e.g., 'admissions', 'registrar'
  app: string;        // e.g., 'student-lifecycle', 'advancement'
  mode: 'operator' | 'leadership' | 'global' | 'workspace';
  userId?: string;    // Current user ID for user-specific filtering
}
```

---

## Queue Items

### listQueueItems(ctx: DataContext): Promise<QueueItem[]>
- Returns queue items filtered by context
- Filtered by workspace, app, mode, and userId

### Types
See `lib/agent-ops/types.ts`

---

## Contacts

### listContacts(ctx: DataContext): Promise<Contact[]>
- Returns contacts filtered by workspace

### getContact(ctx: DataContext, id: string): Promise<Contact | null>
- Returns single contact by ID

### Types
See `lib/contacts/types.ts`

---

## Segments

### listSegments(ctx: DataContext): Promise<Segment[]>
- Returns segments (lib/segments type)

### getSegment(ctx: DataContext, id: string): Promise<Segment | null>
- Returns single segment by ID

### listSegmentDefinitions(ctx: DataContext): Promise<SegmentDefinition[]>
- Returns segment definitions (AI platform type)
- Filtered by workspace/app scope

### getSegmentDefinition(ctx: DataContext, id: string): Promise<SegmentDefinition | null>
- Returns single segment definition by ID

---

## Guardrails

### listGuardrailPolicies(ctx: DataContext): Promise<GuardrailPolicy[]>
- Returns guardrail policies

---

## Do Not Engage

### listDoNotEngage(ctx: DataContext): Promise<DoNotEngageEntry[]>
- Returns do-not-engage entries

---

## Update Triggers

This doc must be updated when:
- API methods change
- Types change
- New methods are added




