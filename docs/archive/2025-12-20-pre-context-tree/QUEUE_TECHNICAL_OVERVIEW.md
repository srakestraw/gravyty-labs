# Queue Technical Overview

## Table of Contents
1. [Overview](#overview)
2. [Data Model](#data-model)
3. [Layout & UI Structure](#layout--ui-structure)
4. [Component Architecture](#component-architecture)
5. [Code Reference](#code-reference)

---

## Overview

Queue is a centralized system for managing and triaging items that require attention across the AI agent ecosystem. It provides operators with a unified interface to filter, review, and resolve issues in real-time. The Queue system supports multiple workspaces (Admissions, Registrar, Student Success, etc.) and integrates with the Game Plan system for Admissions workspace.

### Key Features
- **Multi-workspace support**: Filter items by workspace, app, and working mode
- **Rich filtering**: Filter by role, status, type, severity, assignee, and search
- **Keyboard shortcuts**: Efficient navigation and action handling (J/K for navigation, E/S/H for actions)
- **Game Plan integration**: Admissions workspace supports objective-based filtering
- **Focus Mode**: Full-screen mode for Admissions workspace
- **Auto-advance**: Automatically moves to next item after resolving, snoozing, or holding
- **Optimistic updates**: UI updates immediately before API calls complete

---

## Data Model

### Core Types

#### `AgentOpsItem`

The primary data structure representing a queue item:

```typescript
export interface AgentOpsItem {
  id: string;
  type: AgentOpsItemType;
  severity: AgentOpsSeverity;
  status: AgentOpsStatus;

  title: string;
  summary: string;

  person?: AgentOpsPersonRef;
  agentId?: string;
  agentName?: string;

  role?: AgentRole;
  sourceSystem?: string;

  createdAt: string;
  updatedAt?: string;
  slaDueAt?: string;

  createdBy?: "agent" | "system" | "human";
  assignedTo?: string;
  tags?: string[];

  evalId?: string;
  guardrailId?: string;
}
```

#### `AgentOpsItemType`

Types of queue items:

```typescript
export type AgentOpsItemType =
  | "Error"
  | "Guardrail"
  | "QuietHours"
  | "FrequencyCap"
  | "DoNotEngage"
  | "HumanReview"
  | "Escalation"
  | "Task"
  | "OnHold";
```

#### `AgentOpsSeverity`

Severity levels:

```typescript
export type AgentOpsSeverity = "Low" | "Medium" | "High" | "Critical";
```

#### `AgentOpsStatus`

Status values:

```typescript
export type AgentOpsStatus = "Open" | "Snoozed" | "InProgress" | "Resolved";
```

#### `AgentRole`

Role types:

```typescript
export type AgentRole =
  | "Admissions"
  | "Registrar"
  | "Student Success"
  | "Career Services"
  | "Alumni Engagement"
  | "Advancement";
```

#### `AgentOpsPersonRef`

Person reference structure:

```typescript
export interface AgentOpsPersonRef {
  id: string;
  name: string;
  email?: string;
  externalId?: string;
  primaryRole?: AgentRole;
}
```

#### `AgentOpsFilters`

Filter configuration:

```typescript
export interface AgentOpsFilters {
  role: AgentRole | "All";
  status: AgentOpsStatus | "All";
  type: AgentOpsItemType | "All";
  severity: AgentOpsSeverity | "All";
  assignee: "Me" | "Unassigned" | "All";
  search: string;
}
```

#### `QueueAction`

Available actions on queue items:

```typescript
export type QueueAction = 
  | 'resolve' 
  | 'snooze' 
  | 'assign' 
  | 'hold' 
  | 'unsnooze' 
  | 'extendSnooze' 
  | 'reopen';
```

### Data Provider Interface

Queue items are accessed through the unified data provider pattern:

```typescript
export interface DataProvider {
  listQueueItems(ctx: DataContext): Promise<QueueItem[]>;
  // ... other methods
}

export type QueueItem = AgentOpsItem;
export type DataContext = {
  workspace?: string;
  app?: string;
  mode?: WorkingMode | 'operator' | 'global' | 'workspace';
  userId?: string;
  persona?: string;
};
```

---

## Layout & UI Structure

### Page Layout

The Queue page uses a two-column layout:

```
┌─────────────────────────────────────────────────────────┐
│ Header: Title, Description, Focus Mode Toggle           │
├─────────────────────────────────────────────────────────┤
│ Game Plan Panel (Admissions only)                        │
├─────────────────────────────────────────────────────────┤
│ Filters Bar                                              │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────────────────────────┐ │
│ │              │  │                                    │ │
│ │  Queue List  │  │      Detail Panel                 │ │
│ │  (Left)      │  │      (Right)                      │ │
│ │              │  │                                    │ │
│ │  - Items     │  │  - Header                         │ │
│ │  - Selection │  │  - Actions                       │ │
│ │  - Actions   │  │  - Metadata                      │ │
│ │              │  │  - Person Info                   │ │
│ │              │  │  - Agent Info                    │ │
│ └──────────────┘  └──────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Shortcut Footer (Fixed Bottom)                          │
└─────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
QueuePageClient (Main Container)
├── Segment Banner (if segment active)
├── Page Header
│   ├── Title & Description
│   └── Focus Mode Toggle (Admissions only)
├── Game Plan Panel (Admissions only)
├── AgentOpsFiltersBar
└── Queue Content (Grid Layout)
    ├── QueueList (Left Column)
    │   ├── GamePlanItemsLane (if objective active)
    │   └── Queue Items List
    └── QueueDetail (Right Column)
        ├── Header
        ├── Actions Row
        └── Detail Sections
            ├── Tags & Metadata
            ├── Person Section
            ├── Agent Section
            └── Metadata Grid
└── ShortcutFooter (Fixed)
```

### Responsive Behavior

- **Desktop**: Two-column layout with fixed left column width (280-380px) and flexible right column
- **Mobile**: Stacked layout (handled by CSS grid)
- **Focus Mode**: Full-screen mode that hides sidebar, header, and working mode selector

---

## Component Architecture

### Main Components

#### 1. `QueuePageClient`

The main container component that orchestrates all Queue functionality.

**Location**: `components/shared/queue/QueuePageClient.tsx`

**Responsibilities**:
- State management (items, filters, selection, game plan)
- Data loading via `dataClient`
- Filtering logic
- Action handling with optimistic updates
- Keyboard shortcuts
- Focus mode management
- Game Plan integration (Admissions only)

**Key State**:
- `allItems`: All queue items from data provider
- `filteredItems`: Items after applying filters and objectives
- `selectedItemId`: Currently selected item
- `filters`: Current filter configuration
- `gamePlanData`: Game Plan objectives and counts (Admissions)
- `gamePlanItems`: Items matching active objective (Admissions)

#### 2. `QueueList`

Displays the list of queue items in the left column.

**Location**: `components/ai-assistants/agent-ops/queue/QueueList.tsx`

**Responsibilities**:
- Render list of queue items
- Handle item selection
- Display inline action buttons (on hover)
- Show empty state
- Format dates, types, and statuses

**Visual Structure**:
- Each item shows: severity badge, type, status, title, person/agent/created info
- Selected item has indigo background and left border
- Hover reveals inline action buttons

#### 3. `QueueDetail`

Displays detailed information about the selected item in the right column.

**Location**: `components/ai-assistants/agent-ops/queue/QueueDetail.tsx`

**Responsibilities**:
- Display full item details
- Provide action buttons (resolve, snooze, assign, hold, etc.)
- Show person and agent information with navigation links
- Display metadata grid (role, created, SLA, assigned to, etc.)

**Visual Structure**:
- Header with type, severity, agent name, title, summary, status
- Action buttons row (contextual based on status)
- Tags and metadata badges
- Person section with "View Person" button
- Agent section with "View Agent" button
- Metadata grid (2 columns)

#### 4. `AgentOpsFiltersBar`

Filter controls for queue items.

**Location**: `components/ai-assistants/agent-ops/AgentOpsFiltersBar.tsx`

**Responsibilities**:
- Search input
- Role dropdown
- Status dropdown
- Type dropdown
- Severity dropdown
- Assignee dropdown

#### 5. `ShortcutFooter`

Fixed footer displaying keyboard shortcuts.

**Location**: `components/ai-assistants/agent-ops/queue/ShortcutFooter.tsx`

**Responsibilities**:
- Display keyboard shortcuts (J, K, E, S, H)
- Fixed position at bottom of viewport
- Styled with backdrop blur and gradient

#### 6. `QueueRow`

Alternative table row component (used in other contexts).

**Location**: `components/ai-assistants/agent-ops/queue/QueueRow.tsx`

**Responsibilities**:
- Render queue item as table row
- Used in table-based views

---

## Code Reference

### Type Definitions

```1:66:lib/agent-ops/types.ts
export type AgentRole =
  | "Admissions"
  | "Registrar"
  | "Student Success"
  | "Career Services"
  | "Alumni Engagement"
  | "Advancement";

export type AgentOpsItemType =
  | "Error"
  | "Guardrail"
  | "QuietHours"
  | "FrequencyCap"
  | "DoNotEngage"
  | "HumanReview"
  | "Escalation"
  | "Task"
  | "OnHold";

export type AgentOpsSeverity = "Low" | "Medium" | "High" | "Critical";
export type AgentOpsStatus = "Open" | "Snoozed" | "InProgress" | "Resolved";

export interface AgentOpsPersonRef {
  id: string;
  name: string;
  email?: string;
  externalId?: string;
  primaryRole?: AgentRole;
}

export interface AgentOpsItem {
  id: string;
  type: AgentOpsItemType;
  severity: AgentOpsSeverity;
  status: AgentOpsStatus;

  title: string;
  summary: string;

  person?: AgentOpsPersonRef;
  agentId?: string;
  agentName?: string;

  role?: AgentRole;
  sourceSystem?: string;

  createdAt: string;
  updatedAt?: string;
  slaDueAt?: string;

  createdBy?: "agent" | "system" | "human";
  assignedTo?: string;
  tags?: string[];

  evalId?: string;
  guardrailId?: string;
}

export interface AgentOpsFilters {
  role: AgentRole | "All";
  status: AgentOpsStatus | "All";
  type: AgentOpsItemType | "All";
  severity: AgentOpsSeverity | "All";
  assignee: "Me" | "Unassigned" | "All";
  search: string;
}
```

### Data Provider Interface

```19:24:lib/data/provider.ts
// Type alias for queue items (using AgentOpsItem as the underlying type)
export type QueueItem = AgentOpsItem;

export interface DataProvider {
  // Agent Ops / Queue Items
  listQueueItems(ctx: DataContext): Promise<QueueItem[]>;
```

### Main Queue Page Client

```1:592:components/shared/queue/QueuePageClient.tsx
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useClientSearchParams } from '@/lib/hooks/useClientSearchParams';
import { AgentOpsFilters, AgentOpsItem } from '@/lib/agent-ops/types';
import { dataClient } from '@/lib/data';
import { AgentOpsFiltersBar } from '@/components/ai-assistants/agent-ops/AgentOpsFiltersBar';
import { QueueList, type QueueAction } from '@/components/ai-assistants/agent-ops/queue/QueueList';
import { QueueDetail } from '@/components/ai-assistants/agent-ops/queue/QueueDetail';
import { ShortcutFooter } from '@/components/ai-assistants/agent-ops/queue/ShortcutFooter';
import { useHotkeys } from '@/lib/hooks/useHotkeys';
import { cn } from '@/lib/utils';
import { getSegmentFromSearchParams } from '@/components/shared/ai-platform/segments/segment-context';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { GamePlanPanel } from '@/components/shared/ai-platform/GamePlanPanel';
import { GamePlanItemsLane } from '@/components/shared/ai-platform/GamePlanItemsLane';
import { FocusModePage } from '@/components/shared/ai-platform/FocusModePage';

interface QueuePageClientProps {
  basePath?: string;
  defaultFilters?: Partial<AgentOpsFilters>;
  activeSegmentId?: string;
  activeSegment?: import('@/components/shared/ai-platform/segments/types').SegmentDefinition;
  workspaceId?: string;
}

function applyActionToItem(item: AgentOpsItem, action: QueueAction): AgentOpsItem {
  switch (action) {
    case 'resolve':
      return { ...item, status: 'Resolved' };
    case 'snooze':
      return { ...item, status: 'Snoozed' };
    case 'hold':
      return { ...item, status: 'InProgress' };
    case 'unsnooze':
      return { ...item, status: 'Open' };
    case 'reopen':
      return { ...item, status: 'Open' };
    case 'assign':
    case 'extendSnooze':
      // These actions don't change status directly
      return item;
    default:
      return item;
  }
}

// Helper function to check if an item matches an objective (matches provider logic)
function itemMatchesObjective(item: AgentOpsItem, objectiveId: string): boolean {
  const tags = item.tags || [];
  const titleLower = item.title.toLowerCase();
  const summaryLower = item.summary.toLowerCase();
  
  switch (objectiveId) {
    case 'stalled-applicants':
      return (
        tags.some(tag => 
          ['stalled', 'inactive', 'no-activity', 'incomplete-app', 'incomplete-application'].includes(tag.toLowerCase())
        ) ||
        titleLower.includes('stalled') ||
        titleLower.includes('incomplete') ||
        summaryLower.includes('stalled') ||
        summaryLower.includes('no activity')
      );
    
    case 'missing-documents':
      return (
        tags.some(tag => 
          ['missing-transcript', 'missing-docs', 'verification', 'recommendation-letter', 'transcript', 'missing'].includes(tag.toLowerCase())
        ) ||
        titleLower.includes('missing') ||
        titleLower.includes('transcript') ||
        titleLower.includes('document') ||
        summaryLower.includes('missing') ||
        summaryLower.includes('transcript')
      );
    
    case 'melt-risk':
      return (
        tags.some(tag => 
          ['melt-risk', 'deposit-window', 'admitted-no-deposit', 'high-intent', 'deposit'].includes(tag.toLowerCase())
        ) ||
        titleLower.includes('melt') ||
        titleLower.includes('deposit') ||
        titleLower.includes('admitted') ||
        summaryLower.includes('melt') ||
        summaryLower.includes('deposit')
      );
    
    default:
      return false;
  }
}

export function QueuePageClient({ basePath = '/ai-assistants', defaultFilters, activeSegmentId, activeSegment, workspaceId }: QueuePageClientProps) {
  const router = useRouter();
  const searchParams = useClientSearchParams();
  const [allItems, setAllItems] = useState<AgentOpsItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  
  // Game Plan state
  const [gamePlanData, setGamePlanData] = useState<{
    objectives: Array<{ id: string; title: string; shortTitle?: string; description?: string; impactText?: string }>;
    completedCount: number;
    totalCount: number;
  } | null>(null);
  const [gamePlanCounts, setGamePlanCounts] = useState<Record<string, number>>({});
  const [gamePlanItems, setGamePlanItems] = useState<AgentOpsItem[]>([]);
  const [isLoadingGamePlan, setIsLoadingGamePlan] = useState(true);
  
  // Get active objective from URL
  const activeObjectiveId = useMemo(() => {
    const objective = searchParams.get('objective');
    return objective || null;
  }, [searchParams]);
  
  // Focus Mode state management - use focus=1 (not focus=true)
  const isFocusMode = useMemo(() => {
    const focusParam = searchParams.get('focus');
    return focusParam === '1';
  }, [searchParams]);
  
  // Focus Mode toggle handlers (independent of Game Plan)
  const handleEnterFocusMode = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('focus', '1');
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };
  
  const handleExitFocusMode = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('focus');
    // Preserve all other params (including objective, filters, etc.)
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    router.replace(newUrl);
  };
  
  // Detect active segment: prefer props, then URL param
  const segment = useMemo(() => {
    if (activeSegment) return activeSegment;
    if (activeSegmentId) {
      const { getSegmentById } = require('@/components/shared/ai-platform/segments/mock-data');
      return getSegmentById(activeSegmentId);
    }
    return getSegmentFromSearchParams(Object.fromEntries(searchParams.entries()));
  }, [activeSegment, activeSegmentId, searchParams]);
  
  // Load queue items
  useEffect(() => {
    const loadItems = async () => {
      setIsLoadingItems(true);
      try {
        const ctx = {
          workspace: workspaceId || undefined,
          app: 'student-lifecycle',
          mode: 'team' as const,
        };
        const items = await dataClient.listQueueItems(ctx);
        setAllItems(items);
      } catch (error) {
        console.error('Failed to load queue items:', error);
      } finally {
        setIsLoadingItems(false);
      }
    };
    
    loadItems();
  }, [workspaceId]);
  
  // Load game plan data (only for admissions workspace)
  const [objectiveCompletionStatus, setObjectiveCompletionStatus] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const loadGamePlan = async () => {
      if (workspaceId !== 'admissions') {
        setIsLoadingGamePlan(false);
        return;
      }
      
      setIsLoadingGamePlan(true);
      try {
        const ctx = {
          workspace: 'admissions',
          app: 'student-lifecycle',
          mode: 'team' as const,
        };
        
        const [gamePlan, counts, operatorGamePlan] = await Promise.all([
          dataClient.getAdmissionsTeamGamePlan(ctx),
          dataClient.getAdmissionsQueueGamePlanCounts(ctx),
          dataClient.getAdmissionsOperatorGamePlan(ctx), // Get full game plan for completion status
        ]);
        
        if (gamePlan) {
          setGamePlanData({
            objectives: gamePlan.objectives,
            completedCount: gamePlan.completedCount,
            totalCount: gamePlan.totalCount,
          });
          setGamePlanCounts(counts);
          
          // Extract completion status from operator game plan items
          if (operatorGamePlan) {
            const completionMap: Record<string, boolean> = {};
            operatorGamePlan.items.forEach((item) => {
              completionMap[item.id] = item.status === 'completed';
            });
            setObjectiveCompletionStatus(completionMap);
          }
        }
      } catch (error) {
        console.error('Failed to load game plan:', error);
      } finally {
        setIsLoadingGamePlan(false);
      }
    };
    
    loadGamePlan();
  }, [workspaceId]);
  
  // Load game plan items when objective is active
  useEffect(() => {
    const loadGamePlanItems = async () => {
      if (!activeObjectiveId || workspaceId !== 'admissions') {
        setGamePlanItems([]);
        return;
      }
      
      try {
        const ctx = {
          workspace: 'admissions',
          app: 'student-lifecycle',
          mode: 'team' as const,
        };
        
        const items = await dataClient.getAdmissionsQueueItemsByObjective(ctx, activeObjectiveId, 10);
        setGamePlanItems(items);
      } catch (error) {
        console.error('Failed to load game plan items:', error);
        setGamePlanItems([]);
      }
    };
    
    loadGamePlanItems();
  }, [activeObjectiveId, workspaceId]);

  // Clear segment from URL
  const handleClearSegment = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('segment');
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    router.replace(newUrl);
  };
  
  // Handle game plan objective apply/clear
  const handleApplyObjective = (objectiveId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('objective', objectiveId);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };
  
  const handleClearObjective = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('objective');
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    router.replace(newUrl);
  };
  
  // Initialize filters with defaults if provided
  const getInitialFilters = (): AgentOpsFilters => {
    const baseFilters: AgentOpsFilters = {
      role: 'All',
      status: 'All',
      type: 'All',
      severity: 'All',
      assignee: 'All',
      search: '',
    };
    
    if (defaultFilters) {
      return { ...baseFilters, ...defaultFilters };
    }
    
    return baseFilters;
  };
  
  const [filters, setFilters] = useState<AgentOpsFilters>(getInitialFilters);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const defaultsAppliedRef = useRef(false);
  
  // Apply defaults only once on mount
  useEffect(() => {
    if (!defaultsAppliedRef.current && defaultFilters) {
      defaultsAppliedRef.current = true;
      setFilters((prev) => ({ ...prev, ...defaultFilters }));
    }
  }, [defaultFilters]);

  const filteredItems = useMemo(() => {
    let items = allItems;
    
    // If an objective is active, filter to only show items matching that objective
    if (activeObjectiveId && workspaceId === 'admissions') {
      items = items.filter((item) => itemMatchesObjective(item, activeObjectiveId));
    }
    
    // Apply standard filters
    return items.filter((item) => {
      if (filters.role !== 'All' && item.role !== filters.role) return false;
      if (filters.status !== 'All' && item.status !== filters.status) return false;
      if (filters.type !== 'All' && item.type !== filters.type) return false;
      if (filters.severity !== 'All' && item.severity !== filters.severity) return false;
      if (filters.assignee === 'Me' && item.assignedTo !== 'user-123') return false;
      if (filters.assignee === 'Unassigned' && item.assignedTo) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !item.title.toLowerCase().includes(searchLower) &&
          !item.summary.toLowerCase().includes(searchLower) &&
          !item.person?.name.toLowerCase().includes(searchLower) &&
          !item.agentName?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [allItems, filters, activeObjectiveId, workspaceId]);

  const selectedIndex = filteredItems.findIndex((i) => i.id === selectedItemId);
  const selectedItem = selectedIndex >= 0 ? filteredItems[selectedIndex] : filteredItems[0] ?? null;

  // Ensure something is selected once data loads
  useEffect(() => {
    if (!selectedItemId && filteredItems.length > 0) {
      setSelectedItemId(filteredItems[0].id);
    } else if (selectedItemId && !filteredItems.find((i) => i.id === selectedItemId)) {
      // Selected item is no longer in filtered set, select first item
      if (filteredItems.length > 0) {
        setSelectedItemId(filteredItems[0].id);
      } else {
        setSelectedItemId(null);
      }
    }
  }, [filteredItems, selectedItemId]);

  const handleNavigateToPerson = (personId: string) => {
    router.push(`${basePath}/agent-ops/people?id=${personId}`);
  };

  const handleNavigateToAgent = (agentId: string) => {
    router.push(`${basePath}/agents/${agentId}`);
  };

  // Unified action handler with optimistic updates and auto-advance
  const handleItemAction = async (id: string, action: QueueAction) => {
    // Find current index before update
    const currentIndex = filteredItems.findIndex((i) => i.id === id);

    // Optimistic UI update
    setAllItems((current) =>
      current.map((item) => (item.id === id ? applyActionToItem(item, action) : item))
    );

    // TODO: Call API to persist the action
    console.log(`Action ${action} on item:`, id);

    // Auto-advance to next item after resolve, snooze, or hold
    if (action === 'resolve' || action === 'snooze' || action === 'hold') {
      setTimeout(() => {
        // After state update, find next item in filtered list
        // Note: filteredItems will update on next render, so we advance based on current index
        if (currentIndex >= 0 && filteredItems.length > 0) {
          const nextIndex = (currentIndex + 1) % filteredItems.length;
          const next = filteredItems[nextIndex];
          if (next) {
            setSelectedItemId(next.id);
          } else if (filteredItems.length > 0) {
            // If we were at the last item, wrap to first
            setSelectedItemId(filteredItems[0].id);
          }
        }
      }, 100);
    }
  };

  const handleNextItem = () => {
    if (filteredItems.length === 0) return;
    const currentIndex = selectedIndex >= 0 ? selectedIndex : 0;
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    const next = filteredItems[nextIndex];
    if (next) setSelectedItemId(next.id);
  };

  const handlePrevItem = () => {
    if (filteredItems.length === 0) return;
    const currentIndex = selectedIndex >= 0 ? selectedIndex : 0;
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    const prev = filteredItems[prevIndex];
    if (prev) setSelectedItemId(prev.id);
  };

  // Keyboard shortcuts with auto-advance
  useHotkeys(
    {
      j: () => {
        handleNextItem();
      },
      k: () => {
        handlePrevItem();
      },
      e: () => {
        if (selectedItem) {
          handleItemAction(selectedItem.id, 'resolve');
        }
      },
      s: () => {
        if (selectedItem) {
          handleItemAction(selectedItem.id, 'snooze');
        }
      },
      h: () => {
        if (selectedItem) {
          handleItemAction(selectedItem.id, 'hold');
        }
      },
    },
    true
  );

  // Render queue content (same in both focus and unfocused modes)
  const renderQueueContent = () => (
    <div className="grid gap-3 flex-1 min-h-0 md:grid-cols-[minmax(280px,380px)_minmax(0,1fr)]">
      {/* Left: Queue List */}
      <section 
        className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
        style={{ height: 'calc(100vh - 14rem)' }}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Game Plan Items Lane (when objective is active) */}
          {activeObjectiveId && workspaceId === 'admissions' && gamePlanItems.length > 0 && (
            <div className="px-2 pt-2">
              <GamePlanItemsLane
                items={gamePlanItems}
                selectedItemId={selectedItem?.id ?? null}
                onSelectItem={(id) => {
                  setSelectedItemId(id);
                }}
                onItemAction={handleItemAction}
              />
            </div>
          )}
          
          {/* Main Queue List */}
          <QueueList
            items={filteredItems}
            selectedItemId={selectedItem?.id ?? null}
            onSelectItem={(id) => {
              setSelectedItemId(id);
            }}
            onEnterFocusMode={() => {}}
            onItemAction={handleItemAction}
          />
        </div>
      </section>

      {/* Right: Detail Panel */}
      <section className="flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm">
        {selectedItem ? (
          <QueueDetail
            item={selectedItem}
            focusMode={false}
            onExitFocusMode={() => {}}
            onNext={handleNextItem}
            onPrev={handlePrevItem}
            onAction={handleItemAction}
            onNavigateToPerson={handleNavigateToPerson}
            onNavigateToAgent={handleNavigateToAgent}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[400px] p-12">
            <div className="text-center">
              <p className="text-sm text-gray-500">Select an item to view details</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );

  // Render page content (same structure in both modes)
  const renderPageContent = () => (
    <div className="relative flex flex-col h-full pb-16">
      {/* Segment Banner */}
      {segment && (
        <div className="sticky top-0 z-10 bg-blue-50 border-b border-blue-200 px-4 py-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <FontAwesomeIcon icon="fa-solid fa-filter" className="h-4 w-4 text-blue-600" />
              <span className="text-gray-700">
                Queue scoped to segment: <span className="font-semibold text-blue-900">{segment.title}</span>
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSegment}
              className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
            >
              Clear segment
            </Button>
          </div>
        </div>
      )}

      {/* Page Header with Focus Mode Toggle */}
      <div className="flex-shrink-0 space-y-3 mb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Agent Ops — Queue</h1>
            <p className="text-sm text-gray-600 mt-1">
              All items that require attention across your agent ecosystem. Filter, triage, and resolve issues in real time.
            </p>
          </div>
          {/* Focus Mode Toggle Button (Admissions only) */}
          {workspaceId === 'admissions' && (
            <Button
              variant={isFocusMode ? "default" : "outline"}
              size="sm"
              onClick={isFocusMode ? handleExitFocusMode : handleEnterFocusMode}
              className={cn(
                isFocusMode && "bg-indigo-600 hover:bg-indigo-700 text-white"
              )}
            >
              <FontAwesomeIcon 
                icon={isFocusMode ? "fa-solid fa-compress" : "fa-solid fa-expand"} 
                className="h-3 w-3 mr-1.5" 
              />
              Focus mode
            </Button>
          )}
        </div>
        
        {/* Game Plan Panel (Admissions only) - always visible */}
        {workspaceId === 'admissions' && !isLoadingGamePlan && gamePlanData && (
          <GamePlanPanel
            objectives={gamePlanData.objectives}
            counts={gamePlanCounts}
            completedCount={gamePlanData.completedCount}
            totalCount={gamePlanData.totalCount}
            activeObjectiveId={activeObjectiveId}
            onApplyObjective={handleApplyObjective}
            onClearObjective={handleClearObjective}
            objectiveCompletionStatus={objectiveCompletionStatus}
          />
        )}
        
        {/* Filters - always show full filters */}
        <AgentOpsFiltersBar filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Queue Content */}
      {renderQueueContent()}

      {/* Shortcut Footer */}
      <ShortcutFooter />
    </div>
  );

  // Wrap with FocusModePage for Admissions workspace
  if (workspaceId === 'admissions') {
    return (
      <FocusModePage
        enabled={isFocusMode}
        onExit={handleExitFocusMode}
        hideChrome={{
          header: true,
          sidebar: true,
          workingMode: true,
        }}
        hideHeader={true}
      >
        {renderPageContent()}
      </FocusModePage>
    );
  }

  // Non-Admissions workspace: standard render without Focus Mode
  return renderPageContent();
}
```

### Queue List Component

```1:272:components/ai-assistants/agent-ops/queue/QueueList.tsx
'use client';

import React from 'react';
import { AgentOpsItem } from '@/lib/agent-ops/types';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';

const TYPE_LABELS: Record<string, string> = {
  Error: 'Error',
  Guardrail: 'Guardrail',
  QuietHours: 'Quiet Hours',
  DoNotEngage: 'Do Not Engage',
  HumanReview: 'Human Review',
  Escalation: 'Escalation',
  FrequencyCap: 'Frequency Cap',
  Task: 'Task',
  OnHold: 'On Hold',
};

const STATUS_LABELS: Record<string, string> = {
  Open: 'Open',
  InProgress: 'In Progress',
  Snoozed: 'Snoozed',
  Resolved: 'Resolved',
};

function formatTypeLabel(raw: string): string {
  return TYPE_LABELS[raw] ?? raw;
}

function formatStatusLabel(raw: string): string {
  return STATUS_LABELS[raw] ?? raw;
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'Critical':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'High':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Low':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Open':
      return 'bg-red-50 text-red-700';
    case 'InProgress':
      return 'bg-blue-50 text-blue-700';
    case 'Snoozed':
      return 'bg-gray-50 text-gray-700';
    case 'Resolved':
      return 'bg-green-50 text-green-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 30) {
    return `${diffDays}d ago`;
  } else if (diffMonths < 6) {
    return `${diffMonths}mo ago`;
  } else {
    return '>6mo ago';
  }
}

export type QueueAction = 'resolve' | 'snooze' | 'assign' | 'hold' | 'unsnooze' | 'extendSnooze' | 'reopen';

interface QueueListProps {
  items: AgentOpsItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onEnterFocusMode: () => void;
  onItemAction: (id: string, action: QueueAction) => void;
}

function InlineActionButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  icon?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 text-[11px] text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
      title={label}
    >
      {icon ? (
        <FontAwesomeIcon icon={icon} className="h-3 w-3" />
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
}

export function QueueList({
  items,
  selectedItemId,
  onSelectItem,
  onEnterFocusMode,
  onItemAction,
}: QueueListProps) {
  // Keyboard shortcuts are handled at the page level

  if (items.length === 0) {
    return (
      <div className="h-full flex items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center text-center">
          <FontAwesomeIcon
            icon="fa-solid fa-circle-check"
            className="h-8 w-8 text-green-500 mb-2"
          />
          <p className="text-sm font-medium text-gray-900">No items require attention right now.</p>
          <p className="text-xs text-gray-500 mt-1">Great job — everything is running smoothly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <ul className="divide-y divide-gray-100">
          {items.map((item) => {
            const isSelected = item.id === selectedItemId;
            return (
              <li
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={cn(
                  'flex items-center justify-between px-3 py-2 cursor-pointer transition-colors group border-b border-gray-100 text-xs',
                  isSelected
                    ? 'bg-indigo-50/60 border-l-2 border-l-indigo-500'
                    : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                )}
              >
                <div className="flex-1 min-w-0">
                  {/* Top line: Severity, Type, Status */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[10px] font-medium border',
                        getSeverityColor(item.severity)
                      )}
                    >
                      {item.severity}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {formatTypeLabel(item.type)}
                    </span>
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[10px] font-medium',
                        getStatusColor(item.status)
                      )}
                    >
                      {formatStatusLabel(item.status)}
                    </span>
                  </div>
                  {/* Main line: Title */}
                  <div className="text-xs font-medium text-gray-900 truncate mb-0.5" title={item.title}>
                    {item.title}
                  </div>
                  {/* Sub-line: Person • Agent • Created */}
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 truncate">
                    {item.person && (
                      <span className="truncate" title={item.person.name}>
                        {item.person.name}
                      </span>
                    )}
                    {item.person && item.agentName && <span>•</span>}
                    {item.agentName && (
                      <span className="truncate" title={item.agentName}>
                        {item.agentName}
                      </span>
                    )}
                    {(item.person || item.agentName) && <span>•</span>}
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
                <div className="ml-3 hidden gap-1 md:flex opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.status === 'Open' && (
                    <>
                      <InlineActionButton
                        label="Resolve"
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemAction(item.id, 'resolve');
                        }}
                        icon="fa-solid fa-check"
                      />
                      <InlineActionButton
                        label="Snooze"
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemAction(item.id, 'snooze');
                        }}
                        icon="fa-solid fa-clock"
                      />
                    </>
                  )}
                  {item.status === 'Snoozed' && (
                    <>
                      <InlineActionButton
                        label="Unsnooze"
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemAction(item.id, 'unsnooze');
                        }}
                        icon="fa-solid fa-bell"
                      />
                      <InlineActionButton
                        label="Extend"
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemAction(item.id, 'extendSnooze');
                        }}
                        icon="fa-solid fa-clock"
                      />
                    </>
                  )}
                  {item.status === 'Resolved' && (
                    <InlineActionButton
                      label="Reopen"
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemAction(item.id, 'reopen');
                      }}
                      icon="fa-solid fa-rotate-left"
                    />
                  )}
                  <InlineActionButton
                    label="View"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(item.id);
                      onEnterFocusMode();
                    }}
                    icon="fa-solid fa-arrow-right"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
  );
}
```

### Queue Detail Component

```1:367:components/ai-assistants/agent-ops/queue/QueueDetail.tsx
'use client';

import React from 'react';
import { AgentOpsItem } from '@/lib/agent-ops/types';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { QueueAction } from './QueueList';

const TYPE_LABELS: Record<string, string> = {
  Error: 'Error',
  Guardrail: 'Guardrail',
  QuietHours: 'Quiet Hours',
  DoNotEngage: 'Do Not Engage',
  HumanReview: 'Human Review',
  Escalation: 'Escalation',
  FrequencyCap: 'Frequency Cap',
  Task: 'Task',
  OnHold: 'On Hold',
};

const STATUS_LABELS: Record<string, string> = {
  Open: 'Open',
  InProgress: 'In Progress',
  Snoozed: 'Snoozed',
  Resolved: 'Resolved',
};

function formatTypeLabel(raw: string): string {
  return TYPE_LABELS[raw] ?? raw;
}

function formatStatusLabel(raw: string): string {
  return STATUS_LABELS[raw] ?? raw;
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'Critical':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'High':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Low':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Open':
      return 'bg-red-50 text-red-700';
    case 'InProgress':
      return 'bg-blue-50 text-blue-700';
    case 'Snoozed':
      return 'bg-gray-50 text-gray-700';
    case 'Resolved':
      return 'bg-green-50 text-green-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 30) {
    return `${diffDays}d ago`;
  } else if (diffMonths < 6) {
    return `${diffMonths}mo ago`;
  } else {
    return '>6mo ago';
  }
}

// Mock assignees for now
const MOCK_ASSIGNEES = [
  { id: 'user-123', name: 'John Doe' },
  { id: 'user-456', name: 'Jane Smith' },
  { id: 'user-789', name: 'Bob Johnson' },
];

interface QueueDetailProps {
  item: AgentOpsItem;
  focusMode: boolean;
  onExitFocusMode: () => void;
  onNext: () => void;
  onPrev: () => void;
  onAction: (id: string, action: QueueAction) => void;
  onNavigateToPerson?: (personId: string) => void;
  onNavigateToAgent?: (agentId: string) => void;
}

export function QueueDetail({
  item,
  focusMode,
  onExitFocusMode,
  onNext,
  onPrev,
  onAction,
  onNavigateToPerson,
  onNavigateToAgent,
}: QueueDetailProps) {
  // Keyboard shortcuts are handled at the page level

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <header className="flex items-start justify-between gap-3 pb-3 border-b border-gray-200">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase tracking-wide text-gray-500">
                Queue
              </span>
              <span className="text-[11px] text-gray-400">•</span>
              <span className="text-[11px] text-gray-500">
                {formatTypeLabel(item.type)}
              </span>
              <span className="text-[11px] text-gray-400">•</span>
              <span className="text-[11px] text-gray-500">{item.severity}</span>
              {item.agentName && (
                <>
                  <span className="text-[11px] text-gray-400">•</span>
                  <span className="text-[11px] text-gray-500">{item.agentName}</span>
                </>
              )}
            </div>
            <h2 className="text-base font-semibold text-gray-900">{item.title}</h2>
            <p className="text-sm text-gray-600">{item.summary}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                getStatusColor(item.status)
              )}
            >
              {formatStatusLabel(item.status)}
            </span>
          </div>
        </header>

        {/* Actions row */}
        <div className="flex flex-wrap gap-2 pb-3 border-b border-gray-200">
          {item.status === 'Open' && (
            <>
              <Button
                size="sm"
                className="text-xs"
                onClick={() => onAction(item.id, 'resolve')}
              >
                <FontAwesomeIcon icon="fa-solid fa-check" className="h-3 w-3" />
                Mark resolved
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => onAction(item.id, 'snooze')}
              >
                <FontAwesomeIcon icon="fa-solid fa-clock" className="h-3 w-3" />
                Snooze
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="text-xs">
                    <FontAwesomeIcon icon="fa-solid fa-user-plus" className="h-3 w-3" />
                    Assign…
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {MOCK_ASSIGNEES.map((assignee) => (
                    <DropdownMenuItem
                      key={assignee.id}
                      onClick={() => onAction(item.id, 'assign')}
                    >
                      {assignee.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => onAction(item.id, 'hold')}
              >
                <FontAwesomeIcon icon="fa-solid fa-pause" className="h-3 w-3" />
                Put on hold
              </Button>
            </>
          )}
          {item.status === 'Snoozed' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => onAction(item.id, 'unsnooze')}
              >
                <FontAwesomeIcon icon="fa-solid fa-bell" className="h-3 w-3" />
                Unsnooze
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => onAction(item.id, 'extendSnooze')}
              >
                <FontAwesomeIcon icon="fa-solid fa-clock" className="h-3 w-3" />
                Extend snooze
              </Button>
            </>
          )}
          {item.status === 'Resolved' && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => onAction(item.id, 'reopen')}
            >
              <FontAwesomeIcon icon="fa-solid fa-rotate-left" className="h-3 w-3" />
              Reopen
            </Button>
          )}
        </div>

        {/* Detail sections */}
        <div className="space-y-4">
          {/* Tags and metadata */}
          <div className="flex flex-wrap gap-2">
            <span
              className={cn(
                'px-2 py-1 rounded text-xs font-medium border',
                getSeverityColor(item.severity)
              )}
            >
              {item.severity}
            </span>
            <span
              className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                getStatusColor(item.status)
              )}
            >
              {formatStatusLabel(item.status)}
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
              {formatTypeLabel(item.type)}
            </span>
            {item.tags?.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Person section */}
          {item.person && (
            <div className="pt-3 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-500 mb-2">Person</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.person.name}</div>
                  {item.person.email && (
                    <div className="text-xs text-gray-500">{item.person.email}</div>
                  )}
                </div>
                {onNavigateToPerson && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigateToPerson(item.person!.id)}
                    className="text-xs"
                  >
                    View Person
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Agent section */}
          {item.agentName && (
            <div className="pt-3 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-500 mb-2">Agent</div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-900">{item.agentName}</div>
                {item.agentId && onNavigateToAgent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigateToAgent(item.agentId!)}
                    className="text-xs"
                  >
                    View Agent
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Metadata grid */}
          <div className="pt-3 border-t border-gray-200 grid grid-cols-2 gap-4">
            {item.role && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Role</div>
                <div className="text-sm text-gray-900">{item.role}</div>
              </div>
            )}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Created</div>
              <div className="text-sm text-gray-900">{formatDate(item.createdAt)}</div>
            </div>
            {item.slaDueAt && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">SLA Due</div>
                <div className="text-sm text-gray-900">{formatDate(item.slaDueAt)}</div>
              </div>
            )}
            {item.assignedTo && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Assigned To</div>
                <div className="text-sm text-gray-900">User {item.assignedTo}</div>
              </div>
            )}
            {item.sourceSystem && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Source System</div>
                <div className="text-sm text-gray-900">{item.sourceSystem}</div>
              </div>
            )}
            {item.createdBy && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Created By</div>
                <div className="text-sm text-gray-900 capitalize">{item.createdBy}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Filters Bar Component

```1:177:components/ai-assistants/agent-ops/AgentOpsFiltersBar.tsx
'use client';

import { AgentOpsFilters, AgentRole, AgentOpsStatus, AgentOpsItemType, AgentOpsSeverity } from '@/lib/agent-ops/types';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AgentOpsFiltersBarProps {
  filters: AgentOpsFilters;
  onFiltersChange: (filters: AgentOpsFilters) => void;
}

const ROLES: AgentRole[] = [
  'Admissions',
  'Registrar',
  'Student Success',
  'Career Services',
  'Alumni Engagement',
  'Advancement',
];

const STATUSES: AgentOpsStatus[] = ['Open', 'Snoozed', 'InProgress', 'Resolved'];

const TYPES: AgentOpsItemType[] = [
  'Error',
  'Guardrail',
  'QuietHours',
  'FrequencyCap',
  'DoNotEngage',
  'HumanReview',
  'Escalation',
  'Task',
  'OnHold',
];

const TYPE_LABELS: Record<string, string> = {
  Error: 'Error',
  Guardrail: 'Guardrail',
  QuietHours: 'Quiet Hours',
  FrequencyCap: 'Frequency Cap',
  DoNotEngage: 'Do Not Engage',
  HumanReview: 'Human Review',
  Escalation: 'Escalation',
  Task: 'Task',
  OnHold: 'On Hold',
};

const STATUS_LABELS: Record<string, string> = {
  Open: 'Open',
  InProgress: 'In Progress',
  Snoozed: 'Snoozed',
  Resolved: 'Resolved',
};

const SEVERITIES: AgentOpsSeverity[] = ['Low', 'Medium', 'High', 'Critical'];

export function AgentOpsFiltersBar({ filters, onFiltersChange }: AgentOpsFiltersBarProps) {
  const updateFilter = <K extends keyof AgentOpsFilters>(
    key: K,
    value: AgentOpsFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <FontAwesomeIcon
            icon="fa-solid fa-magnifying-glass"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
          <Input
            type="text"
            placeholder="Search items..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Role Filter */}
      <div className="min-w-[140px]">
        <select
          value={filters.role}
          onChange={(e) => updateFilter('role', e.target.value as AgentRole | 'All')}
          className={cn(
            'h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm',
            'focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
          )}
        >
          <option value="All">All Roles</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="min-w-[140px]">
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value as AgentOpsStatus | 'All')}
          className={cn(
            'h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm',
            'focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
          )}
        >
          <option value="All">All Statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status] ?? status}
            </option>
          ))}
        </select>
      </div>

      {/* Type Filter */}
      <div className="min-w-[140px]">
        <select
          value={filters.type}
          onChange={(e) => updateFilter('type', e.target.value as AgentOpsItemType | 'All')}
          className={cn(
            'h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm',
            'focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
          )}
        >
          <option value="All">All Types</option>
          {TYPES.map((type) => (
            <option key={type} value={type}>
              {TYPE_LABELS[type] ?? type}
            </option>
          ))}
        </select>
      </div>

      {/* Severity Filter */}
      <div className="min-w-[120px]">
        <select
          value={filters.severity}
          onChange={(e) => updateFilter('severity', e.target.value as AgentOpsSeverity | 'All')}
          className={cn(
            'h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm',
            'focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
          )}
        >
          <option value="All">All Severities</option>
          {SEVERITIES.map((severity) => (
            <option key={severity} value={severity}>
              {severity}
            </option>
          ))}
        </select>
      </div>

      {/* Assignee Filter */}
      <div className="min-w-[140px]">
        <select
          value={filters.assignee}
          onChange={(e) => updateFilter('assignee', e.target.value as 'Me' | 'Unassigned' | 'All')}
          className={cn(
            'h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm',
            'focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
          )}
        >
          <option value="All">All Assignees</option>
          <option value="Me">Assigned to Me</option>
          <option value="Unassigned">Unassigned</option>
        </select>
      </div>
    </div>
  );
}
```

### Shortcut Footer Component

```1:55:components/ai-assistants/agent-ops/queue/ShortcutFooter.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ShortcutFooterProps {
  className?: string;
}

export function ShortcutFooter({ className }: ShortcutFooterProps) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center pb-3',
        className
      )}
    >
      <div
        className={cn(
          'pointer-events-auto inline-flex flex-wrap items-center justify-center gap-4 rounded-full border border-white/60',
          'bg-white/80 bg-gradient-to-r from-indigo-50/80 via-white/90 to-indigo-50/80',
          'px-5 py-2 text-[11px] font-medium text-slate-600 shadow-[0_10px_40px_rgba(15,23,42,0.12)]',
          'backdrop-blur-md',
          'md:gap-6'
        )}
      >
        <ShortcutHint keyLabel="J" text="previous" />
        <Divider />
        <ShortcutHint keyLabel="K" text="next" />
        <Divider />
        <ShortcutHint keyLabel="E" text="to resolve" />
        <Divider />
        <ShortcutHint keyLabel="S" text="to snooze" />
        <Divider />
        <ShortcutHint keyLabel="H" text="to put on hold" />
      </div>
    </div>
  );
}

function ShortcutHint({ keyLabel, text }: { keyLabel: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-slate-300 bg-white px-1 text-[10px] font-semibold text-slate-700 shadow-sm">
        {keyLabel}
      </span>
      <span>{text}</span>
    </div>
  );
}

function Divider() {
  return <span className="h-4 w-px bg-slate-200" />;
}
```

### Example Mock Data

```1:443:lib/agent-ops/mock.ts
import { AgentOpsItem } from './types';

export function getAdmissionsQueueItems(): AgentOpsItem[] {
  return [
    {
      id: 'admissions-item-1',
      type: 'Error',
      severity: 'Critical',
      status: 'Open',
      title: 'Missing Transcript - Critical',
      summary: 'Transcript Helper Agent unable to verify transcript for applicant. Transcript not found in SIS system.',
      person: {
        id: 'admissions-person-1',
        name: 'Sarah Chen',
        email: 'sarah.chen@example.edu',
        externalId: 'STU-2024-001',
        primaryRole: 'Admissions',
      },
      agentId: 'agent-transcript-helper',
      agentName: 'Transcript Helper Agent',
      role: 'Admissions',
      sourceSystem: 'SIS',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:35:00Z',
      slaDueAt: '2024-01-15T14:30:00Z',
      createdBy: 'system',
      tags: ['transcript', 'missing', 'api-error', 'sis-integration'],
    },
    // ... more items
  ];
}
```

---

## Key Behaviors

### Filtering Logic

1. **Objective Filtering** (Admissions only): If an objective is active, items are first filtered to match the objective using tag, title, and summary matching.
2. **Standard Filters**: Applied after objective filtering:
   - Role: Exact match
   - Status: Exact match
   - Type: Exact match
   - Severity: Exact match
   - Assignee: "Me" matches `assignedTo === 'user-123'`, "Unassigned" matches `!assignedTo`
   - Search: Case-insensitive search across title, summary, person name, and agent name

### Action Handling

Actions update item status optimistically:
- `resolve` → `status: 'Resolved'`
- `snooze` → `status: 'Snoozed'`
- `hold` → `status: 'InProgress'`
- `unsnooze` → `status: 'Open'`
- `reopen` → `status: 'Open'`
- `assign` and `extendSnooze` don't change status directly

After resolve, snooze, or hold actions, the UI automatically advances to the next item in the filtered list.

### Keyboard Shortcuts

- `J`: Navigate to next item
- `K`: Navigate to previous item
- `E`: Resolve current item
- `S`: Snooze current item
- `H`: Put current item on hold

### Focus Mode (Admissions Only)

Focus mode provides a full-screen experience by:
- Hiding sidebar
- Hiding header
- Hiding working mode selector
- Maximizing content area

Toggle via the "Focus mode" button in the header or URL parameter `focus=1`.

### Game Plan Integration (Admissions Only)

When an objective is active:
1. Queue items are filtered to match the objective
2. A `GamePlanItemsLane` appears above the main queue list showing top items for that objective
3. The `GamePlanPanel` shows completion status and allows applying/clearing objectives

---

## Integration Points

### Data Provider

Queue uses the unified data provider pattern (`@/lib/data`):
- `dataClient.listQueueItems(ctx)` - Load queue items
- `dataClient.getAdmissionsTeamGamePlan(ctx)` - Load game plan (Admissions)
- `dataClient.getAdmissionsQueueGamePlanCounts(ctx)` - Load game plan counts (Admissions)
- `dataClient.getAdmissionsQueueItemsByObjective(ctx, objectiveId, limit)` - Load objective items (Admissions)

### Navigation

- Person navigation: `${basePath}/agent-ops/people?id=${personId}`
- Agent navigation: `${basePath}/agents/${agentId}`

### URL Parameters

- `segment`: Active segment ID
- `objective`: Active objective ID (Admissions)
- `focus`: Focus mode enabled (`focus=1`)

---

## Future Enhancements

- API integration for persisting actions (currently TODO)
- Real-time updates via WebSocket or polling
- Bulk actions (resolve multiple items)
- Custom filter presets
- Export functionality
- Advanced sorting options
- SLA tracking and alerts


