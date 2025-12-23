# Queue - Product Requirements

**Purpose**: Product requirements and success metrics for the Queue shared component.

**Audience**: Product Managers, Designers, Engineers

**Scope**: User outcomes, success metrics, feature requirements, user stories

**Non-goals**: Technical implementation details (see [tech.md](tech.md)), design specifications (see [design.md](design.md))

**Ownership**: Product Team

**Last Updated**: 2025-12-22

---

## User Outcomes

### Primary Outcome
**Enable efficient triage of agent operations items across workspaces**

Users should be able to:
- Quickly identify items requiring attention
- Process items efficiently with minimal context switching
- Track progress toward team objectives (Game Plan)
- Focus on work without distractions (Focus Mode)
- Process items rapidly with keyboard navigation (Review Mode)

### Success Metrics

- **Time to triage**: Average time from item selection to action
- **Items processed per session**: Number of items resolved/snoozed per user session
- **Objective completion rate**: Percentage of Game Plan objectives completed
- **Focus Mode usage**: Percentage of sessions using Focus Mode
- **Review Mode usage**: Percentage of sessions using Review Mode
- **Keyboard shortcut usage**: Percentage of actions taken via keyboard shortcuts

## User Stories

### As an Admissions Operator
- I want to see all items requiring attention in one place
- I want to filter items by Game Plan objectives to focus on priorities
- I want to quickly resolve, snooze, or hold items
- I want to enter Focus Mode to work without distractions
- I want to use Review Mode to process items rapidly with keyboard shortcuts

### As an Advancement Operator
- I want to see pipeline items requiring attention
- I want to filter by pipeline objectives (re-engage stalled, prep briefs, advance proposals, stewardship followups)
- I want to quickly take actions on items
- I want to use Focus Mode and Review Mode for efficient processing

### As a Student Lifecycle Operator
- I want to see all agent-ops items for my workspace
- I want to filter and search items
- I want to take actions on items efficiently

## Feature Requirements

### Core Features

1. **Item List**
   - Display all queue items with key metadata (title, summary, person, agent, status, severity, assigned to)
   - Support filtering by role, status, type, severity, assignee, search
   - Support sorting (default: by priority/severity)
   - Show selected item in detail panel

2. **Item Actions**
   - Resolve, snooze, hold, unsnooze, reopen
   - Send email, send gratavid, call, SMS
   - Skip, assign, extend snooze
   - Auto-advance to next item after action (configurable)

3. **Keyboard Shortcuts**
   - J/K or ↑/↓: Navigate items
   - Enter: Enter Review Mode
   - E: Resolve
   - S: Snooze
   - H: Hold
   - Z: Undo (Review Mode)
   - Esc: Exit Review Mode
   - ?: Show shortcuts help

4. **Focus Mode**
   - Full-screen experience (hide sidebar, header, working mode selector)
   - Toggle via button or URL parameter (`focus=1`)
   - Available for Admissions and Advancement workspaces

5. **Review Mode**
   - Full-screen item review with keyboard navigation
   - Auto-advance after actions
   - Undo support
   - Split-based navigation (for Advancement)
   - Enter via Enter key or "Start review" button

### Game Plan Integration (Admissions & Advancement)

1. **Game Plan Panel**
   - Display objectives with completion counts
   - Show completion status (completed/in-progress/open)
   - Allow applying/clearing objectives via URL parameter (`objective=<id>`)

2. **Objective Filtering**
   - Filter queue items to match active objective
   - Show Game Plan Items Lane with top items for objective
   - Display objective-specific counts

3. **Admissions Objectives**
   - `stalled-applicants`: Items matching stalled/incomplete patterns
   - `missing-documents`: Items matching missing document patterns
   - `melt-risk`: Items matching melt risk patterns

4. **Advancement Objectives**
   - `re-engage-stalled`: Stalled/inactive items
   - `prep-briefs`: Meeting/brief preparation items
   - `advance-proposals`: Proposal review items
   - `stewardship-followups`: Stewardship/follow-up items

### Segment Integration

- Support segment scoping via URL parameter (`segment=<id>`) or props
- Display segment banner when active
- Filter queue items to segment scope
- Allow clearing segment filter

### Workbench Mode (Feature Flag: `queueFocusWorkbenchV2`)

- Superhuman-style Focus Mode with split-based filtering
- Workbench toolbar with split selector, search, filters
- Active filter chips
- Filters drawer
- Shortcuts overlay

## Non-Goals

- Bulk actions (future enhancement)
- Custom filter presets (future enhancement)
- Export functionality (future enhancement)
- Real-time updates via WebSocket (future enhancement)
- SLA tracking and alerts (future enhancement)

## Dependencies

- [Data Provider](../shared-services/data-provider/README.md) - Data access
- [Segments](../shared-services/segments/README.md) - Audience segmentation
- [Agent Ops](../shared-services/agent-ops/README.md) - Agent operations service
- [Command Center](../shared-services/command-center/README.md) - Working modes

## Update Triggers

This document must be updated when:
- New features are added to Queue
- Success metrics change
- User stories change
- Feature requirements change
- Dependencies change

