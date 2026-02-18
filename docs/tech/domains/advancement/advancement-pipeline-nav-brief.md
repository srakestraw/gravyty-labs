# Advancement Pipeline & Portfolio — Sidebar and Navigation

**Purpose**: Document the sidebar items, workspace switcher, and navigation structure for the Advancement Pipeline & Portfolio workspace.

**Audience**: Product, Design, Engineering, Stakeholders

**Scope**: Sidebar navigation items, workspace switcher (header), working mode selector, and route structure.

**Non-goals**: Page content, AI Assistant flows, Queue behavior (see [Queue Documentation](../../../shared-components/queue/README.md))

**Key Terms**:
- **Pipeline & Portfolio**: The Advancement workspace for prospect pipeline management, portfolio health, and AI-assisted outreach
- **Workspace Switcher**: Header dropdown to switch between Pipeline & Portfolio, Giving, and Payments & Processing
- **Working Mode**: Pipeline-only toggle (Team vs Leadership) that changes Command Center and Queue views

**Links**:
- [Product Context](../../../product/domains/advancement/README.md)
- [Advancement Tech README](README.md)
- [Queue Component](../../../shared-components/queue/README.md)
- [Command Center](../../../shared-services/command-center/README.md)

**Ownership**: Engineering Team  
**Last Updated**: 2025-02-17

---

## 1. Workspace Overview

The Advancement app has three workspaces, surfaced as pills in the App Switcher and as a workspace switcher in the header:

| Workspace ID | Label | Base Path | Purpose |
|--------------|-------|-----------|---------|
| `pipeline` | Pipeline & Portfolio | `/advancement/pipeline` | Prospect pipeline, portfolio health, AI Assistant, Queue, agents |
| `giving` | Giving | `/advancement/giving` | Campaigns, donors, narrative messaging |
| `payments` | Payments & Processing | `/advancement/payments` | Transactions, processing |

**Source**: `lib/advancement/workspaces.ts`, `lib/apps/registry.ts` (pills)

---

## 2. Pipeline & Portfolio Sidebar Items

When the user is in the Pipeline workspace (`/advancement/pipeline`), the sidebar shows items grouped into sections:

### Section: Overview

| Item | href | Icon | Purpose |
|------|------|------|---------|
| **Command Center** | `/advancement/pipeline` | `fa-solid fa-compass` | Team/Leadership dashboard with portfolio health, game plan, goal tracker |

### Section: Work

| Item | href | Icon | Purpose |
|------|------|------|---------|
| **AI Assistant** | `/advancement/pipeline/assistant` | `fa-solid fa-comments` | AI-powered prospect discovery, priority lists, briefs |
| **Task Queue** | `/advancement/pipeline/agent-ops/queue` | `fa-solid fa-list` | Triage and action on agent-generated items |
| **Agents & Workflow** | `/advancement/pipeline/agents` | `fa-solid fa-bolt` | Agent configuration and management |

### Section: Pipeline & Portfolio

| Item | href | Icon |
|------|------|------|
| **Opportunities** | `/advancement/pipeline/opportunities` | `fa-solid fa-handshake-angle` |
| **Portfolios** | `/advancement/pipeline/portfolios` | `fa-solid fa-briefcase` |
| **Plans (Moves)** | `/advancement/pipeline/plans` | `fa-solid fa-diagram-project` |

### Section: Campaigns

| Item | href | Icon |
|------|------|------|
| **Campaigns** | `/advancement/pipeline/campaigns` | `fa-solid fa-bullhorn` |
| **Events** | `/advancement/pipeline/events` | `fa-solid fa-calendar-days` |
| **Narrative Messaging** | `/advancement/pipeline/narrative-messaging` | `fa-solid fa-message-lines` |

### Section: Data and audiences

| Item | href | Icon |
|------|------|------|
| **Contacts** | `/contacts` | `fa-solid fa-users` |
| **Segments** | `/segments` | `fa-solid fa-filter` |

These are shared across Advancement workspaces and link to platform-wide Contacts and Segments.

### Section: Insights

| Item | href | Icon |
|------|------|------|
| **Reports** | `/advancement/pipeline/reports` | `fa-solid fa-chart-line` |
| **Forecast** | `/advancement/pipeline/forecast` | `fa-solid fa-chart-column` |
| **Alerts** | `/advancement/pipeline/alerts` | `fa-solid fa-bell` |

### Section: Admin Tools

| Item | href | Icon |
|------|------|------|
| **Settings** | `/advancement/pipeline/settings` | `fa-solid fa-gear` |
| **Data Quality** | `/advancement/pipeline/data-quality` | `fa-solid fa-broom` |

**Source**: `app/(shell)/advancement/_nav.ts` (workspace `pipeline`)

---

## 4. Workspace Switcher (Header)

The workspace switcher appears in the header when the user is in an Advancement workspace. It shows the current workspace label (e.g., "Pipeline & Portfolio") and allows switching to Giving or Payments & Processing.

- **Pipeline workspace**: Workspace switcher is in the header only; it is **not** duplicated in the sidebar.
- **Giving / Payments workspaces**: The sidebar includes both workspace-specific items and the workspace switcher items (Pipeline, Giving, Payments & Processing) so users can switch without relying on the header.

**Source**: `app/(shell)/components/workspace-switcher.tsx`, `lib/advancement/workspaces.ts`

---

## 5. Working Mode Selector (Pipeline Only)

At the bottom of the Pipeline sidebar, a **Working mode** selector appears:

| Mode | Purpose |
|------|---------|
| **Team** | Operator view: personal queue, game plan, portfolio health for assigned prospects |
| **Leadership** | Leadership view: team-wide metrics, status summary, portfolio health across team |

The mode is persisted in URL params (`?mode=team` or `?mode=leadership`) and localStorage. Default is `team`.

**Source**: `app/(shell)/components/app-sidebar.tsx` (lines 809–851), `lib/hooks/useWorkspaceMode.ts`

---

## 6. Navigation Contract and File Inventory

| Location | File | Purpose |
|----------|------|---------|
| `app/(shell)/advancement/` | `_nav.ts` | `getAppNav` — for pipeline workspace returns sectioned nav (overview, work, pipelinePortfolio, campaigns, dataAndAudiences, insights, adminTools); for giving/payments returns topLevel + aiPlatform + dataAndAudiences |
| `app/(shell)/components/` | `app-sidebar.tsx` | Renders sidebar; uses `getAdvancementNav` when `activeRegistryAppId === 'advancement-philanthropy'` |
| `app/(shell)/components/` | `workspace-switcher.tsx` | Header dropdown for workspace switching |
| `lib/advancement/` | `workspaces.ts` | `ADVANCEMENT_WORKSPACES`, `isValidAdvancementWorkspace`, `getAdvancementWorkspaceConfig` |
| `lib/apps/` | `registry.ts` | App definition with pills: Pipeline & Portfolio, Giving, Payments & Processing |

---

## 7. Giving and Payments Sidebar Items

For reference, the other workspaces show:

**Giving** (`/advancement/giving`):
- Overview, Narrative Messaging, Campaigns, Donors
- Plus workspace switcher items (Pipeline, Giving, Payments & Processing)

**Payments** (`/advancement/payments`):
- Overview, Transactions, Processing
- Plus workspace switcher items

---

## 8. Related Documentation

- [Queue Documentation](../../shared-components/queue/README.md) — Queue behavior, filters, Game Plan
- [Command Center](../../../shared-services/command-center/README.md) — Working modes, Team vs Leadership
- [Advancement Product README](../../../product/domains/advancement/README.md) — Queue integration, requirements
