# Advancement Agents — Mock Data Plan

**Purpose**: Document the plan and implementation for mocking advancement agents in the Pipeline & Portfolio workspace.

**Audience**: Product, Design, Engineering

**Scope**: Mock agent data, workspace filtering, template alignment

**Links**:
- [Advancement Pipeline Nav Brief](advancement-pipeline-nav-brief.md)
- Agent templates: `app/(shell)/ai-assistants/templates/agent-templates.ts`

**Last Updated**: 2025-02-17

---

## 1. Plan Summary

Advancement pipeline agents are filtered by workspace so that `/advancement/pipeline/agents` shows only advancement agents (donor recovery, stewardship, campaign nudge, etc.), not admissions agents (transcript helper, registration requirements, etc.).

Mock advancement agents align with the **Recommended for this workspace** templates shown on the agents page.

---

## 2. Advancement Agent Templates (Source of Truth)

| Template Key | Name | Type | Purpose |
|--------------|------|------|---------|
| `lybunt-recovery` | Donor Recovery Agent | Autonomous | Identifies LYBUNT/SYBUNT donors, triggers outreach, monitors follow-ups |
| `donor-recovery` | LYBUNT Recovery | Autonomous | Re-engage donors who gave last year but not this year |
| `pipeline-stalled-prospect` | Pipeline Stalled Prospect | Autonomous | Flag high-potential prospects with stalled activity |
| `giving-campaign-nudge` | Giving Campaign Nudge | Autonomous | Nudge likely donors during campaigns |
| `stewardship-touch` | Stewardship Touch Agent | Autonomous | Ensure timely thank-yous and stewardship touches |
| `flow-donor-follow-up` | Donor Follow-up Flow | Flow | Post-meeting and post-gift follow-up tasks |
| `flow-major-gift-move` | Major Gift Move Flow | Flow | Automated steps when major-gift prospect moves stage |

---

## 3. Mock Advancement Agents (Implementation)

| Agent ID | Name | Type | Purpose |
|----------|------|------|---------|
| `agent-donor-warmup` | Donor Warm-Up Agent | Autonomous | Sends warm-up emails and scores replies |
| `agent-lybunt-recovery` | Donor Recovery Agent | Autonomous | LYBUNT/SYBUNT outreach and follow-ups |
| `agent-lybunt-recovery-alt` | LYBUNT Recovery | Autonomous | Re-engage lapsed donors |
| `agent-pipeline-stalled-prospect` | Pipeline Stalled Prospect | Autonomous | Flag stalled prospects, suggest next steps |
| `agent-giving-campaign-nudge` | Giving Campaign Nudge | Autonomous | Campaign nudge based on propensity |
| `agent-stewardship-touch` | Stewardship Touch Agent | Autonomous | Thank-yous and stewardship touches |
| `agent-flow-donor-follow-up` | Donor Follow-up Flow | Flow | Post-meeting/post-gift follow-up |
| `agent-flow-major-gift-move` | Major Gift Move Flow | Flow | Pipeline stage change automation |
| `agent-flow-prospect-reengagement` | Prospect Re-engagement Flow | Flow | Re-engage stalled prospects |

**Source**: `lib/agents/mock-data.ts`

---

## 4. Narrative Profile

Advancement agents that use narrative messaging share a common profile:

| Profile ID | Name | Description |
|------------|------|--------------|
| `profile-advancement-gift-officer` | Gift Officer | Professional, donor-centric tone for stewardship, LYBUNT recovery, and campaign outreach |

**Source**: `lib/agents/mock-data.ts` → `MOCK_NARRATIVE_PROFILES`

---

## 5. Workspace Filtering

- **Advancement** (`appId: 'advancement'`, `workspaceId: 'pipeline'` or `'advancement'`): Only agents with `roleKey === "advancement"`.
- **Student Lifecycle** (`appId: 'student-lifecycle'`): Only agents with `roleKey` in `admissions`, `registrar`, `student-success`, `career-services`, `alumni-engagement`.
- **No context**: All agents shown (e.g. `/ai-assistants/agents`).

**Source**: `components/shared/agents/AgentsPageClient.tsx` → `getWorkspaceScopeFromContext`, `agentsInWorkspace`

---

## 6. Files Modified

| File | Change |
|------|--------|
| `lib/agents/mock-data.ts` | Added `profile-advancement-gift-officer`; added 8 advancement agents |
| `components/shared/agents/AgentsPageClient.tsx` | Workspace-scoped agent filtering by `roleKey` |

---

## 7. Future Work

- **API/store alignment**: `lib/agents/store.ts` seeds all agents with `workspaceId: "admissions"`. Advancement agents should be seeded with `workspaceId: "pipeline"` so `GET /api/agents?workspaceId=pipeline` returns advancement agents.
- **Queue items**: Add advancement-specific queue items in `lib/agent-ops/mock.ts` → `getMockAgentQueueItems` for `workspaceId === 'pipeline'`.
- **Replace mock with dataClient**: When backend is wired, replace `MOCK_AGENTS` with `dataClient.listAgents(ctx)`.
