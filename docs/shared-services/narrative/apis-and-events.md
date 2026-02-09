# Narrative Platform - APIs and Events

**Purpose**: Event contract and API expectations for semantic learning.

**Audience**: Engineers

**Last Updated**: 2025-02-08

---

## Event Contract (Required for Semantic Learning)

All narrative and delivery events **must** include these fields for scoping and semantic learning:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **workspace** | string | Yes | `student_lifecycle_ai` or `advancement_giving_intelligence` |
| **sub_workspace** | string | Yes | e.g. admissions, pipeline_intelligence, giving_intelligence |
| **play_id** | string (uuid) | Yes | Delivery play that triggered the event |

### Additional event fields (recommended)

- `narrative_asset_id`: Which narrative was used
- `constituent_id` / `entity_id`: Target of the message
- `channel`: email, sms, in_app, etc.
- `outcome`: Outcome taxonomy value
- `moment`: Moment taxonomy value
- `event_type`: e.g. `narrative_delivered`, `narrative_converted`, `narrative_assist`
- `timestamp`: ISO 8601

### Event types for Learning Loop

- `narrative_delivered`: Narrative was sent to constituent
- `narrative_converted`: Constituent took desired action (e.g. completed form, made gift)
- `narrative_assist`: Staff used narrative in assist context
- `narrative_recommended`: Recommendation engine suggested narrative (for attribution)

---

## Runtime Contract (from PRD)

**Recommendations**:
```json
{
  "workspace": "student_lifecycle_ai" | "advancement_giving_intelligence",
  "sub_workspace": "string",
  "channel": "string",
  "use_case": "string"
}
```

**Compose**:
```json
{
  "workspace": "string",
  "sub_workspace": "string",
  "voice": "string",
  "sender_policy": "string",
  "claim_class": "string"
}
```

**Events**: Include `workspace`, `sub_workspace`, `play_id` on all narrative/delivery events.

---

## Update Triggers

This doc must be updated when:
- Event schema changes
- New event types are added
- Runtime contract changes
