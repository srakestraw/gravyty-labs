# CRM Mock - Contracts

**Purpose**: Product-facing promises: SLOs, limits, guarantees, and data model status.

**Audience**: Engineers, Product Managers

**Last Updated**: 2025-01-27

---

## Data Model Confirmation

### Status: ❌ **Not yet a full CRM**

CRM Mock has **complete TypeScript type definitions** for all canonical Advancement CRM entities, but **database schema and implementation are incomplete**.

**Current State**:
- ✅ **Types**: All 40+ canonical entities defined in `lib/crm-mock/types.ts`
- ✅ **Terminology**: Advancement-only (no student/admissions concepts)
- ⚠️ **Database**: Only 4 tables exist (`CrmConstituent`, `CrmOrganization`, `CrmOpportunity`, `CrmInteraction`)
- ⚠️ **API**: Only 6 routes implemented (constituents, opportunities, interactions, organizations, lapsed-donors, admin)
- ⚠️ **Provider**: Most methods stubbed with TODO comments

**Gap**: 36+ database tables and 50+ API routes missing for full CRM functionality.

### Implemented Entities

✅ **Core Entities** (Type + Database + API):
- `Constituent` (`lib/crm-mock/types.ts:34`, `packages/db/prisma/schema.prisma:447`)
- `Organization` (`lib/crm-mock/types.ts:93`, `packages/db/prisma/schema.prisma:466`)
- `Opportunity` (`lib/crm-mock/types.ts:225`, `packages/db/prisma/schema.prisma:483`)
- `Interaction` (`lib/crm-mock/types.ts:51`, `packages/db/prisma/schema.prisma:507`)

### Missing Entities (P0 - Required for Full CRM)

❌ **Identity Domain**:
- `Household` + `HouseholdMember` (Type only: `lib/crm-mock/types.ts:47,56`)
- `Address`, `Email`, `Phone` (Type only: `lib/crm-mock/types.ts:64,80,91`)
- `Preferences`, `Consent` (Type only: `lib/crm-mock/types.ts:102,115`)
- `Relationship` (Type only: `lib/crm-mock/types.ts:100`)

❌ **Prospecting Domain**:
- `ProspectProfile` (Type only: `lib/crm-mock/types.ts:185`)
- `Rating` (Type only: `lib/crm-mock/types.ts:197`)
- `Assignment` (Type only: `lib/crm-mock/types.ts:208`)

❌ **Giving Domain**:
- `Gift` (Type only: `lib/crm-mock/types.ts:290` - currently derived from Opportunity)
- `GiftAllocation` (Type only: `lib/crm-mock/types.ts:310`)
- `Campaign`, `Appeal`, `Fund`, `Designation` (Type only: `lib/crm-mock/types.ts:420,432,444,452`)
- `Pledge` + `Installment` (Type only: `lib/crm-mock/types.ts:330,350`)
- `RecurringGiftSchedule` (Type only: `lib/crm-mock/types.ts:340`)
- `SoftCredit`, `Tribute`, `MatchingGift` (Type only: `lib/crm-mock/types.ts:320,375,382`)
- `Receipt`, `Payment` (Type only: `lib/crm-mock/types.ts:390,360`)

❌ **Moves Management Domain**:
- `StageHistory` (Type only: `lib/crm-mock/types.ts:247`)
- `MovePlan` + `MoveStep` (Type only: `lib/crm-mock/types.ts:257,270`)

❌ **Portfolio + Segmentation Domain**:
- `Portfolio` + `PortfolioMember` (Type only: `lib/crm-mock/types.ts:398,405`)
- `Tag` + `ConstituentTag` (Type only: `lib/crm-mock/types.ts:127,135`)
- `Segment` + `SegmentMember` (Type only: `lib/crm-mock/types.ts:142,152`)
- `CustomFieldDefinition` + `CustomFieldValue` (Type only: `lib/crm-mock/types.ts:159,172`)

❌ **Events Domain**:
- `Event` + `EventParticipation` (Type only: `lib/crm-mock/types.ts:73,83`)

❌ **System Domain**:
- `SourceSystemRef` (Type only: `lib/crm-mock/types.ts:14` - not persisted)
- `AuditLog` (Type only: `lib/crm-mock/types.ts:20`)

### Next Actions and Migration Plan

**Phase A (P0 - Required for Full CRM)**:
1. Add database tables for households, stage history, campaigns/appeals/funds, gifts, gift allocations, pledges, recurring gifts, source refs, audit logs
2. Implement API routes for all Phase A entities
3. Update provider methods (remove TODO stubs)
4. Generate comprehensive seed data

**Phase B (P1 - Next Priority)**:
1. Add preferences/consent, custom fields, segments
2. Add soft credits, matching gifts, tributes, receipts, payments

**Phase C (P2 - Later Enhancement)**:
1. Add move plans, multiple contact methods, tags, events, prospecting

See [Data Model Confirmation](./data-model-confirmation.md) for complete inventory and migration plan.

---

## Service Level Objectives (SLOs)

- **Availability**: 99.9% uptime (mock service, local availability)
- **Latency**: < 100ms for read operations, < 200ms for write operations
- **Consistency**: Strong consistency (database-backed, no distributed system)
- **Data Freshness**: Immediate (no sync delays)

---

## Rate Limits

- **Read Operations**: No limits (mock service)
- **Write Operations**: No limits (mock service)
- **Bulk Operations**: No limits, but large operations may take longer

---

## Guarantees

### Data Access
- All data access requires workspace and app context (`workspace: 'advancement'`, `app: 'crm-mock'`)
- Data is scoped to the provided workspace/app context
- User-specific filtering when userId is provided

### Data Model Compatibility
- Compatible with common Advancement CRM patterns (Salesforce-like, Blackbaud-like)
- Standard constituent, organization, opportunity, and gift models
- Extensible for domain-specific needs

### Mock Data Quality
- Realistic synthetic data generation (2 years of data)
- Consistent data relationships
- Support for bulk data operations

### Advancement-Only Guarantee
- **No student/admissions concepts**: All terminology is Advancement-focused (Constituents, Gifts, Opportunities, Move Plans, Portfolios)
- Verified: No matches for "Admissions", "Student", "Applicant", "Enrollment", "Student Lifecycle" in CRM Mock code

---

## Breaking Change Policy

- Major version bumps for breaking API changes
- Deprecation warnings before removal
- Migration guides for breaking changes
- Backward compatibility maintained where possible

---

## Data Model Guarantees

### Constituents
- Always have at least a name
- Support for person and organization types
- Household relationship tracking (when implemented)

### Opportunities
- Always associated with at least one constituent or organization
- Standard stage/status tracking
- Stage history support (when implemented)

### Gifts
- Always associated with a constituent
- Support for allocations, pledges, recurring gifts (when implemented)
- Fiscal year tracking

### Organizations
- Organization-level records
- Support for household, corporation, foundation, nonprofit types
- Constituent associations

---

## Update Triggers

This doc must be updated when:
- Data model status changes (full CRM achieved)
- SLOs change
- Rate limits change
- Guarantees change
- Breaking change policy evolves
- Data model guarantees change

---

## Related Documentation

- [Data Model Confirmation](./data-model-confirmation.md) - Complete entity inventory and gap analysis
- [Data Model](./data-model.md) - Complete entity definitions and relationships
- [CRM Mock README](./README.md) - Service overview



