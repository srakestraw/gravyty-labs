# Seed data

## Narrative Messaging (UNC)

**File:** `narrative_messaging_unc.json`

Seed data for the Narrative Messaging module when the institution is UNC (University of North Carolina) and the workspace context is:

- **workspace:** `advancement_giving_intelligence`
- **sub_workspace:** `pipeline_intelligence`
- **default_voice:** `gift_officer`

### Enabling the seed

Set the environment variable:

```bash
SEED_NARRATIVE_UNC=true
```

With the **mock** narrative provider (default when `USE_NARRATIVE_DB` is not `true`), the first time the narrative provider is used the fixture is loaded and the in-memory store is seeded. This populates:

- **Narratives** – 6 UNC-specific narrative assets (Carolina First, thank-you, cultivation, lapsed donor, stewardship, leadership ask)
- **Proof Blocks** – 10 proof blocks (impact, stat, testimonial, policy, deadline, benefit)
- **Narrative–proof links** – links between narratives and proof blocks
- **Delivery Plays** – 6 plays (portfolio recommendation, lifecycle automation, staff assist)
- **Performance events** – placeholder delivery/conversion/assist events so the Performance tab shows sample metrics

The **Preview** tab shows 4 sample preview scenarios (email, SMS, portal, call script) when the seed is enabled. The **Performance** tab shows a “Sample/demo data” banner and “Top narratives this month” / “Top proof blocks” from the fixture.

### Contents

- **narratives** – title, domain_scope, sub_domain_scope, moment, message_intent, primary CTA, channel_fit, voice, compliance_risk_level, modules (hook, core_story, proof_refs, cta_block), lifecycle_state (active), approval_state (approved)
- **proof_blocks** – title, proof_type, claim_support_level, allowed_voice, restricted_channels, content
- **delivery_plays** – title, play_category, trigger_type, trigger_definition, channels, suppression_rules, narrative_selection, eligibility, success_events
- **preview_scenarios** – persona, context, channel, assembled_message, why_chosen
- **performance** – per_narrative and per_play metrics, top_narratives_this_month, top_proof_blocks (all marked as sample/demo)

Statistics in the fixture are example or placeholder only; do not cite as real UNC figures without verification.
