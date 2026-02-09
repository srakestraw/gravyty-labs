# Narrative Platform - Contracts

**Purpose**: Schema, enum dictionary, embedding requirements, and validation rules.

**Audience**: Engineers

**Last Updated**: 2025-02-08

---

## Schema Location

- **Zod schemas**: `packages/contracts/src/schemas/narrative/`
- **Prisma models**: `packages/db/prisma/schema.prisma` (NarrativeAsset, ProofBlock, DeliveryPlay, etc.)
- **Enum dictionary**: `packages/contracts/src/schemas/narrative/enums.ts`

JSON Schema can be generated from Zod via `zod-to-json-schema` if needed for tooling.

---

## Enum Dictionary

| Enum | Values |
|------|--------|
| **Outcome** | Taxonomy values (to be defined per workspace) |
| **Moment** | Taxonomy values (to be defined per workspace) |
| **Message Intent** | nudge, reminder, explain, resolve, ask, thank, update, confirm |
| **Claim Class** | financial, academic, operational, testimonial, policy, impact, other |
| **Risk Level** | low, medium, high |
| **PII Tier** | none, standard, sensitive |
| **Voice** | institutional, advisor, bursar, financial_aid_counselor, gift_officer, student_ambassador |
| **Channel Fit** | email, sms, in_app, chat, call_script, portal_content |
| **Domain Scope** | student_lifecycle, advancement_giving |
| **Sub Domain Scope** | admissions, registrar, financial_aid, bursar, housing, student_success, pipeline_intelligence, giving_intelligence, stewardship |
| **Approval State** | draft, in_review, approved, rejected |
| **Proof Type** | impact, stat, testimonial, policy, deadline, benefit |
| **Claim Support Level** | verified, internally_reported, anecdotal |
| **Play Category** | lifecycle_automation, staff_assist, portfolio_recommendation |
| **Trigger Type** | event, threshold, schedule, model_signal |
| **Cadence Policy** | single, sequence, recurring |

---

## Embedding Generation Requirements

### What text gets embedded

**Narrative Asset embedding** (Layer 2 - Machine semantics):
- Concatenate: approved content (all modules) + classification fields (outcome, moment, message_intent, voice, domain_scope, sub_domain_scope)
- Exclude: id, workspace, timestamps, embedding itself
- Purpose: Similarity matching against context embedding

**Narrative Context embedding** (Layer 2 - Machine semantics):
- Concatenate: role/persona, lifecycle state, relationship context, risk/opportunity signals, channel/use_case
- Must map to Outcome, Moment, and Message Intent for eligibility
- Purpose: Query-side embedding for similarity search

### When to refresh

- **Narrative Asset**: On approval_state change to `approved`; on content/module edit; on classification change
- **Narrative Context**: On each recommendation/compose request (real-time); cache TTL configurable per use case
- **Batch refresh**: Optional nightly job for narrative assets if embedding model or taxonomies change

### Model requirements

- Same embedding model for both narrative assets and context (cosine similarity)
- Dimension must be consistent (e.g. 384, 768, 1536 depending on model)
- Store dimension in config; validate at write time

---

## Validation Rules

- **Narrative Asset**: domain_scope/sub_domain_scope consistency; voice in allowed set; pii_tier vs. content rules
- **Proof Block**: claim_class and compliance rules; allowed_voice subset of platform voices; freshness_window format (90d, 365d, evergreen)
- **Delivery Play**: trigger_type and cadence_policy consistency; suppression_policy_id references shared library

---

## Update Triggers

This doc must be updated when:
- Schema or enum dictionary changes
- Embedding model or requirements change
- Validation rules change
