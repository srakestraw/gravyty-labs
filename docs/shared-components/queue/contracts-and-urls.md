# Queue - Contracts and URLs

**Purpose**: URL parameters, data provider method contracts, and integration contracts for the Queue component.

**Audience**: Engineers, Product Managers

**Scope**: URL parameters, data provider methods, integration patterns

**Non-goals**: Component implementation details (see [tech.md](tech.md))

**Ownership**: Engineering Team

**Last Updated**: 2025-12-22

---

## URL Parameters

### Focus Mode

- **Parameter**: `focus`
- **Values**: `'1'` (enabled), absent (disabled)
- **Workspaces**: Admissions, Advancement only
- **Behavior**: Hides sidebar, header, working mode selector; expands queue to full viewport
- **Example**: `/admissions/agent-ops/queue?focus=1`

### Objective Filter

- **Parameter**: `objective`
- **Values**: Objective ID (see below)
- **Workspaces**: Admissions, Advancement only
- **Behavior**: Filters queue items to match objective; shows Game Plan Items Lane
- **Example**: `/admissions/agent-ops/queue?objective=stalled-applicants`

#### Admissions Objectives
- `stalled-applicants`
- `missing-documents`
- `melt-risk`

#### Advancement Objectives
- `re-engage-stalled`
- `prep-briefs`
- `advance-proposals`
- `stewardship-followups`

### Segment Scope

- **Parameter**: `segment`
- **Values**: Segment ID
- **Workspaces**: All
- **Behavior**: Filters queue items to segment scope; shows segment banner
- **Example**: `/admissions/agent-ops/queue?segment=seg_123`

### Review Mode

- **Parameter**: `mode`
- **Values**: `'review'` (enabled), absent (disabled)
- **Workspaces**: All (requires feature flag: `queueReviewMode`)
- **Behavior**: Enters full-screen Review Mode
- **Example**: `/admissions/agent-ops/queue?mode=review&itemId=item_123`

### Review Mode Item ID

- **Parameter**: `itemId`
- **Values**: Queue item ID
- **Workspaces**: All (requires feature flag: `queueReviewMode`)
- **Behavior**: Sets current item in Review Mode (used with `mode=review`)
- **Example**: `/admissions/agent-ops/queue?mode=review&itemId=item_123`

### Combined Parameters

Parameters can be combined:
- `/admissions/agent-ops/queue?focus=1&objective=stalled-applicants&segment=seg_123`
- `/advancement/pipeline/agent-ops/queue?focus=1&objective=re-engage-stalled`

## Data Provider Methods

### List Queue Items

```typescript
listQueueItems(ctx: DataContext): Promise<QueueItem[]>
```

**Context**:
- `workspace`: Workspace ID (e.g., `'admissions'`, `'advancement'`)
- `app`: App ID (e.g., `'student-lifecycle'`, `'advancement'`)
- `mode`: `'team'` (fixed for queue)

**Returns**: Array of queue items

**Usage**: Called on QueuePageClient mount

### Get Admissions Team Game Plan

```typescript
getAdmissionsTeamGamePlan(ctx: DataContext): Promise<AdmissionsTeamGamePlanData | null>
```

**Context**:
- `workspace`: `'admissions'`
- `app`: `'student-lifecycle'`
- `mode`: `'team'`

**Returns**: Game plan with objectives and completion counts

**Usage**: Called when `workspaceId === 'admissions'`

### Get Admissions Queue Game Plan Counts

```typescript
getAdmissionsQueueGamePlanCounts(ctx: DataContext): Promise<Record<string, number>>
```

**Context**: Same as `getAdmissionsTeamGamePlan`

**Returns**: Map of objective ID to item count

**Usage**: Called when `workspaceId === 'admissions'`

### Get Admissions Queue Items By Objective

```typescript
getAdmissionsQueueItemsByObjective(
  ctx: DataContext,
  objectiveId: string,
  limit?: number
): Promise<QueueItem[]>
```

**Context**: Same as `getAdmissionsTeamGamePlan`

**Parameters**:
- `objectiveId`: Objective ID (e.g., `'stalled-applicants'`)
- `limit`: Optional limit (default: 10)

**Returns**: Array of queue items matching objective

**Usage**: Called when `workspaceId === 'admissions'` and `activeObjectiveId` is set

### Get Admissions Operator Game Plan

```typescript
getAdmissionsOperatorGamePlan(ctx: DataContext): Promise<AdmissionsOperatorGamePlanData | null>
```

**Context**: Same as `getAdmissionsTeamGamePlan`

**Returns**: Full operator game plan with completion status

**Usage**: Called to extract completion status for objectives

### Get Pipeline Team Game Plan For Queue

```typescript
getPipelineTeamGamePlanForQueue(ctx: DataContext): Promise<AdmissionsTeamGamePlanData | null>
```

**Context**:
- `workspace`: `'advancement'`
- `app`: `'advancement'`
- `mode`: `'team'`

**Returns**: Game plan with objectives and completion counts

**Usage**: Called when `workspaceId === 'advancement'`

### Get Pipeline Queue Game Plan Counts

```typescript
getPipelineQueueGamePlanCounts(ctx: DataContext): Promise<Record<string, number>>
```

**Context**: Same as `getPipelineTeamGamePlanForQueue`

**Returns**: Map of objective ID to item count

**Usage**: Called when `workspaceId === 'advancement'`

### Get Pipeline Queue Items By Objective

```typescript
getPipelineQueueItemsByObjective(
  ctx: DataContext,
  objectiveId: string,
  limit?: number
): Promise<QueueItem[]>
```

**Context**: Same as `getPipelineTeamGamePlanForQueue`

**Parameters**:
- `objectiveId`: Objective ID (e.g., `'re-engage-stalled'`)
- `limit`: Optional limit (default: 10)

**Returns**: Array of queue items matching objective

**Usage**: Called when `workspaceId === 'advancement'` and `activeObjectiveId` is set

### Get Pipeline Team Game Plan

```typescript
getPipelineTeamGamePlan(ctx: DataContext): Promise<AdmissionsOperatorGamePlanData | null>
```

**Context**: Same as `getPipelineTeamGamePlanForQueue`

**Returns**: Full team game plan with completion status

**Usage**: Called to extract completion status for objectives

## Integration Contracts

### QueuePageClient Props

```typescript
interface QueuePageClientProps {
  basePath?: string;                    // Base path for navigation (default: '/ai-assistants')
  defaultFilters?: Partial<AgentOpsFilters>; // Default filters to apply
  activeSegmentId?: string;             // Active segment ID
  activeSegment?: SegmentDefinition;    // Active segment object
  workspaceId?: string;                  // Workspace ID ('admissions', 'advancement', etc.)
}
```

### AgentOpsQueuePageClient Props

```typescript
interface AgentOpsQueuePageClientProps {
  context?: AiPlatformPageContext;      // AI Platform context
}
```

### Domain Page Integration

Domain pages create a page route that renders `AgentOpsQueuePageClient`:

```typescript
// app/(shell)/admissions/agent-ops/queue/page.tsx
'use client';

import { AgentOpsQueuePageClient } from '@/components/shared/ai-platform/AgentOpsQueuePageClient';

function QueueContent() {
  const context = {
    appId: 'admissions',
    mode: 'workspace' as const,
    workspaceId: 'admissions',
  };

  return <AgentOpsQueuePageClient context={context} />;
}

export default function AdmissionsQueuePage() {
  return <QueueContent />;
}
```

## Navigation Contracts

### Person Navigation

- **Pattern**: `${basePath}/agent-ops/people?id=${personId}`
- **Example**: `/ai-assistants/agent-ops/people?id=person_123`

### Agent Navigation

- **Pattern**: `${basePath}/agents/${agentId}`
- **Example**: `/ai-assistants/agents/agent_123`

## Update Triggers

This document must be updated when:
- URL parameters change (new params, removed params, behavior changes)
- Data provider method contracts change
- Integration contracts change
- Navigation patterns change

