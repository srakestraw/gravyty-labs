# Narrative Platform

**Purpose**: Storytelling content library and personalization service for consistent, compliant, outcome-driven messaging across the constituent lifecycle.

**Audience**: Engineers, Product Managers, Authors

**Scope**: Narrative Assets, Proof Blocks, Delivery Plays, Recommendation Engine, Composition, Learning Loop

**Non-goals**: Campaign management, free-form generative writing

**Key Terms**:
- **Narrative Asset**: Reusable storytelling content with classification (outcome, moment, intent, voice, etc.)
- **Proof Block**: Reusable evidence (impact, stats, testimonials) with claim support level
- **Delivery Play**: Domain-specific binding of narratives to triggers, cadence, and success events
- **Narrative Context**: Entity-aware, CDP-driven context for similarity matching

**Persistence**:
- **Mock (default)**: In-memory provider; no env required.
- **Database**: Set `USE_NARRATIVE_DB=true` and use the Prisma-backed provider. Requires:
  1. `cd packages/db && npx prisma generate` (so the client includes narrative models).
  2. A migration that creates `narrative_assets`, `narrative_modules`, `proof_blocks`, `narrative_proof_links`, `delivery_plays`. Run `npx prisma migrate dev --name add_narrative_tables` from `packages/db` if the schema has the narrative models and no migration exists yet.

**Links**:
- [PRD and Build Plan](../../prd/narrative-platform-prd-and-plan.md)
- [Contracts](contracts.md)
- [APIs and Events](apis-and-events.md)

**Last Updated**: 2025-02-08
