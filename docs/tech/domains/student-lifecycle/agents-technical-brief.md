# Technical Brief: Student Lifecycle — Agents (e.g. Admissions)

**Scope**: Agents area under Student Lifecycle, including the Admissions workspace path `/student-lifecycle/admissions/agents` and sibling workspaces. This brief covers all route files, shared clients, and the View / Edit / Create flows.

**Last updated**: 2025-02-08

---

## 0. Agent Types (2025-02 Refactor)

Agents support two types:

| Type | Description |
|------|--------------|
| **AUTONOMOUS** | AI-powered agent that reasons and acts on your behalf. Uses Narrative Messaging for voice/tone. |
| **FLOW** | No-Code Flow Builder: rule-based workflow with triggers, conditions, and actions. |

- **Shared type**: `AgentType = 'AUTONOMOUS' | 'FLOW'` in `lib/agents/types.ts`
- **Narrative Messaging**: Required for Autonomous agents; configurable profile, tone, topic allow/block, escalation, personalization boundaries
- **Flow Builder**: MVP shell with nodes palette (trigger, condition, action) and canvas placeholder

---

## 1. Overview

The **Agents** section lets users list, view, edit, and create AI agents scoped to a Student Lifecycle workspace (e.g. Admissions, Registrar, Financial Aid). Routes are workspace-parameterized under the dynamic segment `[workspace]`.

| Route | Purpose |
|-------|--------|
| `/student-lifecycle/{workspace}/agents` | **List** — All agents for the workspace |
| `/student-lifecycle/{workspace}/agents/new` | **Create** — New agent (template or blank) |
| `/student-lifecycle/{workspace}/agents/[id]` | **View / Edit** — Single agent by ID |

Navigation to Agents is provided by the AI Platform nav builder: `Agents` → `${basePath}/agents` with icon `fa-solid fa-bolt` (see `lib/nav/ai-platform-nav.ts`).

---

## 2. File Inventory

### 2.1 Route files (Student Lifecycle app)

All under `app/(shell)/student-lifecycle/[workspace]/agents/`:

| File | Role |
|------|------|
| `page.tsx` | List page: renders `AgentsListPageClient` with workspace context |
| `new/page.tsx` | New-agent page: renders `AgentNewPageClient` with workspace context |
| `[id]/page.tsx` | Detail/edit page: renders `AgentDetailPageClient` with `agentId` and context |

Each page:

- Uses `getWorkspaceConfig(params.workspace)` from `@/lib/student-lifecycle/workspaces` for `peopleLabel` and other workspace defaults.
- Passes an `AiPlatformPageContext` with `appId: 'student-lifecycle'`, `mode: 'workspace'`, `workspaceId`, and `peopleLabel`.
- Sets `export const dynamic = 'force-static'` and implements `generateStaticParams()` for static export (workspace list; for `[id]`, workspace × a fixed list of agent IDs).

### 2.2 Shared AI Platform components

Used by the route pages; live under `components/shared/ai-platform/` and `components/shared/agents/`:

| File | Role |
|------|------|
| `components/shared/ai-platform/AgentsListPageClient.tsx` | Thin wrapper: passes `context` into `AgentsPageClient` |
| `components/shared/ai-platform/AgentDetailPageClient.tsx` | Resolves display name/purpose/status for the agent, then renders `AgentForm` in `edit` mode with `basePath` from context |
| `components/shared/ai-platform/AgentNewPageClient.tsx` | Template/blank picker (role + template), then `AgentForm` in `create` mode with `basePath` from context |
| `components/shared/ai-platform/types.ts` | `AiPlatformPageContext`, `getAiPlatformBasePath(context)` |
| `components/shared/agents/AgentsPageClient.tsx` | **List UI**: search, role/status filters, recommended templates, agents table with “View →” links to `{basePath}/agents/{id}`; “+ Create Agent” to `{basePath}/agents/new` |

### 2.3 Agent form and DNE (shared with AI Assistants)

Used by Detail and New; live under `app/(shell)/ai-assistants/agents/`:

| File | Role |
|------|------|
| `app/(shell)/ai-assistants/agents/_components/agent-form.tsx` | Single form for **Create** and **Edit**: Steps 1–6 (Summary, Goal, Priority, Action Tools, Scope & Population, Guardrails), Engagement Rules (DNE), Eval Preview; Cancel / Save / Run Now |
| `app/(shell)/ai-assistants/agents/_components/agent-dne-section.tsx` | Do-not-engage per agent: loads via `/api/dne/agent?agentId=`, remove via DELETE; used inside `AgentForm` in edit mode |

### 2.4 Templates and supporting code

| File | Role |
|------|------|
| `app/(shell)/ai-assistants/templates/agent-templates.ts` | `AGENT_TEMPLATES`, `AgentRole`, `AgentTemplate` — used by `AgentNewPageClient` for role/template list and initial config |
| `app/(shell)/ai-assistants/templates/TemplateCard.tsx` | Card UI for template selection on the New page |
| `lib/student-lifecycle/workspaces.ts` | `WORKSPACES`, `getWorkspaceConfig`, `WorkspaceId`, `WorkspaceConfig` (e.g. `peopleLabel`, `recommendedAgents`) |
| `lib/nav/ai-platform-nav.ts` | `buildAiPlatformNav()` — adds “Agents” item with `href: ${basePath}/agents` |
| `lib/agents/types.ts` | `AgentPriorityWeight` (1–5) used in `AgentForm` |

---

## 3. View / Edit / Create Behavior

### 3.1 List (View)

- **URL**: `/student-lifecycle/{workspace}/agents` (e.g. `/student-lifecycle/admissions/agents`).
- **Component chain**: Route `page.tsx` → `AgentsListPageClient` → `AgentsPageClient`.
- **Behavior**:
  - Search by name/purpose; filter by Role (e.g. Admissions, Registrar) and Status (active / paused / error).
  - “Recommended agent templates” section (role-filtered); link to “View all agent templates” (`{basePath}/templates`).
  - Table: Agent Name, Role, Purpose, Status, Last Run, Actions.
  - Actions: “View →” to `{basePath}/agents/{id}`; “+ Create Agent” to `{basePath}/agents/new`.
- **Data**: Agents and templates are currently in-client constants in `AgentsPageClient` (e.g. `agent-transcript-helper`, `agent-registration-requirements`). No `dataClient`/API calls for list yet.

### 3.2 Edit (View + Edit)

- **URL**: `/student-lifecycle/{workspace}/agents/[id]` (e.g. `/student-lifecycle/admissions/agents/agent-transcript-helper`).
- **Component chain**: Route `[id]/page.tsx` → `AgentDetailPageClient` → `AgentForm` (mode `edit`).
- **Behavior**:
  - `AgentDetailPageClient` maps `agentId` to name/purpose/status/lastRun/nextRun (hardcoded for `agent-transcript-helper`; fallback “Agent {id}” for others).
  - `AgentForm` in `edit` shows: back link to `{basePath}/agents`, title “EDIT AGENT — {name}”, Step 1–6, Engagement Rules (Do-Not-Engage), Eval Preview.
  - In edit mode, name/purpose are read-only (display only); role is editable; status/last/next run are displayed.
  - Actions: Cancel (back to list), Run Now, Save Changes. Submit handler is TODO (console.log only).
- **Static params**: `generateStaticParams()` builds workspace × agent IDs (`agent-transcript-helper`, `agent-registration-requirements`, `agent-high-intent-prospect`, `agent-donor-warmup`, `agent-international-visa`).

### 3.3 Create

- **URL**: `/student-lifecycle/{workspace}/agents/new` (e.g. `/student-lifecycle/admissions/agents/new`).
- **Component chain**: Route `new/page.tsx` → `AgentNewPageClient` → (after template choice) `AgentForm` (mode `create`).
- **Behavior**:
  - Step 0: Choose role (Admissions, Registrar, etc.) and template (blank or template key). Templates from `AGENT_TEMPLATES` filtered by role.
  - After selection, `AgentForm` in `create` with `initialData` from template (name, purpose, role, goal). Name and purpose are editable inputs.
  - Same Steps 1–6 as edit; no Engagement Rules section in create. Cancel / Create Agent; submit is TODO.
- **Base path**: `getAiPlatformBasePath(context)` yields `/student-lifecycle/{workspace}` so all links (back, cancel, View →) stay in the same workspace.

---

## 4. Context and base path

- **AiPlatformPageContext** (`components/shared/ai-platform/types.ts`): `appId`, `workspaceId`, `mode`, `peopleLabel`, optional `defaults`, etc.
- **getAiPlatformBasePath(context)**:
  - If no `appId`: `/ai-assistants`.
  - If `mode === 'workspace'` and `workspaceId`: `/{appId}/{workspaceId}` → e.g. `/student-lifecycle/admissions`.
- All agent links (list, new, detail) use this base path so that from `/student-lifecycle/admissions/agents` the “Back to Agents” and “View →” and “Create Agent” targets stay under `/student-lifecycle/admissions/agents...`.

---

## 5. Dependencies

- **Workspace config**: `lib/student-lifecycle/workspaces.ts` — `getWorkspaceConfig(workspace)`, `WORKSPACES`.
- **Nav**: `lib/nav/ai-platform-nav.ts` — “Agents” item; student-lifecycle nav built in `app/(shell)/student-lifecycle/_nav.ts` with `getAppNav({ pathname })`, which uses `buildAiPlatformNav` with `basePath = /student-lifecycle/{workspace}`.
- **APIs (used by agent form / DNE)**:
  - Goal suggestions: `POST /api/agent-goal-suggestions` (role, currentGoal).
  - Do-not-engage: `GET/DELETE /api/dne/agent?agentId=...&personId=...` (used in edit mode in `AgentDneSection`).
- **Data provider**: List/detail do **not** use `dataClient` yet; agents are from in-component constants. Future list/detail could go through `dataClient` or a dedicated agents API.

---

## 6. Summary table (files)

| Location | File | Purpose |
|----------|------|--------|
| `app/(shell)/student-lifecycle/[workspace]/agents/` | `page.tsx` | List page (AgentsListPageClient) |
| `app/(shell)/student-lifecycle/[workspace]/agents/` | `new/page.tsx` | New agent page (AgentNewPageClient) |
| `app/(shell)/student-lifecycle/[workspace]/agents/` | `[id]/page.tsx` | Agent detail/edit page (AgentDetailPageClient) |
| `components/shared/ai-platform/` | `AgentsListPageClient.tsx` | Wrapper for list context |
| `components/shared/ai-platform/` | `AgentDetailPageClient.tsx` | Detail/edit wrapper + AgentForm edit |
| `components/shared/ai-platform/` | `AgentNewPageClient.tsx` | Template picker + AgentForm create |
| `components/shared/ai-platform/` | `types.ts` | AiPlatformPageContext, getAiPlatformBasePath |
| `components/shared/agents/` | `AgentsPageClient.tsx` | List UI (search, filters, table, links) |
| `app/(shell)/ai-assistants/agents/_components/` | `agent-form.tsx` | Create/Edit form (Steps 1–6, DNE, Eval) |
| `app/(shell)/ai-assistants/agents/_components/` | `agent-dne-section.tsx` | Per-agent DNE list and remove |
| `app/(shell)/ai-assistants/templates/` | `agent-templates.ts` | AGENT_TEMPLATES, roles |
| `app/(shell)/ai-assistants/templates/` | `TemplateCard.tsx` | Template selection card |
| `lib/student-lifecycle/` | `workspaces.ts` | WORKSPACES, getWorkspaceConfig |
| `lib/nav/` | `ai-platform-nav.ts` | buildAiPlatformNav (Agents link) |
| `lib/agents/` | `types.ts` | AgentPriorityWeight, AgentType, NarrativeMessagingConfig, FlowBuilderDefinition |
| `lib/agents/` | `mock-data.ts` | MOCK_AGENTS, MOCK_NARRATIVE_PROFILES, getMockAgentById |
| `components/shared/agents/` | `AgentTypeBadge.tsx` | Badge for Autonomous vs Flow |
| `components/shared/agents/` | `NarrativeMessagingSection.tsx` | Profile, tone, topics, escalation, personalization (Autonomous only) |
| `components/shared/agents/` | `FlowBuilderSection.tsx` | Nodes palette + canvas (Flow only) |

This covers all files involved in the Student Lifecycle Agents experience (e.g. `/student-lifecycle/admissions/agents`): View (list), Edit (detail), and Create (new), and where each is implemented.
