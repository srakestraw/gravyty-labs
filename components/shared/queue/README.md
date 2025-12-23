# Queue Review Mode

Review Mode is a keyboard-first, distraction-free interface for rapidly triaging queue items, inspired by Superhuman's email review experience.

## Features

- **Route-driven**: Deep linkable via `?mode=review&itemId=123`
- **Keyboard-first**: J/K navigation, Enter to enter, Esc to exit
- **Auto-advance**: Automatically moves to next item after completing actions
- **Split tabs**: Configurable category filters (e.g., "Due today", "Meeting prep")
- **Undo support**: Z key to undo last action
- **Persistent state**: Preserves list scroll position and filters on exit

## Architecture

### Core Components

1. **ReviewModeShell** (`ReviewModeShell.tsx`)
   - Wraps content and hides global chrome
   - Provides top bar and bottom action bar slots

2. **SplitTabs** (`SplitTabs.tsx`)
   - Renders configurable queue splits as tabs
   - Uses adapter pattern for product-specific splits

3. **ReviewActionBar** (`ReviewActionBar.tsx`)
   - Sticky bottom bar with action buttons
   - Shows key hints for keyboard shortcuts

4. **useQueueReviewController** (`useQueueReviewController.ts`)
   - Manages Review Mode state (split, current item, navigation, undo stack)
   - Handles auto-advance logic

### Integration

Review Mode is integrated into `QueuePageClient.tsx` and is controlled by the `queueReviewMode` feature flag.

## Customization Guide

### Adding Custom Splits

Products can provide their own splits by creating a splits configuration file:

```typescript
// splits/myProductSplits.ts
import { QueueSplit } from '../SplitTabs';
import { AgentOpsItem } from '@/lib/agent-ops/types';

export const myProductSplits: QueueSplit[] = [
  {
    id: 'urgent',
    label: 'Urgent',
    icon: 'fa-solid fa-exclamation-triangle',
    filterFn: (item: AgentOpsItem) => {
      return item.severity === 'Critical' || item.severity === 'High';
    },
  },
  {
    id: 'follow-up',
    label: 'Follow-up',
    icon: 'fa-solid fa-arrow-rotate-right',
    filterFn: (item: AgentOpsItem) => {
      return item.tags?.includes('follow-up') || false;
    },
  },
];

export function getDefaultSplits(workspaceId?: string): QueueSplit[] {
  if (workspaceId === 'my-product') {
    return myProductSplits;
  }
  return [];
}
```

Then update `QueuePageClient.tsx`:

```typescript
import { getDefaultSplits } from './splits/myProductSplits';

// In component:
const splits = useMemo(() => {
  return getDefaultSplits(workspaceId);
}, [workspaceId]);
```

### Customizing Actions

Actions are built dynamically based on the current item's status. To customize, modify the `reviewActions` useMemo in `QueuePageClient.tsx`:

```typescript
const reviewActions = useMemo((): ReviewAction[] => {
  const item = reviewController.currentItem;
  if (!item) return [];

  // Add your custom actions here
  const actions: ReviewAction[] = [
    {
      id: 'custom-action',
      label: 'Custom Action',
      icon: 'fa-solid fa-star',
      keyHint: 'C',
      onClick: () => reviewController.handleAction('custom-action'),
    },
    // ... more actions
  ];

  return actions;
}, [reviewController]);
```

### Custom Detail Renderers

Review Mode uses the existing `QueueDetail` component, which supports custom renderers via the detail renderer registry. See `components/shared/queue/detail-renderers/` for examples.

To add a custom renderer:

1. Create your renderer component
2. Register it in `detail-renderers/registry.tsx`
3. Set `item.detailView` to your renderer key

## Keyboard Shortcuts

### Standard Queue View
- `J`: Next item
- `K`: Previous item
- `E`: Resolve current item
- `S`: Snooze current item
- `H`: Hold current item
- `Enter`: Enter Review Mode

### Review Mode
- `J`: Next item
- `K`: Previous item
- `E`: Resolve
- `S`: Snooze
- `Z`: Undo last action
- `Esc`: Exit Review Mode

## Route Structure

Review Mode uses query parameters:
- `?mode=review&itemId=123` - Enter Review Mode for item 123
- Removing `mode` and `itemId` exits Review Mode

The route is deep linkable and refresh-safe.

## State Management

Review Mode preserves:
- List scroll position (via `listStateRef`)
- Selected item ID
- Active filters

On exit, these are restored automatically.

## Undo Functionality

The undo stack stores the last 10 actions. Each action saves:
- Item ID
- Action type
- Previous item state
- Timestamp

Undo restores the previous state and shows a toast notification.


