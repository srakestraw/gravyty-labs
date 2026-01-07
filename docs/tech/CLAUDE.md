# Technical Documentation Rules

**Purpose**: Operating rules specific to technical documentation.

**Audience**: Engineers

**Last Updated**: 2025-12-20

---

## Current State Only

Tech docs must describe "what is true now," not aspirational architecture.

## Link to Shared Services

Domain tech docs must link to shared services, not duplicate their documentation:
- ✅ Link: "See [Data Provider](../../shared-services/data-provider/README.md)"
- ❌ Duplicate: Copying API contracts from shared service docs

## Backward Compatibility

When documenting breaking changes:
- Note migration path
- Document deprecation timeline
- Link to migration guide

## Runbooks Are Required

Every domain with operational concerns must have:
- Failure modes documented
- Troubleshooting steps
- Recovery procedures
- On-call contacts

---

## Update Triggers

Tech docs must be updated when:
- Architecture changes
- APIs change
- Data models change
- New failure modes are discovered
- Runbooks need updates




