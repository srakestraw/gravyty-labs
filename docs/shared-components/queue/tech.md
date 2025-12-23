# Queue - Technical Documentation

**Purpose**: Technical architecture, component boundaries, data contracts, and implementation details for the Queue component.

**Audience**: Engineers

**Scope**: Architecture, component structure, data flow, API contracts, state management

**Non-goals**: Product requirements (see [product.md](product.md)), design specifications (see [design.md](design.md))

**Ownership**: Engineering Team

**Last Updated**: 2025-12-22

---

## Architecture

### Component Hierarchy

```
QueuePageClient (shared/queue/QueuePageClient.tsx)
├── AgentOpsQueuePageClient (shared/ai-platform/AgentOpsQueuePageClient.tsx) [wrapper]
│   └── Used by domain pages:
│       ├── app/(shell)/admissions/agent-ops/queue/page.tsx
│       ├── app/(shell)/advancement/pipeline/agent-ops/queue/page.tsx
│       └── app/(shell)/student-lifecycle/[workspace]/agent-ops/queue/page.tsx
├── QueueList (ai-assistants/agent-ops/queue/QueueList.tsx)
├── QueueDetail (ai-assistants/agent-ops/queue/QueueDetail.tsx)
├── GamePlanPanel (shared/ai-platform/GamePlanPanel.tsx) [Admissions/Advancement]
├── GamePlanItemsLane (shared/ai-platform/GamePlanItemsLane.tsx) [Admissions/Advancement]
├── FocusModePage (shared/ai-platform/FocusModePage.tsx) [Admissions/Advancement]
├── ReviewModeShell (shared/queue/ReviewModeShell.tsx)
├── WorkbenchToolbar (shared/queue/WorkbenchToolbar.tsx) [feature flag]
├── FiltersDrawer (shared/queue/FiltersDrawer.tsx) [feature flag]
└── ShortcutsOverlay (shared/queue/ShortcutsOverlay.tsx)
```

### Data Flow

1. **Initial Load**
   - `QueuePageClient` calls `dataClient.listQueueItems(ctx)` on mount
   - Context includes: `workspace`, `app`, `mode: 'team'`
   - Items stored in `allItems` state

2. **Game Plan Load** (Admissions/Advancement)
   - Calls `getAdmissionsTeamGamePlan(ctx)` or `getPipelineTeamGamePlanForQueue(ctx)`
   - Calls `getAdmissionsQueueGamePlanCounts(ctx)` or `getPipelineQueueGamePlanCounts(ctx)`
   - Calls `getAdmissionsOperatorGamePlan(ctx)` or `getPipelineTeamGamePlan(ctx)` for completion status
   - Stores in `gamePlanData`, `gamePlanCounts`, `objectiveCompletionStatus` state

3. **Objective Items Load** (when objective active)
   - Calls `getAdmissionsQueueItemsByObjective(ctx, objectiveId, 10)` or `getPipelineQueueItemsByObjective(ctx, objectiveId, 10)`
   - Stores in `gamePlanItems` state

4. **Filtering**
   - `filteredItems` computed via `useMemo`:
     - Apply split filter (workbench mode)
     - Apply objective filter (if active)
     - Apply standard filters (role, status, type, severity, assignee, search)

5. **Actions**
   - `handleItemAction` updates `allItems` optimistically
   - Auto-advances to next item after resolve/snooze/hold/send-email/send-gratavid/skip
   - TODO: API call to persist action (currently optimistic only)
   
   Source: `components/shared/queue/QueuePageClient.tsx` - `handleItemAction` function (lines 517-559)

## Component Boundaries

### QueuePageClient
- **Location**: `components/shared/queue/QueuePageClient.tsx`
- **Responsibility**: Core queue logic, state management, URL parameter handling, keyboard shortcuts
- **Props**:
  ```typescript
  interface QueuePageClientProps {
    basePath?: string;
    defaultFilters?: Partial<AgentOpsFilters>;
    activeSegmentId?: string;
    activeSegment?: SegmentDefinition;
    workspaceId?: string;
  }
  ```

### AgentOpsQueuePageClient
- **Location**: `components/shared/ai-platform/AgentOpsQueuePageClient.tsx`
- **Responsibility**: Wraps QueuePageClient with AI Platform context
- **Props**: `context?: AiPlatformPageContext`

### QueueList
- **Location**: `components/ai-assistants/agent-ops/queue/QueueList.tsx`
- **Responsibility**: Render item list, handle item selection, inline actions
- **Props**: `items`, `selectedItemId`, `onSelectItem`, `onEnterFocusMode`, `onItemAction`

### QueueDetail
- **Location**: `components/ai-assistants/agent-ops/queue/QueueDetail.tsx`
- **Responsibility**: Render item detail panel, handle actions, support custom detail renderers
- **Props**: `item`, `focusMode`, `onExitFocusMode`, `onNext`, `onPrev`, `onAction`, `onNavigateToPerson`, `onNavigateToAgent`, `detailRendererKey`
- **Detail Renderer Registry**: Supports custom detail views via `detail-renderers/registry.ts`. Items with `detailView: 'first-draft'` use `advancement-first-draft` renderer.
  
  Source: `components/ai-assistants/agent-ops/queue/QueueDetail.tsx` - `QueueDetail` component (lines 24-71)

## Data Contracts

### QueueItem (AgentOpsItem)

```typescript
interface AgentOpsItem {
  id: string;
  title: string;
  summary: string;
  status: 'Open' | 'Snoozed' | 'InProgress' | 'Resolved';
  role: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo?: string;
  person?: { id: string; name: string };
  agentName?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### DataContext

```typescript
interface DataContext {
  workspace?: string; // 'admissions', 'advancement', etc.
  app?: string; // 'student-lifecycle', 'advancement', etc.
  mode?: 'operator' | 'team' | 'global' | 'workspace';
  userId?: string;
}
```

### AgentOpsFilters

```typescript
interface AgentOpsFilters {
  role: string; // 'All' | specific role
  status: string; // 'All' | 'Open' | 'Snoozed' | 'InProgress' | 'Resolved'
  type: string; // 'All' | specific type
  severity: string; // 'All' | 'Low' | 'Medium' | 'High' | 'Critical'
  assignee: string; // 'All' | 'Me' | 'Unassigned'
  search: string; // Search query
}
```

## URL Parameters

### Supported Parameters

- **`focus`**: `'1'` to enable Focus Mode (Admissions/Advancement only)
- **`objective`**: Objective ID to filter by (Admissions/Advancement only)
  - Admissions: `'stalled-applicants'`, `'missing-documents'`, `'melt-risk'`
  - Advancement: `'re-engage-stalled'`, `'prep-briefs'`, `'advance-proposals'`, `'stewardship-followups'`
- **`segment`**: Segment ID to scope queue
- **`mode`**: `'review'` to enter Review Mode (feature flag: `queueReviewMode`)
- **`itemId`**: Item ID for Review Mode (used with `mode=review`)

### URL Parameter Handling

- Parameters read via `useClientSearchParams()` hook
- Parameters updated via `router.replace()` to preserve history
- All parameters preserved when toggling Focus Mode

## Actions

### Supported Actions

```typescript
type QueueAction = 
  | 'resolve'      // Resolve item (status → 'Resolved')
  | 'snooze'       // Snooze item (status → 'Snoozed')
  | 'hold'         // Put on hold (status → 'InProgress')
  | 'unsnooze'     // Unsnooze item (status → 'Open')
  | 'reopen'       // Reopen resolved item (status → 'Open')
  | 'assign'       // Assign item (no status change)
  | 'extendSnooze' // Extend snooze (no status change)
  | 'send-email'   // Send email (status → 'Resolved', tag: 'email-sent')
  | 'send-gratavid'// Send gratavid (status → 'Resolved', tag: 'gratavid-sent')
  | 'skip'         // Skip item (status → 'Resolved', tag: 'skipped')
  | 'call'         // Call person (no status change, logs action)
  | 'sms';         // SMS person (no status change, logs action)
```

### Action Behavior

- **Optimistic updates**: UI updates immediately
- **Auto-advance**: After resolve/snooze/hold/send-email/send-gratavid/skip, advances to next item
- **Status changes**: See `applyActionToItem` function in `QueuePageClient.tsx`
- **API persistence**: TODO - currently optimistic only

## State Management

### Local State (React useState)

- `allItems`: All queue items
- `isLoadingItems`: Loading state
- `gamePlanData`: Game plan objectives and counts
- `gamePlanCounts`: Objective item counts
- `gamePlanItems`: Items for active objective
- `isLoadingGamePlan`: Game plan loading state
- `filters`: Current filters
- `selectedItemId`: Selected item ID
- `filtersDrawerOpen`: Filters drawer state (workbench)
- `workbenchSplitId`: Active split (workbench)
- `objectiveCompletionStatus`: Objective completion status

### Computed State (useMemo)

- `filteredItems`: Filtered and sorted items
- `selectedItem`: Selected item object
- `activeObjectiveId`: Active objective from URL
- `isFocusMode`: Focus mode state from URL
- `isReviewMode`: Review mode state from URL
- `reviewActions`: Available actions for current item in Review Mode

### Review Mode Controller

- `useQueueReviewController`: Manages Review Mode state, navigation, splits, undo
- Location: `components/shared/queue/useQueueReviewController.ts`
- Responsibilities:
  - Split-based filtering (for Advancement: due-today, meeting-prep, first-drafts, stewardship, stalled, fyi)
  - Current item tracking and navigation (next/prev)
  - Auto-advance after completing actions
  - Undo stack management (last 10 actions)
  - Progress tracking (current/total)
  
  Source: `components/shared/queue/useQueueReviewController.ts` - `useQueueReviewController` hook (lines 45-212)

## Feature Flags

- **`queueReviewMode`**: Enables Review Mode (full-screen keyboard navigation)
- **`queueFocusWorkbenchV2`**: Enables Workbench Mode (Superhuman-style Focus Mode with split-based filtering)
  
  Source: `components/shared/queue/QueuePageClient.tsx` - feature flag checks (lines 146-147)

## Keyboard Shortcuts

Implemented via `useHotkeys` hook (`lib/hooks/useHotkeys.ts`):

- **J**: Next item (or Review Mode next)
- **K**: Previous item (or Review Mode previous)
- **Enter**: Enter Review Mode (if item selected and feature enabled)
- **E**: Resolve current item
- **S**: Snooze current item
- **H**: Hold current item
- **Z**: Undo (Review Mode only)
- **Esc**: Exit Review Mode
- **↑/↓**: Navigate items in Review Mode (arrow keys)
- **?**: Show shortcuts overlay (handled by ShortcutsOverlay component)
  
  Source: `components/shared/queue/QueuePageClient.tsx` - `useHotkeys` call (lines 698-747)

## Objective Matching Logic

### Admissions Objectives

- **`stalled-applicants`**: Matches items with tags `['stalled', 'inactive', 'no-activity', 'incomplete-app', 'incomplete-application']` or title/summary containing "stalled" or "incomplete"
- **`missing-documents`**: Matches items with tags `['missing-transcript', 'missing-docs', 'verification', 'recommendation-letter', 'transcript', 'missing']` or title/summary containing "missing", "transcript", or "document"
- **`melt-risk`**: Matches items with tags `['melt-risk', 'deposit-window', 'admitted-no-deposit', 'high-intent', 'deposit']` or title/summary containing "melt" or "deposit"

### Advancement Objectives

- **`re-engage-stalled`**: Matches items with tags `['stalled', 'inactive', 'no-activity', 'overdue', 'stale']` or title/summary containing "stalled" or "overdue"
- **`prep-briefs`**: Matches items with tags `['meeting', 'brief', 'prep', 'upcoming-meeting']` or title/summary containing "meeting" or "brief"
- **`advance-proposals`**: Matches items with tags `['proposal', 'review', 'stuck', 'late-stage']` or title/summary containing "proposal"
- **`stewardship-followups`**: Matches items with tags `['stewardship', 'thank-you', 'follow-up', 'gift']` or title/summary containing "stewardship" or "thank"

Source: `components/shared/queue/QueuePageClient.tsx` - `itemMatchesObjective` function (lines 77-121) and objective filtering in `filteredItems` useMemo (lines 421-471)

## Additional Components

### ReviewModeShell
- **Location**: `components/shared/queue/ReviewModeShell.tsx`
- **Responsibility**: Full-screen shell for Review Mode, handles arrow key navigation, provides top/bottom bars
- **Features**: Hides global chrome, supports custom topBar/bottomBar, arrow key navigation (↑/↓)
  
  Source: `components/shared/queue/ReviewModeShell.tsx` - `ReviewModeShell` component (lines 29-123)

### Workbench Mode Components
- **WorkbenchToolbar**: Split selector, search, filters button, review next button
- **FiltersDrawer**: Drawer for filter controls in workbench mode
- **ActiveFilterChips**: Display active filters as removable chips
- **ShortcutsOverlay**: Keyboard shortcuts help overlay
  
  Source: `components/shared/queue/QueuePageClient.tsx` - workbench mode rendering (lines 1020-1057)

### Split System (Advancement)
- **Location**: `components/shared/queue/splits/advancementSplits.ts`
- **Splits**: due-today, meeting-prep, first-drafts, stewardship, stalled, fyi
- **Usage**: Used in Review Mode and Workbench Mode for split-based filtering
  
  Source: `components/shared/queue/splits/advancementSplits.ts` - `advancementSplits` array (lines 8-96)

## Update Triggers

This document must be updated when:
- Component architecture changes
- Data contracts change
- URL parameters change
- Actions change
- State management changes
- Feature flags change
- Objective matching logic changes
- Review Mode behavior changes
- Workbench Mode behavior changes
- Split definitions change

