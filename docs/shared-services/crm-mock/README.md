# CRM Mock Service

**Purpose**: Advancement-only CRM demo application for testing, demos, and AI training.

**Audience**: Engineers, Product Managers, Designers

**Last Updated**: 2025-01-27

---

## Overview

CRM Mock is a database-backed CRM demo application specifically designed for Advancement workflows. It provides realistic constituent management, gift tracking, portfolio management, and donor analytics without any admissions or student lifecycle concepts.

### Key Features

- **Constituent Management**: Track donors, prospects, and organizations
- **Gift Tracking**: Record and analyze giving history by fiscal year
- **Portfolio Management**: Assign constituents to gift officers (future)
- **Outreach Queue**: Task management for gift officers
- **Donor Analytics**: Lapsed donor reports, propensity scoring, sentiment analysis (future)
- **Event Management**: Track event participation (future)
- **Relationship Mapping**: Link constituents to households and organizations (future)

---

## Quick Start

### Accessing CRM Mock

Navigate to `/crm-mock` in the application. The sidebar provides access to:

- **Dashboard**: Overview with key metrics
- **Constituents**: List and search constituents
- **Portfolios**: Manage gift officer portfolios (future)
- **Outreach Queue**: Task management
- **Reports**: Lapsed donors, portfolio coverage, outreach activity, giving trends

### Seeding Data

To populate CRM Mock with demo data:

1. Navigate to `/crm-mock/admin/data-generator`
2. Click "Generate Seed Data (2 Years)"
3. Wait for seeding to complete (~300 constituents, 2,000 gifts, 1,500 interactions)

Or via API:

```typescript
// POST /api/crm-mock/admin/seed
fetch('/api/crm-mock/admin/seed', { method: 'POST' });
```

---

## Architecture

CRM Mock is built on top of CRM Unified:

```
CRM Mock UI Components
    ↓
CRM Mock Adapter (lib/crm-mock/adapter.ts)
    ↓
Next.js API Routes (app/api/crm-mock/*)
    ↓
CRM Unified Client (lib/crm-unified)
    ↓
Database (PostgreSQL via Prisma)
```

### Context

All CRM Mock data is scoped to:

- `workspace: 'advancement'`
- `app: 'crm-mock'`

This ensures data isolation from other applications (e.g., `app: 'pipeline'`).

---

## Data Model

See [Data Model Documentation](./data-model.md) for complete entity definitions, relationships, and computed fields.

### Core Entities

- **Constituent**: Person or organization that can give gifts
- **Gift**: Completed donation (won opportunity)
- **Portfolio**: Collection of constituents assigned to a gift officer
- **Interaction**: Record of communication or engagement
- **Task**: To-do item for gift officers
- **Event**: Fundraising or engagement event
- **Organization**: Household, corporation, foundation, or nonprofit
- **LapsedDonor**: Computed entity for re-engagement opportunities

---

## Usage Examples

### List Constituents

```typescript
import { crmMockProvider } from '@/lib/crm-mock';

const constituents = await crmMockProvider.listConstituents(
  {},
  {
    filters: { propensityMin: 50 },
    paging: { page: 1, pageSize: 50 },
    sort: { field: 'propensity', direction: 'desc' },
  }
);
```

### Get Constituent with Rollups

```typescript
const constituent = await crmMockProvider.getConstituent({}, constituentId);

// Returns ConstituentDetail with:
// - lastGift
// - currentFyTotal
// - priorFyTotal
// - lastInteraction
```

### List Gifts

```typescript
const gifts = await crmMockProvider.listGifts({}, constituentId);

// Returns Gift[] with fiscal year information
```

### Get Lapsed Donors

```typescript
const lapsedDonors = await crmMockProvider.getLapsedDonors({}, {
  currentFyStart: '2024-07-01',
  currentFyEnd: '2025-06-30',
});
```

---

## Fiscal Year Handling

CRM Mock uses a July 1 - June 30 fiscal year:

- **Current FY**: If current month >= July, FY is `currentYear + 1`, else `currentYear`
- **Example**: January 2025 → FY2025, August 2025 → FY2026

All gift totals and lapsed donor calculations are based on fiscal year boundaries.

---

## Limitations

### Not Yet Implemented

- **Portfolios**: Database schema not yet created
- **Events**: Database schema not yet created
- **Relationships**: Database schema not yet created
- **Sentiment Analysis**: Not computed from interaction content
- **ML-Based Propensity**: Currently randomly generated
- **Task Status**: Always 'open', not persisted
- **Officer Assignment**: Not supported

### Future Enhancements

See [Data Model Documentation](./data-model.md#limitations-and-future-enhancements) for planned improvements.

---

## Related Documentation

- [Data Model](./data-model.md) - Complete entity definitions and relationships
- [CRM Unified](../../crm-unified/README.md) - Underlying database service
- [CRM Unified Context](../../crm-unified/context.md) - When to use CRM Unified

---

## Update Triggers

This documentation must be updated when:

- New features are added to CRM Mock
- Data model changes
- API contracts change
- Architecture changes
- Limitations are resolved



