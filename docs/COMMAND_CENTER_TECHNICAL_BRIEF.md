# Command Center Implementation - Technical Brief

## Overview

The Command Center is a workspace-specific dashboard that provides contextual insights, actionable tasks, and AI assistant coordination for different personas (Admissions, Registrar, Student Success, etc.) and working modes (Team/Operator vs Leadership). It serves as the primary entry point for users to understand "What should I focus on today?" and provides execution surfaces for daily priorities.

## Architecture

### High-Level Flow

```
Page Route → CommandCenterPageClient → Instance Resolution → Mode-Specific Component → Data Provider → UI Rendering
```

1. **Route Entry**: Pages at `/admissions/ai`, `/student-lifecycle/[workspace]/ai`, etc.
2. **Orchestration**: `CommandCenterPageClient` determines which view to render
3. **Instance Resolution**: Maps `(appId, workspaceId, mode)` to specific content instances
4. **Component Selection**: Renders either existing implementation, placeholder, or persona selector
5. **Data Loading**: Components fetch data via unified `dataClient` provider
6. **UI Rendering**: Mode-specific layouts with contextual cards and sections

## Key Components

### 1. CommandCenterPageClient (`components/shared/ai-platform/CommandCenterPageClient.tsx`)

**Purpose**: Main orchestrator that routes to appropriate Command Center view based on context.

**Key Responsibilities**:
- Resolves Command Center instance from `(appId, workspaceId, mode)`
- Determines whether to show existing content, placeholder, or persona selector
- Handles workspace mode vs global mode logic
- Manages persona selection for global mode
- Renders appropriate header/greeting based on context

**Key Logic**:
```typescript
// Instance resolution (workspace mode only)
const instanceKey = resolveCommandCenterInstance(
  context?.appId,
  context?.workspaceId,
  normalizeWorkingMode(workingMode)
);

// View selection
- Admissions Leadership: workspace='admissions' + mode='leadership'
- Admissions Team: workspace='admissions' + mode='team'
- Placeholder: instanceKey exists but not in existingInstances list
- Persona Selector: global mode or legacy persona-based view
```

### 2. AdmissionsOperatorCommandCenter (`components/shared/ai-platform/AdmissionsOperatorCommandCenter.tsx`)

**Purpose**: Two-column layout for Admissions Team/Operator mode.

**Layout**:
- **Left Column (2fr)**: Today's Focus → Today's Game Plan → Goal Tracker
- **Right Column (1fr)**: Momentum → Flagged Risks → Recent Wins → Assistants → Recommended Agents → Recent Activity

**Data Sources** (via `dataClient`):
- `getAdmissionsOperatorTodaysFocus(ctx)`
- `getAdmissionsOperatorGamePlan(ctx)`
- `getAdmissionsOperatorMomentum(ctx)`
- `getAdmissionsOperatorFlaggedRisks(ctx)`
- `getAdmissionsOperatorGoalTracker(ctx)`
- `getAdmissionsOperatorAssistants(ctx)`
- `getAdmissionsOperatorRecentWins(ctx)`
- `getAdmissionsOperatorRecentActivity(ctx)`

**Design Philosophy**: Execution-focused, answers "What should I focus on today?" with Game Plan as dominant surface.

### 3. AdmissionsLeadershipCommandCenter (`components/shared/ai-platform/AdmissionsLeadershipCommandCenter.tsx`)

**Purpose**: Forecast-led, decision-focused experience for Admissions Leadership mode.

**Key Sections**:
1. **Status Summary**: Narrative forecast with optional trend chart
2. **Key Risks & Opportunities**: Admissions-owned items with forecast impact
3. **Upstream Demand Signals**: Context-only (not admissions-controlled)
4. **What Changed**: Delta-based explanations for forecast gap
5. **Recommended Interventions**: Forecast-driven actions with impact estimates
6. **What to Watch Next**: Forecast validation signals
7. **Insights & Tracking**: Secondary metrics (outcome coverage, flow health, intervention impact)

**Data Sources** (via `dataClient`):
- `getAdmissionsLeadershipData(ctx)`
- `getAdmissionsLeadershipInsights(ctx)`
- `getAdmissionsLeadershipTrend(ctx)` (optional chart data)

**Design Philosophy**: Forecast-first, answers "Where will we land?" and "What should we do now?" with interventions tied to forecast impact.

### 4. CommandCenterPlaceholder (`components/shared/ai-platform/CommandCenterPlaceholder.tsx`)

**Purpose**: Shows "coming soon" message for unimplemented Command Center instances.

**Usage**: Rendered when `instanceKey` exists but `isExistingInstance(instanceKey)` returns `false`.

### 5. Operator Section Cards (`components/shared/ai-platform/operator-sections/`)

**Modular card components** for Admissions Operator view:
- `TodaysFocusCard.tsx` - Framing cue for Game Plan
- `TodaysGamePlanCard.tsx` - Dominant execution surface
- `MomentumCard.tsx` - Streak, weekly challenge, score
- `FlaggedRisksCard.tsx` - Risk list with severity
- `GoalTrackerCard.tsx` - Goal metrics with progress
- `AssistantsWorkingCard.tsx` - Active assistants list
- `RecentWinsCard.tsx` - Recent accomplishments
- `RecentActivityCard.tsx` - Activity timeline
- `RecommendedAgentsCard.tsx` - Recommended agents for workspace

## Data Provider Pattern

### Unified Data Client (`lib/data/index.ts`)

**Single Source of Truth**: All data access goes through `dataClient` exported from `lib/data/index.ts`.

**Provider Selection**: Controlled by `NEXT_PUBLIC_DATA_PROVIDER` environment variable:
- `mock` (default): Uses `mockProvider` for development
- Future: `http` for HTTP API, `mcp` for MCP server

### Data Context (`lib/data/provider.ts`)

**Context Object**:
```typescript
type DataContext = {
  workspace?: string;      // e.g., 'admissions', 'registrar'
  app?: string;            // e.g., 'student-lifecycle', 'career-services'
  mode?: WorkingMode;      // 'team' | 'leadership' (accepts legacy 'operator')
  userId?: string;         // Current user ID for user-specific filtering
  persona?: string;        // Optional persona identifier
};
```

**Usage Pattern**:
```typescript
const ctx = {
  workspace: 'admissions',
  app: 'student-lifecycle',
  mode: 'team',
  userId: currentUser?.id,
};

const data = await dataClient.getAdmissionsOperatorGamePlan(ctx);
```

### Command Center Data Methods

**Admissions Leadership**:
- `getAdmissionsLeadershipData(ctx)` → `AdmissionsLeadershipData`
- `getAdmissionsLeadershipInsights(ctx)` → `AdmissionsLeadershipInsights`
- `getAdmissionsLeadershipTrend(ctx)` → `AdmissionsLeadershipTrendData`

**Admissions Operator**:
- `getAdmissionsOperatorTodaysFocus(ctx)` → `AdmissionsOperatorTodaysFocusData`
- `getAdmissionsOperatorGamePlan(ctx)` → `AdmissionsOperatorGamePlanData`
- `getAdmissionsOperatorMomentum(ctx)` → `AdmissionsOperatorMomentumData`
- `getAdmissionsOperatorFlaggedRisks(ctx)` → `AdmissionsOperatorFlaggedRiskData[]`
- `getAdmissionsOperatorGoalTracker(ctx)` → `AdmissionsOperatorGoalTrackerData`
- `getAdmissionsOperatorAssistants(ctx)` → `AdmissionsOperatorAssistantData[]`
- `getAdmissionsOperatorRecentWins(ctx)` → `AdmissionsOperatorRecentWinData[]`
- `getAdmissionsOperatorRecentActivity(ctx)` → `AdmissionsOperatorRecentActivityData[]`

### Mock Provider Implementation (`lib/data/providers/mockProvider.ts`)

**Structure**:
- All methods are async and return typed data
- Simulates network delay with `delay()` helper
- Filters by context (workspace, app, mode) before returning data
- Normalizes legacy `'operator'` mode to `'team'` for backwards compatibility

**Example**:
```typescript
async getAdmissionsOperatorGamePlan(ctx: DataContext): Promise<AdmissionsOperatorGamePlanData | null> {
  await delay(150);
  
  // Normalize mode for backwards compatibility
  const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
  if (ctx.workspace !== 'admissions' || normalizedMode !== 'team') {
    return null;
  }

  return {
    total: 3,
    completed: 1,
    items: [/* ... */],
  };
}
```

## Instance Resolution

### Resolver (`lib/command-center/resolver.ts`)

**Purpose**: Maps `(appId, workspaceId, mode)` to unique instance keys for content routing.

**Key Functions**:

1. **`resolveCommandCenterInstance(appId, workspaceId, mode)`**
   - Returns: `CommandCenterInstanceKey` (format: `<appId>:<workspaceId>:<mode>`)
   - Normalizes mode: `'operator'` → `'team'`
   - Handles single-app cases (uses `appId` as both app and workspace if needed)

2. **`isExistingInstance(key)`**
   - Returns: `boolean`
   - Checks if instance key has implemented content
   - Used to determine placeholder vs actual content

**Existing Instances**:
```typescript
const existingInstances = [
  'student-lifecycle:admissions:team',
  'student-lifecycle:admissions:leadership',
  'student-lifecycle:registrar:team',
  'student-lifecycle:student-success:team',
  'student-lifecycle:financial-aid:team',
  'student-lifecycle:housing:team',
  'career-services:career-services:team',
  'alumni-engagement:alumni-engagement:team',
  'advancement:advancement:team',
  // Legacy 'operator' keys also supported
];
```

## Working Modes

### Working Mode Utilities (`lib/command-center/workingModeUtils.ts`)

**Types**:
```typescript
type WorkingMode = 'team' | 'leadership';
```

**Functions**:
- `normalizeWorkingMode(mode)` - Converts `'operator'` → `'team'`, validates mode
- `isValidWorkingMode(mode)` - Type guard for valid modes (including legacy `'operator'`)

**Backwards Compatibility**: Legacy `'operator'` mode is accepted throughout the codebase and normalized to `'team'` internally.

### Mode Selection

**Workspace Mode**: Uses `useWorkspaceMode` hook to get/set working mode per workspace (stored in localStorage).

**Mode Impact**:
- **Team/Operator**: Execution-focused, task-oriented view (AdmissionsOperatorCommandCenter)
- **Leadership**: Forecast-led, decision-focused view (AdmissionsLeadershipCommandCenter)

## File Structure

```
components/shared/ai-platform/
├── CommandCenterPageClient.tsx          # Main orchestrator
├── AdmissionsOperatorCommandCenter.tsx  # Team/Operator view
├── AdmissionsLeadershipCommandCenter.tsx # Leadership view
├── CommandCenterPlaceholder.tsx         # Placeholder for unimplemented
├── operator-sections/                   # Modular cards for operator view
│   ├── TodaysFocusCard.tsx
│   ├── TodaysGamePlanCard.tsx
│   ├── MomentumCard.tsx
│   ├── FlaggedRisksCard.tsx
│   ├── GoalTrackerCard.tsx
│   ├── AssistantsWorkingCard.tsx
│   ├── RecentWinsCard.tsx
│   ├── RecentActivityCard.tsx
│   ├── RecommendedAgentsCard.tsx
│   └── index.ts
└── InsightsAndTrackingSection.tsx       # Leadership insights section

lib/command-center/
├── resolver.ts                          # Instance resolution logic
└── workingModeUtils.ts                  # Mode normalization

lib/data/
├── index.ts                              # dataClient export
├── provider.ts                           # DataProvider interface & types
└── providers/
    └── mockProvider.ts                   # Mock implementation

app/(shell)/
├── admissions/ai/page.tsx               # Admissions route
├── student-lifecycle/[workspace]/ai/
│   └── page.tsx                         # Workspace-specific routes
└── [other-workspaces]/ai/page.tsx       # Other workspace routes
```

## Data Flow

### Component → Data Provider Flow

1. **Component mounts** (e.g., `AdmissionsOperatorCommandCenter`)
2. **useEffect triggers** data loading
3. **Context created** with workspace/app/mode/userId
4. **dataClient methods called** with context
5. **Provider filters** data by context
6. **Data returned** to component
7. **State updated** and UI re-renders

### Example: Loading Game Plan

```typescript
// In AdmissionsOperatorCommandCenter.tsx
useEffect(() => {
  const loadData = async () => {
    const ctx = {
      workspace: 'admissions',
      app: 'student-lifecycle',
      mode: 'team' as const,
    };

    const gamePlanData = await dataClient.getAdmissionsOperatorGamePlan(ctx);
    setGamePlan(gamePlanData);
  };
  loadData();
}, []);
```

## Type Definitions

### Command Center Data Types (`lib/data/provider.ts`)

**Admissions Leadership**:
- `AdmissionsLeadershipData` - Main leadership dashboard data
- `AdmissionsLeadershipInsights` - Secondary metrics
- `AdmissionsLeadershipTrendData` - Chart data
- `AdmissionsLeadershipIntervention` - Intervention items

**Admissions Operator**:
- `AdmissionsOperatorTodaysFocusData` - Focus summary
- `AdmissionsOperatorGamePlanData` - Game plan with items
- `AdmissionsOperatorGamePlanItem` - Individual task with status/goal impacts
- `AdmissionsOperatorMomentumData` - Streak and score
- `AdmissionsOperatorFlaggedRiskData` - Risk items
- `AdmissionsOperatorGoalTrackerData` - Goal metrics
- `AdmissionsOperatorAssistantData` - Assistant info
- `AdmissionsOperatorRecentWinData` - Win items
- `AdmissionsOperatorRecentActivityData` - Activity timeline

## Key Design Decisions

### 1. Unified Data Provider
- **Why**: Single source of truth, easy to switch between mock/HTTP/MCP
- **Benefit**: UI code doesn't change when data source changes

### 2. Context-Based Filtering
- **Why**: All data filtered by workspace/app/mode at provider level
- **Benefit**: Consistent filtering, easier to add new data sources

### 3. Instance Resolution
- **Why**: Maps routing context to specific content implementations
- **Benefit**: Supports gradual rollout of Command Center instances

### 4. Mode Normalization
- **Why**: Backwards compatibility with legacy `'operator'` mode
- **Benefit**: Existing code continues to work while migrating to `'team'`

### 5. Two-Column Layout (Operator)
- **Why**: Game Plan as dominant execution surface, supporting info in sidebar
- **Benefit**: Clear visual hierarchy, focused execution

### 6. Forecast-First (Leadership)
- **Why**: Leadership needs decision context, not task lists
- **Benefit**: Answers "where will we land?" before "what should we do?"

## Future Extensibility

### Adding New Command Center Instances

1. **Add instance key** to `isExistingInstance()` in `resolver.ts`
2. **Create component** (e.g., `RegistrarLeadershipCommandCenter.tsx`)
3. **Add data methods** to `DataProvider` interface in `provider.ts`
4. **Implement methods** in `mockProvider.ts` (and future providers)
5. **Add routing logic** in `CommandCenterPageClient.tsx`

### Adding New Data Sources

1. **Create provider** (e.g., `httpProvider.ts` or `mcpProvider.ts`)
2. **Implement `DataProvider` interface**
3. **Update `createProvider()`** in `lib/data/index.ts`
4. **Set environment variable** `NEXT_PUBLIC_DATA_PROVIDER`

## Testing Considerations

- **Data Provider**: Mock provider enables easy testing without external dependencies
- **Context Filtering**: Test that data is correctly filtered by workspace/app/mode
- **Mode Normalization**: Verify legacy `'operator'` mode works correctly
- **Instance Resolution**: Test that correct instances are resolved for different contexts
- **Component Isolation**: Operator section cards are modular and testable independently

## Related Documentation

- **Data Provider Pattern**: See `lib/data/README.md` (if exists)
- **Working Mode**: See `lib/command-center/workingModeUtils.ts`
- **AI Platform Types**: See `components/shared/ai-platform/types.ts`
- **Workspace Configuration**: See `lib/student-lifecycle/workspaces.ts`

