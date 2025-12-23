# Queue - Shared Component

**Purpose**: Central documentation for the Queue shared component used across Admissions, Advancement, and Student Lifecycle workspaces.

**Audience**: Product Managers, Designers, Engineers

**Scope**: Queue component behavior, integration patterns, URL parameters, actions, keyboard shortcuts, Game Plan integration, Focus Mode, Review Mode

**Non-goals**: Domain-specific queue customizations (documented in domain docs), data provider implementation details (see [Data Provider docs](../shared-services/data-provider/README.md))

**Ownership**: Engineering Team

**Last Updated**: 2025-12-22

---

## Overview

Queue is a shared triage interface for managing agent operations items across workspaces. It provides:

- **Unified triage surface** for all agent-ops items requiring attention
- **Game Plan integration** for Admissions and Advancement workspaces
- **Focus Mode** for distraction-free triage
- **Review Mode** for rapid item processing with keyboard navigation
- **Segment scoping** for filtered views
- **Objective filtering** for goal-oriented workflows

## Quick Links

- [Product Requirements](product.md) - User outcomes, success metrics, feature requirements
- [Design Documentation](design.md) - UX flows, states, interaction rules, accessibility
- [Technical Documentation](tech.md) - Architecture, component boundaries, data contracts
- [Contracts and URLs](contracts-and-urls.md) - URL parameters, data provider methods, integration contracts

## Supported Workspaces

Queue is used in:

- **Admissions** (`workspaceId: 'admissions'`) - Full Game Plan integration
- **Advancement** (`workspaceId: 'advancement'`) - Full Game Plan integration  
- **Student Lifecycle** (`workspaceId: 'student-lifecycle'` or other workspace IDs) - Standard queue without Game Plan

## Component Boundaries

### Shared Queue Page
- **Location**: `components/shared/queue/QueuePageClient.tsx`
- **Purpose**: Core queue page component, handles all queue logic
- **Props**: `basePath`, `defaultFilters`, `activeSegmentId`, `activeSegment`, `workspaceId`

### Agent Ops Wrapper
- **Location**: `components/shared/ai-platform/AgentOpsQueuePageClient.tsx`
- **Purpose**: Wraps QueuePageClient with AI Platform context
- **Usage**: Used by domain-specific queue pages

### Queue Components
- **QueueList**: `components/ai-assistants/agent-ops/queue/QueueList.tsx` - Item list rendering
- **QueueDetail**: `components/ai-assistants/agent-ops/queue/QueueDetail.tsx` - Item detail panel
- **ShortcutFooter**: `components/ai-assistants/agent-ops/queue/ShortcutFooter.tsx` - Keyboard shortcuts help

## Integration Points

### Data Provider
Queue uses the unified data provider (`@/lib/data`):
- `dataClient.listQueueItems(ctx)` - Load queue items
- `dataClient.getAdmissionsTeamGamePlan(ctx)` - Game plan (Admissions)
- `dataClient.getAdmissionsQueueGamePlanCounts(ctx)` - Game plan counts (Admissions)
- `dataClient.getAdmissionsQueueItemsByObjective(ctx, objectiveId, limit)` - Objective items (Admissions)
- `dataClient.getPipelineTeamGamePlanForQueue(ctx)` - Game plan (Advancement)
- `dataClient.getPipelineQueueGamePlanCounts(ctx)` - Game plan counts (Advancement)
- `dataClient.getPipelineQueueItemsByObjective(ctx, objectiveId, limit)` - Objective items (Advancement)

See [Data Provider docs](../shared-services/data-provider/README.md) for full contract.

### Navigation
- Person navigation: `${basePath}/agent-ops/people?id=${personId}`
- Agent navigation: `${basePath}/agents/${agentId}`

## Domain Integration

Domains integrate Queue by:

1. **Creating a page route** that renders `AgentOpsQueuePageClient` with workspace context
2. **Linking to Queue docs** in domain documentation (do not duplicate Queue behavior)
3. **Documenting domain-specific defaults** (filters, entry points, labels)

See domain docs for integration examples:
- [Admissions Queue Integration](../../product/domains/admissions/README.md#queue-integration)
- [Advancement Queue Integration](../../product/domains/advancement/README.md#queue-integration)

## Update Triggers

This documentation must be updated when:
- Queue actions change (new actions, removed actions, behavior changes)
- URL parameters change (new params, removed params, behavior changes)
- Keyboard shortcuts change
- Game Plan integration behavior changes
- Focus Mode or Review Mode behavior changes
- Component boundaries change (new shared components, moved components)
- Data provider contracts change

---

## Related Documentation

- [Data Provider](../shared-services/data-provider/README.md) - Data access layer
- [Agent Ops](../shared-services/agent-ops/README.md) - Agent operations service
- [Segments](../shared-services/segments/README.md) - Audience segmentation
- [Command Center](../shared-services/command-center/README.md) - Working modes

