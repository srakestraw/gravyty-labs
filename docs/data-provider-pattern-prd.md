# Product Requirements Document: Unified Data Provider Pattern

**Version:** 1.0  
**Date:** 2025-01-15  
**Status:** Approved  
**Owner:** Engineering Team

---

## Executive Summary

This PRD defines the requirements for implementing a unified data provider pattern that consolidates all data access across the Gravyty Labs platform. The pattern enables consistent, context-aware data fetching with the ability to seamlessly switch between mock data, HTTP APIs, and MCP (Model Context Protocol) providers without requiring changes to UI components.

---

## 1. Problem Statement

### Current State Issues

1. **Fragmented Data Access**: Mock data is imported directly from multiple locations (`lib/agent-ops/mock.ts`, `lib/contacts/mock-contacts.ts`, `lib/segments/mock-segments.ts`, etc.), creating inconsistency and making it difficult to track data dependencies.

2. **No Context-Aware Filtering**: Queue items and other data are fetched without considering workspace, app, working mode, or user context, leading to:
   - Incorrect data being displayed in different views
   - Performance issues from loading unnecessary data
   - Inability to implement user-specific or mode-specific filtering

3. **Tight Coupling**: UI components are directly coupled to mock data implementations, making it impossible to switch to real APIs or MCP providers without extensive refactoring.

4. **Code Duplication**: Multiple components implement similar data fetching logic, violating DRY principles.

5. **No Single Source of Truth**: No centralized place to manage data access patterns, making it difficult to:
   - Add new data sources
   - Implement caching strategies
   - Add error handling
   - Monitor data access

### Impact

- **Developer Experience**: Developers must remember which mock files to import and how to use them
- **Maintainability**: Changes to data structure require updates across multiple files
- **Scalability**: Adding new data sources or switching to production APIs requires extensive refactoring
- **Quality**: Inconsistent data access patterns lead to bugs and performance issues

---

## 2. Goals and Objectives

### Primary Goals

1. **Unified Data Access**: Create a single, consistent interface for all data access across the platform
2. **Context-Aware Filtering**: Enable filtering of data by workspace, app, working mode, and user context
3. **Provider Abstraction**: Enable switching between mock, HTTP API, and MCP providers via configuration
4. **Developer Experience**: Simplify data access patterns and reduce cognitive load

### Success Criteria

- ✅ All data access goes through `dataClient` from `@/lib/data`
- ✅ Zero direct imports of mock data files in UI components
- ✅ Context-based filtering works for queue items, segments, and contacts
- ✅ Can switch between mock and HTTP providers via environment variable
- ✅ No breaking changes to existing functionality during migration
- ✅ Cursor rules enforce the pattern automatically

---

## 3. Requirements

### 3.1 Functional Requirements

#### FR1: Unified Data Provider Interface
- **Requirement**: All data access must go through a single `dataClient` instance
- **Acceptance Criteria**:
  - `dataClient` is exported from `lib/data/index.ts`
  - All data types (queue items, contacts, segments, guardrails, DNE) are accessible through `dataClient`
  - Provider implementation is abstracted from consumers

#### FR2: Context-Based Filtering
- **Requirement**: Data must be filterable by context (workspace, app, mode, user)
- **Acceptance Criteria**:
  - Queue items filter by:
    - `workspace` (e.g., 'admissions', 'registrar', 'financial-aid')
    - `app` (e.g., 'student-lifecycle', 'advancement')
    - `mode` ('operator', 'leadership', 'global', 'workspace')
    - `userId` (for user-specific assignments)
  - Segment definitions filter by `workspace` and `app` scope
  - Contacts can be filtered by `workspace` context

#### FR3: Provider Switching
- **Requirement**: Must be able to switch providers via environment variable
- **Acceptance Criteria**:
  - `NEXT_PUBLIC_DATA_PROVIDER` environment variable controls provider selection
  - Default provider is 'mock'
  - Future providers ('http', 'mcp') can be added without UI changes

#### FR4: Backward Compatibility
- **Requirement**: Existing mock data exports must remain functional during migration
- **Acceptance Criteria**:
  - Mock data files continue to export their data/functions
  - Components can migrate gradually without breaking
  - No forced migration required

### 3.2 Non-Functional Requirements

#### NFR1: Performance
- **Requirement**: Provider pattern must not introduce significant performance overhead
- **Acceptance Criteria**:
  - Mock provider includes artificial delays (100-150ms) to simulate network latency
  - Filtering happens at provider level, not in UI components
  - No unnecessary data fetching

#### NFR2: Type Safety
- **Requirement**: All provider methods must be fully typed
- **Acceptance Criteria**:
  - `DataContext` type is well-defined
  - All return types match expected interfaces
  - TypeScript compilation succeeds with strict mode

#### NFR3: Developer Experience
- **Requirement**: Pattern must be easy to use and understand
- **Acceptance Criteria**:
  - Clear documentation in `.cursorrules`
  - Examples provided for common use cases
  - Cursor AI enforces the pattern automatically

#### NFR4: Extensibility
- **Requirement**: Must be easy to add new data types or providers
- **Acceptance Criteria**:
  - New data types can be added to `DataProvider` interface
  - New providers can be implemented by implementing `DataProvider` interface
  - No changes required to existing UI components

---

## 4. Technical Specifications

### 4.1 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     UI Components                            │
│  (QueuePageClient, SegmentsPageClient, ContactsPage, etc.)   │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       │ uses
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    dataClient                                │
│              (lib/data/index.ts)                             │
│                                                              │
│  - Singleton instance                                        │
│  - Provider factory based on env var                        │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       │ switches via
                       │ NEXT_PUBLIC_DATA_PROVIDER
                       ▼
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌──────────────────┐        ┌──────────────────┐
│  mockProvider    │        │  httpProvider     │
│  (current)       │        │  (future)         │
└────────┬─────────┘        └────────┬─────────┘
         │                           │
         │ imports                   │ calls
         ▼                           ▼
┌──────────────────┐        ┌──────────────────┐
│  Mock Data Files │        │  API Routes       │
│  - mock.ts       │        │  /api/queue       │
│  - mock-contacts │        │  /api/contacts    │
└──────────────────┘        └──────────────────┘
```

### 4.2 Data Context Structure

```typescript
export type DataContext = {
  workspace?: string;  // 'admissions', 'registrar', 'financial-aid', etc.
  app?: string;        // 'student-lifecycle', 'advancement', etc.
  mode?: 'operator' | 'leadership' | 'global' | 'workspace';
  userId?: string;     // Current user ID for user-specific filtering
  persona?: string;    // Optional persona for future use
};
```

### 4.3 Provider Interface

```typescript
export interface DataProvider {
  // Agent Ops / Queue Items
  listQueueItems(ctx: DataContext): Promise<QueueItem[]>;

  // People / Contacts
  listContacts(ctx: DataContext): Promise<Contact[]>;
  getContact(ctx: DataContext, id: string): Promise<Contact | null>;

  // Segments (lib/segments type)
  listSegments(ctx: DataContext): Promise<Segment[]>;
  getSegment(ctx: DataContext, id: string): Promise<Segment | null>;

  // Segment Definitions (AI platform type)
  listSegmentDefinitions(ctx: DataContext): Promise<SegmentDefinition[]>;
  getSegmentDefinition(ctx: DataContext, id: string): Promise<SegmentDefinition | null>;

  // Guardrails
  listGuardrailPolicies(ctx: DataContext): Promise<GuardrailPolicy[]>;

  // Do Not Engage
  listDoNotEngage(ctx: DataContext): Promise<DoNotEngageEntry[]>;
}
```

### 4.4 Filtering Logic

#### Queue Items Filtering
1. **By Workspace**: Use `getMockAgentOpsItemsForWorkspace(workspaceId)` if workspace provided
2. **By App**: Map app IDs to roles and filter by `item.role`
3. **By User**: Filter items where `item.assignedTo === userId` or `item.assignedTo` is undefined
4. **By Mode**: (Future) Filter by severity or other mode-specific criteria

#### Segment Definitions Filtering
- Use `getSegmentsByWorkspace(workspaceId, appId)` when context provided
- Filter by `scope.workspaceId` and `scope.suiteId` matching context

---

## 5. Implementation Plan

### Phase 1: Foundation (✅ Completed)
- [x] Create `lib/data/provider.ts` with `DataProvider` interface
- [x] Create `lib/data/providers/mockProvider.ts` with mock implementation
- [x] Create `lib/data/index.ts` with provider factory
- [x] Enhance `DataContext` with `mode` and `userId`
- [x] Implement context-based filtering in mock provider
- [x] Add Cursor rules to enforce pattern

### Phase 2: Migration (In Progress)
- [ ] Migrate `QueuePageClient` to use `dataClient.listQueueItems()`
- [ ] Migrate `SegmentsPageClient` to use `dataClient.listSegmentDefinitions()`
- [ ] Migrate `ContactsPage` to use `dataClient.listContacts()`
- [ ] Migrate guardrail components to use `dataClient.listGuardrailPolicies()`
- [ ] Migrate DNE components to use `dataClient.listDoNotEngage()`

### Phase 3: Cleanup
- [ ] Remove direct mock imports from all UI components
- [ ] Update documentation
- [ ] Add unit tests for provider implementations

### Phase 4: Future Providers
- [ ] Implement `httpProvider` for API-based data access
- [ ] Implement `mcpProvider` for MCP-based data access
- [ ] Add caching layer
- [ ] Add error handling and retry logic

---

## 6. Migration Strategy

### Gradual Migration Approach

1. **Keep Existing Exports**: Mock data files continue to export their data/functions
2. **Parallel Implementation**: New code uses `dataClient`, old code continues to work
3. **Component-by-Component**: Migrate components one at a time
4. **No Breaking Changes**: Ensure existing functionality remains intact

### Migration Checklist for Each Component

```typescript
// Before
import { getMockAgentOpsItems } from '@/lib/agent-ops/mock';
const items = getMockAgentOpsItems();

// After
import { dataClient } from '@/lib/data';
const items = await dataClient.listQueueItems({
  workspace: 'admissions',
  app: 'student-lifecycle',
  mode: 'operator',
  userId: currentUser?.id,
});
```

### Priority Order

1. **High Priority**: Queue/Agent Ops components (most used, most complex filtering)
2. **Medium Priority**: Segments and Contacts (frequently used)
3. **Low Priority**: Guardrails and DNE (less frequently used)

---

## 7. Usage Examples

### Example 1: Queue Items with Full Context

```typescript
import { dataClient } from '@/lib/data';
import { useWorkspaceMode } from '@/lib/hooks/useWorkspaceMode';
import { useAuth } from '@/lib/firebase/auth-context';

export function QueuePageClient({ workspaceId, appId }) {
  const { mode } = useWorkspaceMode(workspaceId);
  const { user } = useAuth();

  const [items, setItems] = useState<QueueItem[]>([]);

  useEffect(() => {
    async function loadItems() {
      const queueItems = await dataClient.listQueueItems({
        workspace: workspaceId,
        app: appId,
        mode: mode,
        userId: user?.id,
      });
      setItems(queueItems);
    }
    loadItems();
  }, [workspaceId, appId, mode, user?.id]);

  // ... render items
}
```

### Example 2: Segments Filtered by Workspace

```typescript
import { dataClient } from '@/lib/data';

export function SegmentsPageClient({ workspaceId, appId }) {
  const [segments, setSegments] = useState<SegmentDefinition[]>([]);

  useEffect(() => {
    async function loadSegments() {
      const segmentDefs = await dataClient.listSegmentDefinitions({
        workspace: workspaceId,
        app: appId,
      });
      setSegments(segmentDefs);
    }
    loadSegments();
  }, [workspaceId, appId]);

  // ... render segments
}
```

### Example 3: Single Contact Lookup

```typescript
import { dataClient } from '@/lib/data';

export function ContactDetail({ contactId, workspaceId }) {
  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => {
    async function loadContact() {
      const contactData = await dataClient.getContact(
        { workspace: workspaceId },
        contactId
      );
      setContact(contactData);
    }
    loadContact();
  }, [contactId, workspaceId]);

  // ... render contact
}
```

---

## 8. Testing Strategy

### Unit Tests
- Test `mockProvider` methods with various context combinations
- Test filtering logic for queue items, segments, contacts
- Test provider factory with different environment variables

### Integration Tests
- Test components using `dataClient` with mock provider
- Test context propagation through component tree
- Test error handling and loading states

### Migration Tests
- Verify migrated components work identically to original
- Test backward compatibility with existing mock exports

---

## 9. Risks and Mitigations

### Risk 1: Breaking Existing Functionality
- **Mitigation**: Keep existing mock exports, migrate gradually, comprehensive testing

### Risk 2: Performance Impact
- **Mitigation**: Filtering at provider level, not in UI, minimal overhead

### Risk 3: Developer Adoption
- **Mitigation**: Cursor rules enforce pattern, clear documentation, examples

### Risk 4: Type Safety Issues
- **Mitigation**: Strict TypeScript, comprehensive type definitions

---

## 10. Future Enhancements

### Short Term
- Add caching layer for frequently accessed data
- Add error handling and retry logic
- Add loading state management

### Medium Term
- Implement `httpProvider` for API-based access
- Add request batching for multiple data fetches
- Add optimistic updates

### Long Term
- Implement `mcpProvider` for MCP-based access
- Add real-time data subscriptions
- Add data synchronization across tabs

---

## 11. Success Metrics

### Quantitative
- **Migration Progress**: % of components using `dataClient` vs direct imports
- **Code Reduction**: Lines of code saved by eliminating duplicate data fetching
- **Performance**: No degradation in data loading times

### Qualitative
- **Developer Satisfaction**: Easier to work with data access patterns
- **Code Quality**: More consistent, maintainable codebase
- **Flexibility**: Easy to switch between providers

---

## 12. Dependencies

### Internal
- Existing mock data files (must remain functional)
- Type definitions in `lib/agent-ops/types.ts`, `lib/contacts/contact-types.ts`, etc.
- Workspace configuration in `app/(shell)/student-lifecycle/lib/workspaces.ts`

### External
- None (self-contained pattern)

---

## 13. Approval and Sign-off

**Product Owner**: [Name]  
**Engineering Lead**: [Name]  
**Date Approved**: 2025-01-15

---

## Appendix A: Related Documents

- [Mock Data Provider Consolidation Plan](../.cursor/plans/mock_data_provider_consolidation_661e1008.plan.md)
- [Cursor Rules](../.cursorrules) - Data Provider Pattern section
- [Workspace Configuration](../app/(shell)/student-lifecycle/lib/workspaces.ts)

---

## Appendix B: Glossary

- **DataProvider**: Interface defining all data access methods
- **DataContext**: Object containing filtering context (workspace, app, mode, user)
- **mockProvider**: Implementation of DataProvider using mock data
- **httpProvider**: (Future) Implementation using HTTP API calls
- **mcpProvider**: (Future) Implementation using MCP protocol
- **dataClient**: Singleton instance of the active provider

---

**Document Status**: ✅ Approved and Implemented (Phase 1 Complete)

