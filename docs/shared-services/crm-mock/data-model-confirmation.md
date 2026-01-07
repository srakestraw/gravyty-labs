# CRM Mock Data Model Confirmation

**Purpose**: Confirmation of CRM Mock data model completeness against canonical Advancement CRM requirements.

**Last Updated**: 2025-01-27

---

## Executive Summary

**Status**: ❌ **Not yet a full CRM**

CRM Mock has **complete TypeScript type definitions** for all canonical entities, but **database schema and implementation are incomplete**. Only 4 of 40+ required entities are persisted in the database.

**Top Gaps**:
1. **Database schema**: Missing 36+ tables (households, addresses, gifts, campaigns, move plans, etc.)
2. **API implementation**: Most provider methods are stubbed with TODO comments
3. **Seed data**: Only basic constituents, organizations, opportunities, and interactions are seeded

**Next Steps**: Implement Phase A (P0 entities) to achieve "full CRM" status.

---

## Entity Inventory

| Entity / Table | Exists? | Location | Notes |
|----------------|---------|----------|-------|
| **Identity Domain** |
| `tenant` | ❌ | N/A | Not needed (workspace/app scoping) |
| `person` (Constituent) | ✅ | `lib/crm-mock/types.ts:34`<br>`packages/db/prisma/schema.prisma:447` | Type + DB table `CrmConstituent` |
| `organization` | ✅ | `lib/crm-mock/types.ts:93`<br>`packages/db/prisma/schema.prisma:466` | Type + DB table `CrmOrganization` |
| `household` | ⚠️ | `lib/crm-mock/types.ts:47` | Type only, no DB table |
| `household_member` | ⚠️ | `lib/crm-mock/types.ts:56` | Type only, no DB table |
| `person_email` (Email) | ⚠️ | `lib/crm-mock/types.ts:80` | Type only, no DB table |
| `person_phone` (Phone) | ⚠️ | `lib/crm-mock/types.ts:91` | Type only, no DB table |
| `person_address` (Address) | ⚠️ | `lib/crm-mock/types.ts:64` | Type only, no DB table |
| `affiliation` | ❌ | N/A | Not defined |
| `relationship` | ⚠️ | `lib/crm-mock/types.ts:100` | Type only, no DB table |
| `contact_preference` (Preferences) | ⚠️ | `lib/crm-mock/types.ts:102` | Type only, no DB table |
| `consent` | ⚠️ | `lib/crm-mock/types.ts:115` | Type only, no DB table |
| **Prospecting Domain** |
| `user` | ❌ | N/A | Not needed (using userId in context) |
| `assignment` | ⚠️ | `lib/crm-mock/types.ts:208` | Type only, no DB table |
| `prospect_profile` | ⚠️ | `lib/crm-mock/types.ts:185` | Type only, no DB table |
| `score` (Rating) | ⚠️ | `lib/crm-mock/types.ts:197` | Type only, no DB table |
| `sentiment_signal` | ⚠️ | `lib/crm-mock/types.ts:51` | Part of Interaction type, not persisted |
| **Activities Domain** |
| `interaction` | ✅ | `lib/crm-mock/types.ts:51`<br>`packages/db/prisma/schema.prisma:507` | Type + DB table `CrmInteraction` |
| `task` | ⚠️ | `lib/crm-mock/types.ts:62` | Type only, uses Interaction with type='task' |
| `note` | ⚠️ | N/A | Uses Interaction with type='note' |
| **Events Domain** |
| `event` | ⚠️ | `lib/crm-mock/types.ts:73` | Type only, no DB table |
| `event_participation` | ⚠️ | `lib/crm-mock/types.ts:83` | Type only, no DB table |
| **Giving Domain** |
| `campaign` | ⚠️ | `lib/crm-mock/types.ts:420` | Type only, no DB table |
| `appeal` | ⚠️ | `lib/crm-mock/types.ts:432` | Type only, no DB table |
| `fund` | ⚠️ | `lib/crm-mock/types.ts:444` | Type only, no DB table |
| `gift` | ⚠️ | `lib/crm-mock/types.ts:290` | Type only, currently derived from Opportunity (status='won') |
| `gift_allocation` | ⚠️ | `lib/crm-mock/types.ts:310` | Type only, no DB table |
| `payment` | ⚠️ | `lib/crm-mock/types.ts:360` | Type only, no DB table |
| `receipt` | ⚠️ | `lib/crm-mock/types.ts:390` | Type only, no DB table |
| `soft_credit` | ⚠️ | `lib/crm-mock/types.ts:320` | Type only, no DB table |
| `tribute` | ⚠️ | `lib/crm-mock/types.ts:375` | Type only, no DB table |
| `matching_gift` | ⚠️ | `lib/crm-mock/types.ts:382` | Type only, no DB table |
| `pledge` | ⚠️ | `lib/crm-mock/types.ts:330` | Type only, no DB table |
| `pledge_installment` (Installment) | ⚠️ | `lib/crm-mock/types.ts:350` | Type only, no DB table |
| `recurring_gift` (RecurringGiftSchedule) | ⚠️ | `lib/crm-mock/types.ts:340` | Type only, no DB table |
| **Moves Management Domain** |
| `opportunity` | ✅ | `lib/crm-mock/types.ts:225`<br>`packages/db/prisma/schema.prisma:483` | Type + DB table `CrmOpportunity` |
| `opportunity_stage_history` (StageHistory) | ⚠️ | `lib/crm-mock/types.ts:247` | Type only, no DB table |
| `move_plan` | ⚠️ | `lib/crm-mock/types.ts:257` | Type only, no DB table |
| `move_step` | ⚠️ | `lib/crm-mock/types.ts:270` | Type only, no DB table |
| **Portfolio + Segmentation Domain** |
| `portfolio` | ⚠️ | `lib/crm-mock/types.ts:398` | Type only, no DB table |
| `portfolio_member` | ⚠️ | `lib/crm-mock/types.ts:405` | Type only, no DB table |
| `tag` | ⚠️ | `lib/crm-mock/types.ts:127` | Type only, no DB table |
| `person_tag` (ConstituentTag) | ⚠️ | `lib/crm-mock/types.ts:135` | Type only, no DB table |
| `segment` | ⚠️ | `lib/crm-mock/types.ts:142` | Type only, no DB table |
| `custom_field_definition` | ⚠️ | `lib/crm-mock/types.ts:159` | Type only, no DB table |
| `custom_field_value` | ⚠️ | `lib/crm-mock/types.ts:172` | Type only, no DB table |
| **System Domain** |
| `source_ref` (SourceSystemRef) | ⚠️ | `lib/crm-mock/types.ts:14` | Type only, not persisted |
| `audit_log` | ⚠️ | `lib/crm-mock/types.ts:20` | Type only, no DB table |

**Legend**:
- ✅ = Type + Database table + API implementation
- ⚠️ = Type only (no database table or API implementation)
- ❌ = Not defined

---

## Missing Entities Analysis

### P0 - Required for "Full CRM" (Phase A)

| Entity | Why It Matters | Minimal MVP Fields | Dependent Pages | Priority |
|--------|----------------|-------------------|-----------------|----------|
| `household` + `household_member` | Enables household giving aggregation and relationship management | `id`, `name`, `primaryConstituentId`, `createdAt`, `updatedAt` | Constituent 360, Household views | P0 |
| `opportunity_stage_history` | Tracks stage transitions for pipeline analysis | `id`, `opportunityId`, `stage`, `status`, `changedAt`, `changedBy` | Opportunities pipeline, Forecast reports | P0 |
| `campaign` + `appeal` + `fund` | Required for gift allocation and campaign reporting | `id`, `name`, `fiscalYear`, `startDate`, `endDate`, `status` | Campaign admin, Gift allocation | P0 |
| `gift_allocation` | Enables split gifts across multiple funds/designations | `id`, `giftId`, `fundId`, `amount` | Gift detail, Allocation reports | P0 |
| `pledge` + `recurring_gift` | Core Advancement giving concepts | `id`, `constituentId`, `totalAmount`, `amountPaid`, `status`, `pledgeDate` | Pledge management, Recurring gifts | P0 |
| `source_ref` | Enables CRM integration and sync tracking | `system`, `externalId`, `lastSyncedAt` | Integration views | P0 |
| `audit_log` | Required for compliance and change tracking | `id`, `entityType`, `entityId`, `action`, `userId`, `createdAt` | Audit reports | P0 |

### P1 - Next Priority (Phase B)

| Entity | Why It Matters | Minimal MVP Fields | Dependent Pages | Priority |
|--------|----------------|-------------------|-----------------|----------|
| `preferences` + `consent` | Required for GDPR/compliance and contact preferences | `id`, `constituentId`, `preferredContactMethod`, `doNotCall`, `doNotEmail` | Constituent 360, Preferences | P1 |
| `custom_field_definition` + `custom_field_value` | Enables extensibility for institution-specific fields | `id`, `name`, `type`, `isActive` | Constituent 360, Custom fields | P1 |
| `segment` | Required for audience segmentation and targeting | `id`, `name`, `criteria`, `memberCount` | Segments page, Targeting | P1 |
| `soft_credit` | Enables recognition for non-donors (spouses, board members) | `id`, `giftId`, `constituentId`, `amount`, `reason` | Gift detail, Recognition | P1 |
| `matching_gift` + `tribute` | Common Advancement giving scenarios | `id`, `giftId`, `matchAmount`, `status` | Gift detail, Matching gifts | P1 |
| `receipt` + `payment` | Required for gift processing and acknowledgment | `id`, `giftId`, `receiptNumber`, `receiptDate`, `amount` | Gift detail, Receipting | P1 |

### P2 - Later Enhancement (Phase C)

| Entity | Why It Matters | Minimal MVP Fields | Dependent Pages | Priority |
|--------|----------------|-------------------|-----------------|----------|
| `move_plan` + `move_step` | Moves management for major gift cultivation | `id`, `constituentId`, `name`, `goal`, `status`, `targetDate` | Move plans page, Constituent 360 | P2 |
| `address` + `email` + `phone` | Multiple contact methods per constituent | `id`, `constituentId`, `type`, `isPrimary`, `address/number` | Constituent 360, Contact info | P2 |
| `tag` + `person_tag` | Flexible tagging system | `id`, `name`, `category`, `color` | Constituent 360, Tags | P2 |
| `event` + `event_participation` | Event management and attendance tracking | `id`, `name`, `date`, `type`, `location` | Events page, Attendance | P2 |
| `prospect_profile` + `rating` + `assignment` | Prospecting and capacity rating | `id`, `constituentId`, `capacity`, `inclination`, `interests` | Constituent 360, Prospecting | P2 |
| `relationship` | Links constituents to households and organizations | `id`, `constituentId`, `relatedConstituentId`, `type` | Constituent 360, Relationships | P2 |

---

## Implementation Status

### Type Definitions
- ✅ **Complete**: All 40+ canonical entities defined in `lib/crm-mock/types.ts`
- ✅ **Advancement-only**: No student/admissions terminology found

### Database Schema
- ❌ **Incomplete**: Only 4 tables exist (`CrmConstituent`, `CrmOrganization`, `CrmOpportunity`, `CrmInteraction`)
- ❌ **Missing**: 36+ tables needed for full CRM

### API Routes
- ⚠️ **Partial**: Only 6 routes exist (`/constituents`, `/opportunities`, `/interactions`, `/organizations`, `/lapsed-donors`, `/admin/seed`, `/admin/reset`)
- ❌ **Missing**: 50+ API routes for new entities

### Provider Implementation
- ⚠️ **Stubbed**: Most methods in `lib/crm-mock/adapter.ts` return empty arrays or throw "not implemented"
- ✅ **Basic**: Core methods (`listConstituents`, `getConstituent`, `listGifts`, `listInteractions`) are implemented

### Seed Data
- ⚠️ **Basic**: Only seeds constituents (30), organizations (10), opportunities (20), interactions (60)
- ❌ **Missing**: Households, addresses, gifts with allocations, pledges, recurring gifts, campaigns, etc.

---

## Terminology Validation

✅ **No student/admissions concepts found**:
- Searched `app/(shell)/crm-mock/` - No matches
- Searched `lib/crm-mock/` - No matches
- All terminology is Advancement-focused: Constituents, Gifts, Opportunities, Move Plans, Portfolios

---

## Migration Plan

### Phase A - P0 Full CRM Core (Required)

**Goal**: Achieve "full CRM" status with core entities

1. **Database Schema** (`packages/db/prisma/schema.prisma`):
   - Add `CrmHousehold` + `CrmHouseholdMember` tables
   - Add `CrmOpportunityStageHistory` table
   - Add `CrmCampaign`, `CrmAppeal`, `CrmFund`, `CrmDesignation` tables
   - Add `CrmGift` table (separate from Opportunity)
   - Add `CrmGiftAllocation` table
   - Add `CrmPledge` + `CrmPledgeInstallment` tables
   - Add `CrmRecurringGiftSchedule` table
   - Add `SourceSystemRef` fields to all top-level entities
   - Add `CrmAuditLog` table

2. **API Routes** (`app/api/crm-mock/`):
   - Implement household APIs
   - Implement opportunity stage history APIs
   - Implement campaign/appeal/fund APIs
   - Implement gift allocation APIs
   - Implement pledge and recurring gift APIs
   - Implement audit log APIs

3. **Provider** (`lib/crm-mock/adapter.ts`):
   - Implement all Phase A methods (remove TODO stubs)
   - Add source system ref handling
   - Add audit log creation

4. **Seed Data** (`app/api/crm-mock/admin/seed/route.ts`):
   - Generate households and household members
   - Generate opportunities with stage history
   - Generate campaigns, appeals, funds
   - Generate gifts with allocations
   - Generate pledges and recurring gifts
   - Generate audit logs

**Estimated Effort**: 2-3 weeks

### Phase B - P1 Next Priority

**Goal**: Add preferences, custom fields, segments, and advanced giving features

1. **Database Schema**:
   - Add `CrmPreferences`, `CrmConsent` tables
   - Add `CrmCustomFieldDefinition`, `CrmCustomFieldValue` tables
   - Add `CrmSegment`, `CrmSegmentMember` tables
   - Add `CrmSoftCredit`, `CrmMatchingGift`, `CrmTribute` tables
   - Add `CrmReceipt`, `CrmPayment` tables

2. **API Routes & Provider**:
   - Implement all Phase B methods

3. **Seed Data**:
   - Generate preferences and consents
   - Generate custom fields and values
   - Generate segments
   - Generate soft credits, matching gifts, tributes
   - Generate receipts and payments

**Estimated Effort**: 2-3 weeks

### Phase C - P2 Later Enhancement

**Goal**: Add move plans, multiple contact methods, tags, events, prospecting

1. **Database Schema**:
   - Add `CrmMovePlan`, `CrmMoveStep` tables
   - Add `CrmAddress`, `CrmEmail`, `CrmPhone` tables
   - Add `CrmTag`, `CrmConstituentTag` tables
   - Add `CrmEvent`, `CrmEventParticipation` tables
   - Add `CrmProspectProfile`, `CrmRating`, `CrmAssignment` tables
   - Add `CrmRelationship` table

2. **API Routes & Provider**:
   - Implement all Phase C methods

3. **Seed Data**:
   - Generate move plans and steps
   - Generate addresses, emails, phones
   - Generate tags
   - Generate events and participations
   - Generate prospect profiles, ratings, assignments
   - Generate relationships

**Estimated Effort**: 2-3 weeks

---

## Acceptance Criteria

- [ ] All P0 entities have database tables
- [ ] All P0 entities have API routes
- [ ] All P0 entities have provider methods implemented
- [ ] Seed data generates realistic P0 data
- [ ] No student/admissions terminology in CRM Mock code
- [ ] `contracts.md` updated with "Full CRM" status

---

## Related Documentation

- [CRM Mock Data Model](./data-model.md) - Complete entity definitions
- [CRM Mock README](./README.md) - Service overview
- [CRM Unified Contracts](../crm-unified/contracts.md) - Underlying service contracts



