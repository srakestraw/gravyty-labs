# Queue - Design Documentation

**Purpose**: UX flows, states, interaction rules, accessibility, and content guidelines for the Queue component.

**Audience**: Designers, Engineers

**Scope**: User flows, UI states, keyboard interactions, accessibility, content/voice

**Non-goals**: Product requirements (see [product.md](product.md)), technical implementation (see [tech.md](tech.md))

**Ownership**: Design Team

**Last Updated**: 2025-12-22

---

## User Flows

### Primary Flow: Triage Item

1. User opens Queue page
2. Queue loads items (shows loading state)
3. User views item list, selects item
4. Item detail panel shows on right
5. User reviews item details
6. User takes action (resolve, snooze, hold, etc.)
7. Item updates optimistically, auto-advances to next item
8. Repeat

### Flow: Enter Focus Mode

1. User clicks "Focus mode" button or adds `focus=1` to URL
2. Sidebar, header, and working mode selector hide
3. Queue content expands to full viewport
4. User works in distraction-free environment
5. User exits via "Exit Focus Mode" button or removes `focus` param

### Flow: Enter Review Mode

1. User selects item and presses Enter or clicks "Start review" button
2. URL updates with `mode=review&itemId=<id>`
3. Review Mode opens (full-screen, item-focused via ReviewModeShell)
4. User navigates with J/K or ↑/↓ (arrow keys handled by ReviewModeShell)
5. User takes actions (E: resolve, S: snooze, H: hold, or via ReviewActionBar)
6. System auto-advances to next item after completing action
7. User can undo with Z (undoes last action, restores previous state)
8. User exits with Esc or "Back to Queue" button (removes mode/itemId from URL)
9. List state (selection, filters) restored on exit
  
  Source: `components/shared/queue/QueuePageClient.tsx` - `handleEnterReviewMode` (lines 623-646), `handleExitReviewMode` (lines 648-662), `renderReviewMode` (lines 832-913)

### Flow: Apply Game Plan Objective

1. User views Game Plan panel (Admissions/Advancement only)
2. User clicks "Apply" button on objective card
3. URL updates with `objective=<id>` (preserves other params)
4. Queue filters to items matching objective (tag/title/summary matching)
5. Game Plan Items Lane appears above queue list with top 10 items for objective
6. Completion status shown on objective cards (from operator game plan)
7. User processes objective-focused items
8. User clicks "Clear" button to remove objective filter (removes from URL)
  
  Source: `components/shared/queue/QueuePageClient.tsx` - `handleApplyObjective` (lines 342-346), `handleClearObjective` (lines 348-353), objective filtering (lines 421-471), Game Plan Items Lane (lines 932-943)

### Flow: Filter by Segment

1. User navigates to Queue with segment context (URL param or props)
2. Segment banner appears at top
3. Queue items filtered to segment scope
4. User can clear segment filter via "Clear segment" button

## UI States

### Loading States
- **Initial load**: Skeleton or spinner while items load
- **Game Plan loading**: Panel shows loading state
- **Item detail loading**: Detail panel shows loading state

### Empty States
- **No items**: "No items in queue" message
- **No filtered items**: "No items match filters" message with clear filters option
- **No objective items**: "No items for this objective" message

### Error States
- **Load error**: Error message with retry option
- **Action error**: Toast notification with error message

### Item States
- **Open**: Default state, shows resolve/snooze actions
- **Snoozed**: Shows unsnooze/extend actions
- **InProgress (Hold)**: Shows resolve action
- **Resolved**: Shows reopen action

### Review Mode States
- **Active**: Full-screen review with current item (ReviewModeShell wrapper)
- **Empty split**: "All caught up!" message with back button (when no items in current split)
- **Progress indicator**: "X of Y" counter in top bar (from reviewController.progress)
- **Split tabs**: Visible when splits available (Advancement: due-today, meeting-prep, first-drafts, etc.)
  
  Source: `components/shared/queue/QueuePageClient.tsx` - `renderReviewMode` (lines 832-913), empty state (lines 836-848)

### Focus Mode States
- **Standard**: Normal layout with sidebar/header
- **Focus**: Full-screen, no sidebar/header (via FocusModePage wrapper)
- **Workbench** (feature flag `queueFocusWorkbenchV2`): Workbench toolbar, split selector, filters drawer, active filter chips, shortcuts overlay
  
  Source: `components/shared/queue/QueuePageClient.tsx` - Focus Mode rendering (lines 1171-1186), workbench mode (lines 1020-1057)

## Interaction Rules

### Keyboard Shortcuts

#### Standard Mode
- **J**: Next item (down in list)
- **K**: Previous item (up in list)
- **Enter**: Enter Review Mode (if item selected and feature enabled)
- **E**: Resolve current item
- **S**: Snooze current item
- **H**: Hold current item
- **?**: Show shortcuts overlay

#### Review Mode
- **J** or **↑**: Previous item (wraps to end)
- **K** or **↓**: Next item (wraps to start)
- **E**: Resolve current item (auto-advances)
- **S**: Snooze current item (auto-advances)
- **H**: Hold current item (auto-advances)
- **Z**: Undo last action (restores previous state, max 10 undo actions)
- **Esc**: Exit Review Mode (removes mode/itemId from URL, restores list state)
- **?**: Show shortcuts overlay
  
  Source: `components/shared/queue/QueuePageClient.tsx` - keyboard shortcuts (lines 698-747), Review Mode navigation (lines 884-890), undo handler (lines 665-678)

### Mouse Interactions
- Click item in list to select
- Click action buttons to take action
- Hover over item to show inline actions
- Click "Focus mode" button to toggle
- Click "Start review" button to enter Review Mode
- Click filter chips to remove filters

### Touch Interactions
- Tap item to select
- Tap action buttons to take action
- Tap "Start review" button to enter Review Mode
- Tap filter chips to remove filters
- Swipe gestures: Not currently supported (future enhancement)
  
  Source: `components/ai-assistants/agent-ops/queue/QueueList.tsx` - item click handler (line 153), `components/shared/queue/ActiveFilterChips.tsx` - filter removal

## Accessibility

### Keyboard Navigation
- All interactive elements keyboard accessible
- Focus indicators visible on all focusable elements
- Tab order follows visual flow
- Escape key closes modals/overlays

### Screen Reader Support
- Item list announced as list with count
- Selected item announced
- Actions announced with labels
- Status changes announced
- Progress indicators announced (Review Mode)

### ARIA Labels
- Item list: `role="list"`, `aria-label="Queue items"`
- Selected item: `aria-selected="true"`
- Action buttons: `aria-label` with action name
- Progress indicator: `aria-label="Item X of Y"`

### Color Contrast
- All text meets WCAG AA contrast requirements
- Status indicators use color + text/icon
- Focus indicators clearly visible

## Content and Voice

### Labels

- **Queue**: "Agent Ops — Queue" (default), "Admissions Queue" (admissions), "Advancement Pipeline Queue" (advancement)
- **Focus Mode**: "Focus mode" (button), "Enter Focus Mode" (tooltip), "Exit Focus Mode" (when active)
- **Review Mode**: "Start review" (button with Enter key hint), "Review" (mode label in top bar), "Back to Queue" (exit button)
- **Actions**: "Resolve", "Snooze", "Hold", "Unsnooze", "Reopen", "Skip", "Send", "Call", "SMS"
- **Game Plan**: "Today's Game Plan" (panel header), "X / Y completed" (completion count), "Apply" / "Clear" (objective buttons)
  
  Source: `components/shared/queue/QueuePageClient.tsx` - page title (lines 1094-1100), Focus Mode button (lines 1109-1123), Review Mode entry (lines 963-987)

### Messaging

- **Empty state**: "Select an item to view details" (detail panel when no item selected)
- **No items**: "No items require attention right now." with "Great job — everything is running smoothly."
- **No filtered items**: Filtered list shows empty state
- **All caught up**: "All caught up!" with "No items in this split." (Review Mode empty split)
- **Segment banner**: "Queue scoped to segment: [Segment Name]" with "Clear segment" button
- **Review Mode entry**: "Press Enter to start review" (one-time coachmark shown)
  
  Source: `components/ai-assistants/agent-ops/queue/QueueList.tsx` - empty state (lines 130-142), `components/shared/queue/QueuePageClient.tsx` - segment banner (lines 1069-1088), Review Mode empty state (lines 836-848)

### Tone

- **Professional and efficient**: Clear, action-oriented language
- **Supportive**: Encouraging messages (e.g., "All caught up!")
- **Concise**: Short labels, minimal helper text

## Responsive Design

### Desktop (≥768px)
- Two-column layout: list (left, min 280px max 380px) + detail (right, flexible)
- Inline actions on hover (hidden on non-selected, shown on selected)
- Full keyboard shortcuts
- Workbench mode available (feature flag)
- Game Plan Items Lane visible when objective active
- Review Mode entry button visible in detail panel header
  
  Source: `components/shared/queue/QueuePageClient.tsx` - grid layout (lines 921-924), QueueList inline actions (lines 222-276)

### Mobile (<768px)
- Grid layout adapts (CSS grid handles responsive stacking)
- Touch-optimized action buttons
- Full keyboard shortcuts (same as desktop)
- Focus Mode adapts to mobile viewport
- Workbench mode toolbar adapts to mobile
  
  Source: `components/shared/queue/QueuePageClient.tsx` - responsive grid (line 923), CSS handles mobile stacking

## Update Triggers

This document must be updated when:
- UX flows change
- UI states change (new states, removed states)
- Interaction rules change (keyboard shortcuts, mouse, touch)
- Accessibility requirements change
- Content/voice guidelines change
- Responsive breakpoints change

