# Technical Brief: Queue — Shared Component

**Scope**: Queue shared component used across Admissions, Advancement, and Student Lifecycle for agent-ops triage. Covers route files, shared clients, data flow, URL parameters, and integration contracts.

**Last updated**: 2025-02-08

---

## 1. Overview

The **Queue** is a shared triage interface for managing agent operations items. It provides a single list/detail experience with filtering, keyboard shortcuts, optional Game Plan (Admissions/Advancement), Focus Mode, and Review Mode.

| Workspace         | Route pattern                                      | Game Plan | Focus Mode |
|------------------|-----------------------------------------------------|-----------|------------|
| Admissions       | `/admissions/agent-ops/queue`                       | Yes       | Yes        |
| Advancement      | `/advancement/pipeline/agent-ops/queue`             | Yes       | Yes        |
| Student Lifecycle| `/student-lifecycle/{workspace}/agent-ops/queue`    | No        | No         |

Navigation to the queue is provided by domain nav; each domain mounts the same shared component with its own `AiPlatformPageContext`.

---

## 2. File Inventory

### 2.1 Route files (domain pages)

| File | Role |
|------|------|
| `app/(shell)/admissions/agent-ops/queue/page.tsx` | Admissions queue: renders `AgentOpsQueuePageClient` with `workspaceId: 'admissions'`, `appId: 'admissions'` |
| `app/(shell)/advancement/pipeline/agent-ops/queue/page.tsx` | Advancement pipeline queue: `AgentOpsQueuePageClient` with `workspaceId: 'advancement'`, `appId: 'advancement'` |
| `app/(shell)/student-lifecycle/[workspace]/agent-ops/queue/page.tsx` | Student Lifecycle queue: uses `QueuePageClientWrapper` (adds segment from URL), then `AgentOpsQueuePageClient` with `workspaceId` from params, `appId: 'student-lifecycle'` |
| `app/(shell)/student-lifecycle/[workspace]/agent-ops/queue/QueuePageClientWrapper.tsx` | Client wrapper: reads `segment` from search params, resolves `activeSegment`, passes enhanced context to `AgentOpsQueuePageClient` |

Student Lifecycle queue uses `generateStaticParams()` over `WORKSPACES` and `getWorkspaceDefaults(params.workspace)` for `defaults.queueView` and related defaults.

### 2.2 Shared components (core)

| File | Role |
|------|------|
| `components/shared/ai-platform/AgentOpsQueuePageClient.tsx` | Thin wrapper: computes `basePath` via `getAiPlatformBasePath(context)`, passes `defaultFilters` from `context.defaults?.queueView`, forwards `activeSegmentId`, `activeSegment`, `workspaceId` to `QueuePageClient` |
| `components/shared/queue/QueuePageClient.tsx` | **Core**: list/detail layout, loads items via `dataClient.listQueueItems(ctx)`, Game Plan APIs when Admissions/Advancement, filters, selection, Review Mode, Workbench (feature-flagged), shortcuts |
| `components/ai-assistants/agent-ops/queue/QueueList.tsx` | Renders item list; selection, inline actions, “Focus mode” entry |
| `components/ai-assistants/agent-ops/queue/QueueDetail.tsx` | Detail panel; supports custom detail renderers via `detail-renderers/registry.ts` (e.g. `detailView: 'first-draft'` → advancement first-draft renderer) |
| `components/ai-assistants/agent-ops/queue/ShortcutFooter.tsx` | Keyboard shortcuts help in footer |

### 2.3 Shared components (Game Plan, Focus, Review, Workbench)

| File | Role |
|------|------|
| `components/shared/ai-platform/GamePlanPanel.tsx` | Game Plan sidebar (Admissions/Advancement) |
| `components/shared/ai-platform/GamePlanItemsLane.tsx` | Objective-scoped items lane |
| `components/shared/ai-platform/FocusModePage.tsx` | Full-viewport Focus Mode (Admissions/Advancement) |
| `components/shared/queue/ReviewModeShell.tsx` | Full-screen Review Mode shell; arrow keys, top/bottom bars |
| `components/shared/queue/useQueueReviewController.ts` | Review state: splits, next/prev, auto-advance, undo (last 10), progress |
| `components/shared/queue/ReviewActionBar.tsx` | Action bar in Review Mode |
| `components/shared/queue/ReviewModeCoachmark.tsx` | Review Mode onboarding |
| `components/shared/queue/SplitTabs.tsx` | Split tabs (e.g. Advancement: due-today, meeting-prep, first-drafts, etc.) |
| `components/shared/queue/splits/advancementSplits.ts` | Advancement split definitions |
| `components/shared/queue/WorkbenchToolbar.tsx` | Workbench: split selector, search, filters (feature flag) |
| `components/shared/queue/FiltersDrawer.tsx` | Filters drawer in workbench |
| `components/shared/queue/ActiveFilterChips.tsx` | Active filter chips |
| `components/shared/queue/ShortcutsOverlay.tsx` | “?” shortcuts overlay |

### 2.4 Detail renderers

| File | Role |
|------|------|
| `components/shared/queue/detail-renderers/registry.ts` | Maps `detailView` (e.g. `'first-draft'`) to renderer component |
| `components/shared/queue/detail-renderers/DefaultQueueDetail.tsx` | Default queue item detail |
| `components/shared/queue/detail-renderers/AdvancementFirstDraftDetail.tsx` | Advancement first-draft detail view |

### 2.5 Types and data

| File | Role |
|------|------|
| `lib/agent-ops/types.ts` | `AgentOpsItem`, `AgentOpsFilters`, `AgentOpsStatus`, `AgentOpsSeverity`, `AgentOpsItemType`, `AgentRole`, `AgentOpsPersonRef` |
| `components/shared/ai-platform/types.ts` | `AiPlatformPageContext`, `getAiPlatformBasePath(context)` |

---

## 3. Data Flow and Behavior

### 3.1 Initial load

- `QueuePageClient` calls `dataClient.listQueueItems(ctx)` on mount.
- `ctx`: `{ workspace, app, mode: 'team' }` (and optionally `userId`); `workspace`/`app` come from domain context.
- Items stored in `allItems`; `filteredItems` derived via `useMemo` (split, objective, then role/status/type/severity/assignee/search).

### 3.2 Game Plan (Admissions / Advancement only)

- When `workspaceId === 'admissions'`: `getAdmissionsTeamGamePlan`, `getAdmissionsQueueGamePlanCounts`, `getAdmissionsOperatorGamePlan`, and when an objective is active `getAdmissionsQueueItemsByObjective(ctx, objectiveId, limit)`.
- When `workspaceId === 'advancement'`: `getPipelineTeamGamePlanForQueue`, `getPipelineQueueGamePlanCounts`, `getPipelineTeamGamePlan`, and when objective active `getPipelineQueueItemsByObjective(ctx, objectiveId, limit)`.
- Objective matching for filtering is in-client (e.g. tags/title/summary); see tech.md “Objective Matching Logic”.

### 3.3 Actions

- `handleItemAction` in `QueuePageClient`: optimistic update to `allItems`; status/tag changes per action type (resolve, snooze, hold, send-email, send-gratavid, skip, etc.).
- Auto-advance to next item after resolve/snooze/hold/send-email/send-gratavid/skip.
- Persistence: TODO (currently optimistic only).

### 3.4 URL parameters

- **`focus=1`**: Focus Mode (Admissions/Advancement).
- **`objective`**: Objective ID (Admissions/Advancement); filters queue and shows Game Plan Items Lane.
- **`segment`**: Segment ID; scopes queue; Student Lifecycle resolves via `QueuePageClientWrapper`.
- **`mode=review`**: Review Mode (requires feature flag `queueReviewMode`).
- **`itemId`**: Current item in Review Mode (with `mode=review`).

Read via `useClientSearchParams()`; updates via `router.replace()`.

---

## 4. Context and Integration

- **AiPlatformPageContext**: `appId`, `workspaceId`, `mode`, `peopleLabel`, optional `defaults` (e.g. `queueView`, `recommendedAgents`), optional `activeSegmentId` / `activeSegment`.
- **getAiPlatformBasePath(context)**: e.g. `/student-lifecycle/admissions`, `/admissions`, `/advancement/pipeline` so queue and links (people, agents) stay under the same app/workspace.
- **QueuePageClient props**: `basePath`, `defaultFilters`, `activeSegmentId`, `activeSegment`, `workspaceId`. Domain pages only need to pass a correct `context` into `AgentOpsQueuePageClient`.

---

## 5. Dependencies

- **Data provider**: `@/lib/data` — `listQueueItems`; Admissions/Advancement Game Plan and objective methods (see [contracts-and-urls.md](contracts-and-urls.md)).
- **Feature flags**: `queueReviewMode` (Review Mode), `queueFocusWorkbenchV2` (Workbench).
- **Hooks**: `useClientSearchParams`, `useHotkeys` (J/K, Enter, E/S/H, Z, Esc, ?), `useQueueReviewController`.
- **Student Lifecycle**: `lib/student-lifecycle/workspaces.ts` (`getWorkspaceDefaults`, `WORKSPACES`), segment resolution from URL in `QueuePageClientWrapper`.

---

## 6. Summary Table (Files)

| Location | File | Purpose |
|----------|------|---------|
| `app/(shell)/admissions/agent-ops/queue/` | `page.tsx` | Admissions queue page (AgentOpsQueuePageClient) |
| `app/(shell)/advancement/pipeline/agent-ops/queue/` | `page.tsx` | Advancement pipeline queue page |
| `app/(shell)/student-lifecycle/[workspace]/agent-ops/queue/` | `page.tsx` | Student Lifecycle queue page (static params) |
| `app/(shell)/student-lifecycle/[workspace]/agent-ops/queue/` | `QueuePageClientWrapper.tsx` | Segment from URL → enhanced context |
| `components/shared/ai-platform/` | `AgentOpsQueuePageClient.tsx` | Context → basePath, defaults → QueuePageClient |
| `components/shared/ai-platform/` | `types.ts` | AiPlatformPageContext, getAiPlatformBasePath |
| `components/shared/queue/` | `QueuePageClient.tsx` | Core queue logic, state, URLs, shortcuts |
| `components/shared/queue/` | `ReviewModeShell.tsx`, `useQueueReviewController.ts`, `ReviewActionBar.tsx`, `ReviewModeCoachmark.tsx` | Review Mode |
| `components/shared/queue/` | `SplitTabs.tsx`, `splits/advancementSplits.ts` | Splits (Advancement) |
| `components/shared/queue/` | `WorkbenchToolbar.tsx`, `FiltersDrawer.tsx`, `ActiveFilterChips.tsx`, `ShortcutsOverlay.tsx` | Workbench / UX |
| `components/shared/ai-platform/` | `GamePlanPanel.tsx`, `GamePlanItemsLane.tsx`, `FocusModePage.tsx` | Game Plan & Focus Mode |
| `components/ai-assistants/agent-ops/queue/` | `QueueList.tsx`, `QueueDetail.tsx`, `ShortcutFooter.tsx` | List, detail, footer |
| `components/shared/queue/detail-renderers/` | `registry.ts`, `DefaultQueueDetail.tsx`, `AdvancementFirstDraftDetail.tsx` | Detail renderers |
| `lib/agent-ops/` | `types.ts` | AgentOpsItem, AgentOpsFilters, enums |

---

## 7. Agent-generated queue items

Agent work (drafts, approvals, blocked actions, flow exceptions) is surfaced as first-class queue item types:

- **AGENT_DRAFT_MESSAGE** — Draft Message → detail: `AgentDraftMessageDetail` (approve/reject)
- **AGENT_APPROVAL_REQUIRED** — ApprovalRequest → detail: `AgentApprovalRequiredDetail` (approve/reject)
- **AGENT_BLOCKED_ACTION** — Blocked narrative/guardrail → detail: `AgentBlockedActionDetail`
- **AGENT_FLOW_EXCEPTION** — Flow execution failure → detail: `AgentFlowExceptionDetail`

Queue actions: **Approve** / **Reject** call `POST /api/approval-requests/[id]/approve` and `.../reject`. Resolve, Skip, Snooze use existing queue behavior. Auto-advance and keyboard shortcuts apply.

**Persistence:** Queue actions (resolve, snooze, hold, assign, unsnooze, reopen) persist via `POST /api/agent-ops/items/[id]/*`. Action state is merged into `listQueueItems` via `GET /api/agent-ops/action-state`. Optimistic update with revert + toast on API error.

**SLA:** `dueAt`, `slaStatus` (ON_TRACK | AT_RISK | BREACHED); default SLA by type (approvals 4h, drafts 24h, blocked 8h, exceptions 2h). BREACHED escalates severity; chips in list and detail.

**Refresh:** Polling every 30s when page visible (paused in Review/Focus mode). Manual Refresh in Workbench toolbar.

**Bulk actions:** Feature flag `queueBulkActions`; bulk select in Workbench with Resolve/Snooze bar.

**TODO (future):** Real-time updates for agent queue items (e.g. websockets or SSE) so new drafts/approvals appear without refresh.

---

## Related Documentation

- [Queue README](README.md) — Central index and quick links
- [Queue Technical Documentation](tech.md) — Architecture, state, contracts, shortcuts, objectives
- [Queue Contracts and URLs](contracts-and-urls.md) — URL params, data provider methods, integration contracts
- [Data Provider](../../shared-services/data-provider/README.md) — Unified data access
