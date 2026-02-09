# Narrative Platform - PRD and Build Plan

## Purpose

The Narrative Platform is a shared **storytelling content library** and personalization service that enables consistent, compliant, and outcome-driven storytelling across the full constituent lifecycle:

- Recruiting
- Admissions
- Financial Aid
- Bursar
- Student Success
- Advancement
- Giving
- Stewardship

The platform separates reusable narrative assets from domain-specific delivery logic, allowing agentic AI to compose personalized narratives based on real-time CDP context while preserving governance, compliance, and learning loops.

This system functions as a shared platform component, not a feature embedded in any single product.

---

## Problem Statement

Current content and personalization approaches suffer from:
- Siloed content libraries by function
- Shallow personalization (token substitution)
- Hardcoded journeys and brittle rules
- High manual effort in portfolio outreach and stewardship
- Fragmented measurement and learning

As institutions are asked to do more with fewer staff, these approaches do not scale.

We need a unified narrative system that personalizes meaning, adapts to context, and compounds learning across domains.

---

## Goals

### Platform Goals
- Enable shared storytelling across all lifecycle domains
- Personalize meaning, not just messages
- Reduce manual effort for staff-driven outreach
- Support agentic AI with strict guardrails
- Learn from outcomes across the entire portfolio

### Business Outcomes Supported
- Recruiting: inquiry and application conversion
- Admissions: completion, yield, melt reduction
- Financial Aid: affordability confidence and acceptance
- Bursar: on-time payment and self-service resolution
- Student Success: retention and intervention uptake
- Advancement: pipeline growth and officer productivity
- Giving: conversion, average gift, recurring adoption
- Stewardship: retention, trust, and upgrades

---

## Core Concepts

- Narrative Asset (Shared)
- Delivery Play (Domain-Specific)
- Proof Block (Shared)
- Narrative Context
- Composition

---

## Classification Model (First-Class)

The classification model is **non-negotiable** for Phase 0. Without it, Narrative Messaging drifts into "content folder" territory and governance, relevance, and cross-workspace reuse suffer.

### Narrative Asset classification

Required fields (in addition to outcome/moment):

| Field | Values |
|-------|--------|
| **domain_scope** | `student_lifecycle` \| `advancement_giving` |
| **sub_domain_scope** | **Student:** `admissions` \| `registrar` \| `financial_aid` \| `bursar` \| `housing` \| `student_success` — **Advancement:** `pipeline_intelligence` \| `giving_intelligence` \| `stewardship` |
| **message_intent** | `nudge` \| `reminder` \| `explain` \| `resolve` \| `ask` \| `thank` \| `update` \| `confirm` |
| **relationship_type** | `institution_to_person` \| `staff_to_person` \| `peer_to_person` (optional but helpful) |
| **channel_fit** | `email` \| `sms` \| `in_app` \| `chat` \| `call_script` \| `portal_content` |
| **voice** | `institutional` \| `advisor` \| `bursar` \| `financial_aid_counselor` \| `gift_officer` \| `student_ambassador` |
| **compliance_risk_level** | `low` \| `medium` \| `high` |
| **pii_tier** | `none` \| `standard` \| `sensitive` (controls what can be injected at compose time) |

### Proof Block classification

| Field | Description |
|-------|-------------|
| **proof_type** | `impact` \| `stat` \| `testimonial` \| `policy` \| `deadline` \| `benefit` |
| **claim_support_level** | `verified` \| `internally_reported` \| `anecdotal` |
| **freshness_window** | e.g. `90d`, `365d`, `evergreen` |
| **allowed_voice** | Which voices can use this proof |
| **restricted_channels** | e.g. disallow SMS for high-context proof |

### Delivery Play classification

| Field | Description |
|-------|-------------|
| **play_category** | `lifecycle_automation` \| `staff_assist` \| `portfolio_recommendation` |
| **trigger_type** | `event` \| `threshold` \| `schedule` \| `model_signal` |
| **cadence_policy** | `single` \| `sequence` \| `recurring` |
| **suppression_policy_id** | Reference to shared library of suppression rules |

### RBAC and approval states (tied to classification)

Lifecycle state extends beyond draft/active/retired:

- **approval_state:** `draft` \| `in_review` \| `approved` \| `rejected`
- **required_approvers:** Derived from `compliance_risk_level` and `claim_class` (e.g. financial claims in Financial Aid or Giving require review by designated approvers).

---

## Schema and Semantics (Required)

### 1) Schema (what is enforced)

Schema is non-negotiable for governance, RBAC, approvals, and compliance. All services validate against it.

- **Narrative Asset schema:** Required fields: id, workspace, sub_domain_scope, domain_scope, outcome, moment, message_intent, channel_fit, voice, compliance_risk_level, pii_tier, approval_state, and content/module references. Optional: relationship_type. All enum fields must use allowed values from the enum dictionary. Validation: domain_scope/sub_domain_scope consistency, voice in allowed set, pii_tier vs. content rules.
- **Proof Block schema:** Required fields: id, workspace, proof_type, claim_support_level, claim_class, freshness_window, allowed_voice, and content. Optional: restricted_channels. Validation: claim_class and compliance rules, allowed_voice subset of platform voices, freshness_window format (e.g. 90d, 365d, evergreen).
- **Delivery Play schema:** Required fields: id, workspace, sub_workspace, play_category, trigger_type, cadence_policy, linked narrative/eligibility, success events. Optional: suppression_policy_id. Validation: trigger_type and cadence_policy consistency, suppression_policy_id references shared library.

### 2) Semantics (how meaning is represented)

Semantic signals are used by humans and AI to select and compose the right narrative. Three layers:

- **Layer 1 - Human-readable semantics:** Outcome, Moment, and Message Intent. These are taxonomy values (enums) that authors and operators use to tag and filter assets. They drive browse, search, and rule-based eligibility.
- **Layer 2 - Machine semantics:** Embeddings for Narrative Assets (derived from approved content + classification) and Narrative Context (derived from entity and situation). Used for similarity matching and ranking without hardcoding every combination.
- **Layer 3 - Behavioral semantics:** Performance signals (conversion/assist rates by workspace/sub_workspace), fatigue/diversity state, and assist attribution. Used to rank and de-bias recommendations and to feed the learning loop.

In v1 we intentionally avoid over-engineering deep ontologies. We rely on embeddings plus outcome/moment events to scale semantics; the enum taxonomy stays bounded and the rest is learned from usage and outcomes.

---

## Functional Requirements

### Narrative Asset Library
Reusable narrative assets with **classification model** (domain_scope, sub_domain_scope, message_intent, relationship_type, channel_fit, voice, compliance_risk_level, pii_tier), plus outcome, moment, modules, constraints, and embeddings.

### Proof Blocks
Reusable evidence objects with **classification** (proof_type, claim_support_level, freshness_window, allowed_voice, restricted_channels), claim classes, and compliance rules.

### Delivery Plays
Domain-specific bindings with **classification** (play_category, trigger_type, cadence_policy, suppression_policy_id), plus narratives, triggers, cadence, and success events.

### Narrative Context
Entity-aware, CDP-driven context embedded for similarity matching. Context must map to Outcome, Moment, and Message Intent for eligibility and filtering. The context embedding must be generated from: role/persona, lifecycle state, relationship context, risk/opportunity signals, and channel/use_case.

### Recommendation Engine
Shared ranking engine. Candidate filtering uses schema constraints: domain_scope, claim_class, compliance_risk_level, channel_fit, voice, pii_tier. Ranking uses semantics: similarity (narrative_embedding vs. context_embedding), performance (conversion/assist rates by workspace/sub_workspace), and fatigue/diversity (reduce repetition, enforce variety).

### Composition and Agentic Adaptation
Agents compose approved modules with strict guardrails, never inventing claims.

### Delivery Surfaces
Feeds, messaging, giving pages, call scripts, and portfolio tasks.

### Learning Loop
Standardized narrative events retrain ranking and inform lifecycle decisions.

---

## Workspace Rollout

**Narrative Messaging** appears in the following workspaces. All nav, RBAC, and data filtering are scoped by workspace and sub-workspace.

### 1. Student Lifecycle AI
- **Admissions**
- **Registrar**
- **Financial Aid**
- **Bursar**
- **Housing**
- **Student Success**

### 2. Advancement & Giving Intelligence
- **Pipeline Intelligence**
- **Giving Intelligence**
- **Stewardship** (optional first-class workspace; otherwise lives under Pipeline Intelligence for now)

---

## Narrative Messaging in Workspaces

**Narrative Messaging** is a **storytelling content library** used for personalization. The same product experience is offered in both workspaces above; content and defaults are scoped by workspace.

### Nav tooltip
- **Narrative Messaging:** “Storytelling content library for personalized messaging.”

### Landing page helper text (global – same in both workspaces)
- “Storytelling content library for personalization. Create reusable narratives and proof that AI assembles into compliant, role-appropriate messages for each person and moment.”

### One-line "Why it matters"
- "Better outcomes with less manual effort — consistent messaging that learns what works."

### What you do here
- Author narrative assets (storytelling content).
- Attach proof blocks (impact, stats, testimonials).
- Create delivery plays to use narratives in the right moments.
- Preview how narratives personalize for different segments.
- Track performance and improve narratives over time.

### What this is not
- Not a campaign manager.
- Not free-form generative writing.
- This is governed storytelling content used by agents and workflows.

---

## UX / IA

- **Left-nav:** In each workspace listed above, add a left-nav item: **Narrative Messaging** (with tooltip above).
- **Landing page scope cue:** On the Narrative Messaging landing page, show a mini header so "same feature, different context" is instantly clear:
  - **Workspace:** Student Lifecycle AI / Advancement & Giving Intelligence
  - **Sub-workspace:** Admissions / Pipeline Intelligence / etc.
  - **Default Voice:** Advisor / Gift Officer / etc.
- **Tabs (inside Narrative Messaging):**
  - **Narratives** – browse, search, and manage narrative assets (storytelling content).
  - **Delivery Plays** – configure and manage delivery plays for the workspace.
  - **Performance** – metrics and learning for narratives and plays.
- **Workspace-scoped defaults:**
  - Default Delivery Plays filtered to that workspace.
  - Recommended narratives tuned to that workspace’s outcomes and moments.
  - Voice/sender policies appropriate to the workspace (e.g., advisor vs bursar vs gift officer).

---

## Runtime Contract

All relevant calls and events must include **workspace** and **sub_workspace** for scoping and analytics.

- **Recommendations:** `{ workspace: "student_lifecycle_ai" | "advancement_giving_intelligence", sub_workspace: string, channel, use_case }`
- **Compose:** `{ workspace, sub_workspace, voice, sender_policy, claim_class }`
- **Events:** Include `workspace`, `sub_workspace`, `play_id` on all narrative/delivery events.

---

# Build Plan

## Phase 0: Schemas and Taxonomy
- Define schemas for Narrative Assets, Proof Blocks, Delivery Plays, and Outcome + Moment taxonomy.
- **Classification model (non-negotiable):** Implement the first-class classification model (Narrative Asset, Proof Block, and Delivery Play classification fields; RBAC and approval states tied to classification) as part of Phase 0. Without it, Narrative Messaging will drift into "content folder" territory and governance, relevance, and cross-workspace reuse will suffer.
- **Workspace integration:** Schema and taxonomy support `workspace` and `sub_workspace`; Outcome + Moment taxonomy covers Student Lifecycle AI (all 6 sub-workspaces) and Advancement & Giving Intelligence (Pipeline, Giving). No nav/RBAC yet.

**Definition of Done for Phase 0:**
- JSON schemas committed (narrative_asset, proof_block, delivery_play)
- Enum dictionary documented (Outcome, Moment, Message Intent, Claim Class, Risk Level, PII Tier, Voice, Channel Fit)
- Embedding generation requirements defined (what text gets embedded, when to refresh)
- Event contract includes workspace, sub_workspace, play_id for semantic learning

## Phase 1: Narrative Library Service
- CRUD, approvals, embeddings, and eligibility enforcement.
- **Workspace integration:** Student Lifecycle AI (all 6 sub-workspaces) and Advancement & Giving Intelligence (Pipeline, Giving). Navigation entry “Narrative Messaging” with Narratives tab; RBAC and workspace-scoped filtering for assets and eligibility.

## Phase 2: Proof Block Service
- Proof validation, claim enforcement, and linking.
- **Workspace integration:** Same workspaces/sub-workspaces; Proof Blocks and claim classes filterable by workspace. Narratives tab shows linked proof; RBAC and workspace-scoped filtering.

## Phase 3: Narrative Context Service
- Entity-aware context builder and embeddings.
- **Workspace integration:** Context and embeddings keyed by workspace/sub_workspace; recommendations and eligibility respect workspace-scoped outcomes/moments for all listed workspaces.

## Phase 4: Recommendation Engine
- Filtering, ranking, fatigue, and diversity controls.
- **Workspace integration:** Recommendation API accepts `workspace`, `sub_workspace`, `channel`, `use_case`; ranking tuned per workspace (Student Lifecycle AI sub-workspaces + Pipeline, Giving). Delivery Plays tab shows workspace-default plays; RBAC and workspace-scoped filtering.

## Phase 5: Composition and Agent Layer
- Composition pipeline, prompts, guardrails, confidence scoring.
- **Workspace integration:** Compose API accepts `workspace`, `sub_workspace`, `voice`, `sender_policy`, `claim_class`; voice/sender policies per workspace. All listed workspaces supported; RBAC enforced on compose.

## Phase 6: Delivery and Events
- Integrations, portfolio outputs, and standardized events.
- **Workspace integration:** All delivery surfaces and events include `workspace`, `sub_workspace`, `play_id`. Student Lifecycle AI (6 sub-workspaces) and Advancement & Giving (Pipeline, Giving) delivery and events wired; Performance tab shows workspace-scoped metrics.

## Phase 7: Learning Loop
- Performance aggregation, retraining, and asset lifecycle automation.
- **Workspace integration:** Learning and retraining scoped by workspace/sub_workspace; Performance tab and automation respect workspace boundaries for all listed workspaces. RBAC and workspace-scoped filtering for lifecycle actions.

---

## Recommendation

Implement the classification model above as part of **Phase 0 (Schemas and Taxonomy)** and treat it as **non-negotiable**. Without it, Narrative Messaging will drift into "content folder" territory and you will struggle with governance, relevance, and cross-workspace reuse.

---

## Guiding Principles

- Narratives are reusable assets, not journeys
- Domains own delivery plays, not content
- Agents compose, they do not invent
- Outcomes unify the platform
- Learning compounds across domains
