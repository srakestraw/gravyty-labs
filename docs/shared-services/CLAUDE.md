# Shared Services Documentation Rules

**Purpose**: Operating rules specific to shared service documentation.

**Audience**: Engineers

**Last Updated**: 2025-12-20

---

## Single Source of Truth

Shared service docs are canonical. Domains link to them, they do not duplicate them.

## Contracts Are Required

Every service must document:
- SLOs (Service Level Objectives)
- Rate limits
- Guarantees and promises
- Breaking change policy

## Backward Compatibility

When documenting breaking changes:
- Note migration path
- Document deprecation timeline
- Update all dependent domain docs

## Runbooks Are Required

Every service must have:
- Failure modes documented
- Troubleshooting steps
- Recovery procedures
- On-call contacts

---

## Update Triggers

Shared service docs must be updated when:
- Service contracts change
- APIs change
- Architecture changes
- New failure modes are discovered
- SLOs change




