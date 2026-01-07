# CRM Mock - Data Model

**Purpose**: Complete documentation of the CRM Mock data model, entities, relationships, and data transformations.

**Audience**: Engineers, Product Managers, Data Analysts

**Last Updated**: 2025-01-27

---

## Overview

CRM Mock is an Advancement-only CRM demo application that provides a realistic data model for testing, demos, and AI training. The data model is built on top of CRM Unified (database-backed) and extends it with Advancement-specific concepts like gifts, portfolios, fiscal years, and donor analytics.

### Key Characteristics

- **Advancement-focused**: No admissions or student lifecycle concepts
- **Database-backed**: Uses CRM Unified as the underlying data store
- **Fiscal year aware**: All giving data is organized by fiscal year (July 1 - June 30)
- **Computed fields**: Includes rollups, analytics, and derived metrics
- **Context-scoped**: All data is filtered by `workspace: 'advancement'` and `app: 'crm-mock'`

---

## Data Model Architecture

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

### Data Flow

1. **UI Components** call `crmMockProvider` methods
2. **Adapter** translates CRM Mock types to API calls
3. **API Routes** query CRM Unified with `workspace: 'advancement'`, `app: 'crm-mock'`
4. **CRM Unified** queries database and returns base entities
5. **Adapter** transforms CRM Unified entities to CRM Mock entities with computed fields

---

## Core Entities

### Constituent

A person or organization that can give gifts, participate in events, and be assigned to portfolios.

```typescript
interface Constituent {
  id: string;                    // UUID
  name: string;                   // Full name or organization name
  email?: string;                // Email address
  phone?: string;                 // Phone number
  type: 'person' | 'organization'; // Entity type
  propensity: number;             // 0-100 score (computed, not in DB)
  createdAt: string;              // ISO date string
  updatedAt: string;              // ISO date string
}
```

**Source**: `CrmConstituent` table in CRM Unified

**Computed Fields**:
- `propensity`: Currently randomly generated (0-100). Future: ML-based prediction.

**Relationships**:
- Has many `Gift` (via `CrmOpportunity` with `status='won'`)
- Has many `Interaction`
- Has many `Task` (via `Interaction` with `type='task'`)
- Belongs to many `Portfolio` (via `PortfolioMember`)
- Has many `EventParticipation`
- Has many `Relationship`

---

### ConstituentDetail

Extended constituent with rollup metrics for detail views.

```typescript
interface ConstituentDetail extends Constituent {
  lastGift?: {
    date: string;
    amount: number;
  };
  currentFyTotal: number;         // Total giving in current fiscal year
  priorFyTotal: number;           // Total giving in prior fiscal year
  lastInteraction?: {
    date: string;
    type: string;
    subject: string;
  };
  sentimentTrend?: 'improving' | 'stable' | 'declining'; // Future: computed from interactions
}
```

**Computed Fields**:
- `lastGift`: Most recent gift (won opportunity) sorted by date
- `currentFyTotal`: Sum of all gifts in current fiscal year
- `priorFyTotal`: Sum of all gifts in prior fiscal year
- `lastInteraction`: Most recent interaction sorted by date
- `sentimentTrend`: Future field for sentiment analysis over time

**Calculation**:
- Fiscal year runs July 1 - June 30
- Current FY: If current month >= July, FY is `currentYear + 1`, else `currentYear`
- Example: January 2025 → FY2025, August 2025 → FY2026

---

### Gift

A completed donation (won opportunity). Gifts are the primary measure of constituent giving.

```typescript
interface Gift {
  id: string;                     // UUID (from Opportunity)
  constituentId: string;          // Constituent who gave
  amount: number;                 // Gift amount in dollars
  date: string;                   // ISO date string (from Opportunity.createdAt)
  fiscalYear: string;             // e.g., 'FY2024' (computed)
  fund?: string;                  // Future: designated fund
  createdAt: string;              // ISO date string
}
```

**Source**: `CrmOpportunity` table where `status='won'`

**Transformation**:
```typescript
function opportunityToGift(opp: Opportunity): Gift {
  const date = new Date(opp.createdAt);
  const fiscalYear = getFiscalYear(date); // July 1 - June 30
  
  return {
    id: opp.id,
    constituentId: opp.constituentId || '',
    amount: opp.amount || 0,
    date: opp.createdAt,
    fiscalYear,
    fund: undefined, // Not in schema yet
    createdAt: opp.createdAt,
  };
}
```

**Relationships**:
- Belongs to one `Constituent` (via `constituentId`)

---

### Portfolio

A collection of constituents assigned to a gift officer for relationship management.

```typescript
interface Portfolio {
  id: string;                     // UUID
  name: string;                   // Portfolio name
  officerId?: string;            // Gift officer ID (future)
  officerName?: string;           // Gift officer name (future)
  description?: string;           // Portfolio description
  createdAt: string;              // ISO date string
}
```

**Status**: Not yet implemented in database. Currently returns empty arrays.

**Future Implementation**:
- Will be stored in a new `CrmPortfolio` table
- Will support officer assignment and member management

**Relationships**:
- Has many `PortfolioMember`
- Belongs to one `Officer` (future)

---

### PortfolioMember

Links a constituent to a portfolio.

```typescript
interface PortfolioMember {
  id: string;                     // UUID
  portfolioId: string;            // Portfolio ID
  constituentId: string;          // Constituent ID
  assignedAt: string;            // ISO date string
}
```

**Status**: Not yet implemented in database.

**Relationships**:
- Belongs to one `Portfolio`
- Belongs to one `Constituent`

---

### Interaction

A record of communication or engagement with a constituent.

```typescript
interface Interaction {
  id: string;                     // UUID
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  subject: string;                // Interaction subject/title
  constituentId?: string;         // Related constituent
  sentiment?: 'positive' | 'neutral' | 'negative'; // Future: AI-computed
  sentimentScore?: number;        // Future: -1 to 1 score
  createdAt: string;              // ISO date string
}
```

**Source**: `CrmInteraction` table in CRM Unified

**Transformation**:
```typescript
function toInteraction(interaction: CrmInteraction): Interaction {
  return {
    id: interaction.id,
    type: interaction.type,
    subject: interaction.subject,
    constituentId: interaction.constituentId,
    sentiment: undefined, // Not in DB yet
    sentimentScore: undefined,
    createdAt: interaction.createdAt,
  };
}
```

**Future Enhancements**:
- Sentiment analysis from interaction content
- Sentiment score (-1 to 1) for quantitative analysis
- Link to opportunities for context

**Relationships**:
- Belongs to one `Constituent` (optional)
- Belongs to one `Organization` (optional, future)
- Belongs to one `Opportunity` (optional, future)

---

### Task

A special type of interaction representing a to-do item for gift officers.

```typescript
interface Task {
  id: string;                     // UUID (from Interaction)
  type: 'task';                   // Always 'task'
  subject: string;                // Task description
  constituentId?: string;         // Related constituent
  officerId?: string;             // Assigned officer (future)
  dueDate?: string;               // Due date (future)
  status: 'open' | 'completed' | 'cancelled'; // Future: from DB
  createdAt: string;              // ISO date string
}
```

**Source**: `CrmInteraction` table where `type='task'`

**Transformation**:
```typescript
const tasks = interactions
  .filter(i => i.type === 'task')
  .map(i => ({
    id: i.id,
    type: 'task' as const,
    subject: i.subject,
    constituentId: i.constituentId,
    officerId: undefined, // Not in DB yet
    dueDate: undefined,  // Not in DB yet
    status: 'open' as const, // Not in DB yet
    createdAt: i.createdAt,
  }));
```

**Relationships**:
- Belongs to one `Constituent` (optional)
- Belongs to one `Officer` (future)

---

### Event

A fundraising or engagement event (reception, dinner, webinar, etc.).

```typescript
interface Event {
  id: string;                     // UUID
  name: string;                   // Event name
  date: string;                   // ISO date string
  type: 'reception' | 'dinner' | 'webinar' | 'volunteer' | 'other';
  location?: string;              // Event location
  createdAt: string;              // ISO date string
}
```

**Status**: Not yet implemented in database. Currently mock data only.

**Future Implementation**:
- Will be stored in a new `CrmEvent` table
- Will support event registration and attendance tracking

**Relationships**:
- Has many `EventParticipation`

---

### EventParticipation

Links a constituent to an event with registration/attendance status.

```typescript
interface EventParticipation {
  id: string;                     // UUID
  eventId: string;                // Event ID
  constituentId: string;          // Constituent ID
  status: 'registered' | 'attended' | 'cancelled' | 'no-show';
  registeredAt: string;           // ISO date string
}
```

**Status**: Not yet implemented in database.

**Relationships**:
- Belongs to one `Event`
- Belongs to one `Constituent`

---

### Organization

A household, corporation, foundation, or nonprofit organization.

```typescript
interface Organization {
  id: string;                     // UUID
  name: string;                   // Organization name
  type: 'household' | 'corporation' | 'foundation' | 'nonprofit';
  createdAt: string;              // ISO date string
}
```

**Source**: `CrmOrganization` table in CRM Unified

**Relationships**:
- Has many `Relationship` (links to constituents)
- Can have `Opportunity` (future: organization-level giving)

---

### Relationship

Links constituents to other constituents or organizations (spouse, parent, board member, etc.).

```typescript
interface Relationship {
  id: string;                     // UUID
  constituentId: string;          // Primary constituent
  relatedConstituentId?: string;  // Related constituent (if person-to-person)
  organizationId?: string;        // Related organization (if person-to-org)
  type: 'spouse' | 'parent' | 'child' | 'sibling' | 'colleague' | 
        'board_member' | 'employee' | 'other';
  createdAt: string;              // ISO date string
}
```

**Status**: Not yet implemented in database. Currently returns empty arrays.

**Future Implementation**:
- Will be stored in a new `CrmRelationship` table
- Will support bidirectional relationships
- Will enable household giving aggregation

---

### LapsedDonor

A computed entity representing donors who gave in the prior fiscal year but not in the current fiscal year.

```typescript
interface LapsedDonor {
  constituentId: string;          // Constituent ID
  name: string;                   // Constituent name
  email?: string;                 // Constituent email
  priorFyTotal: number;           // Total giving in prior FY
  lastGiftDate: string;          // Date of last gift
  lastGiftAmount: number;        // Amount of last gift
  propensity: number;             // 0-100 score (future: ML-based)
  lastTouchDate?: string;        // Date of last interaction
  lastTouchType?: string;         // Type of last interaction
  sentiment?: 'positive' | 'neutral' | 'negative'; // Future: from interactions
}
```

**Computation Logic**:

1. **Identify Prior FY Donors**:
   ```typescript
   const priorFyGifts = opportunities.filter(
     o => o.status === 'won' && 
          getFiscalYear(new Date(o.createdAt)) === priorFy
   );
   const priorFyDonorIds = new Set(
     priorFyGifts.map(g => g.constituentId).filter(Boolean)
   );
   ```

2. **Identify Current FY Donors**:
   ```typescript
   const currentFyGifts = opportunities.filter(
     o => o.status === 'won' && 
          getFiscalYear(new Date(o.createdAt)) === currentFy
   );
   const currentFyDonorIds = new Set(
     currentFyGifts.map(g => g.constituentId).filter(Boolean)
   );
   ```

3. **Find Lapsed Donors**:
   ```typescript
   const lapsedDonorIds = Array.from(priorFyDonorIds)
     .filter(id => !currentFyDonorIds.has(id));
   ```

4. **Build Records**:
   - Aggregate prior FY gifts for each lapsed donor
   - Find last gift date and amount
   - Find last interaction (if any)
   - Compute propensity (currently random, future: ML-based)

**Use Case**: Lapsed Donors report identifies re-engagement opportunities.

---

## Data Transformations

### CRM Unified → CRM Mock

CRM Mock extends CRM Unified with Advancement-specific concepts:

| CRM Unified | CRM Mock | Transformation |
|------------|----------|----------------|
| `CrmConstituent` | `Constituent` | Add `propensity` (computed) |
| `CrmOpportunity` (status='won') | `Gift` | Add `fiscalYear`, `fund` (future) |
| `CrmInteraction` | `Interaction` | Add `sentiment`, `sentimentScore` (future) |
| `CrmInteraction` (type='task') | `Task` | Add `officerId`, `dueDate`, `status` (future) |
| `CrmOrganization` | `Organization` | Direct mapping |
| N/A | `Portfolio` | Not yet in DB |
| N/A | `Event` | Not yet in DB |
| N/A | `Relationship` | Not yet in DB |
| Computed | `LapsedDonor` | Computed from gifts and interactions |

### Fiscal Year Calculation

Fiscal year runs July 1 - June 30:

```typescript
function getFiscalYear(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const fyYear = month >= 7 ? year + 1 : year;
  return `FY${fyYear}`;
}
```

**Examples**:
- January 15, 2025 → `FY2025`
- July 15, 2025 → `FY2026`
- June 30, 2025 → `FY2025`
- July 1, 2025 → `FY2026`

---

## Computed Fields and Rollups

### Constituent Rollups

When fetching a constituent detail (`getConstituent`), the following rollups are computed:

1. **Last Gift**:
   - Most recent gift (won opportunity) sorted by `createdAt` DESC
   - Returns `{ date, amount }` or `undefined`

2. **Current FY Total**:
   - Sum of all gifts where `fiscalYear === currentFy`
   - Returns `number`

3. **Prior FY Total**:
   - Sum of all gifts where `fiscalYear === priorFy`
   - Returns `number`

4. **Last Interaction**:
   - Most recent interaction sorted by `createdAt` DESC
   - Returns `{ date, type, subject }` or `undefined`

5. **Sentiment Trend** (Future):
   - Analysis of interaction sentiment over time
   - Returns `'improving' | 'stable' | 'declining'` or `undefined`

### Lapsed Donor Computation

See [LapsedDonor](#lapseddonor) section for computation logic.

---

## Context and Filtering

### CRM Context

All CRM Mock data is scoped to:

```typescript
const CRM_MOCK_CTX = {
  workspace: 'advancement',
  app: 'crm-mock',
} as const;
```

**Database Filtering**:
- All queries include `WHERE workspace = 'advancement' AND app = 'crm-mock'`
- Ensures data isolation from other applications (e.g., `app: 'pipeline'`)

### Filtering Options

**Constituent Filters**:
```typescript
interface ConstituentFilters {
  propensityMin?: number;        // Minimum propensity score (0-100)
  propensityMax?: number;        // Maximum propensity score (0-100)
  lastGiftDays?: number;        // Last gift within X days
  sentiment?: 'positive' | 'neutral' | 'negative';
  eventAttendanceDays?: number;  // Attended event within X days
}
```

**Paging Options**:
```typescript
interface PagingOptions {
  page?: number;                 // 1-based page number
  pageSize?: number;             // Items per page (default: 50)
}
```

**Sort Options**:
```typescript
interface SortOptions {
  field: 'name' | 'propensity' | 'lastGift' | 'fyGiving' | 
         'lastTouch' | 'sentiment';
  direction: 'asc' | 'desc';
}
```

---

## Entity Relationships

```
Constituent
├── has many Gift (via Opportunity status='won')
├── has many Interaction
├── has many Task (via Interaction type='task')
├── belongs to many Portfolio (via PortfolioMember)
├── has many EventParticipation
└── has many Relationship

Gift
└── belongs to Constituent

Portfolio
├── has many PortfolioMember
└── belongs to Officer (future)

PortfolioMember
├── belongs to Portfolio
└── belongs to Constituent

Interaction
├── belongs to Constituent (optional)
├── belongs to Organization (optional, future)
└── belongs to Opportunity (optional, future)

Task (extends Interaction)
├── belongs to Constituent (optional)
└── belongs to Officer (future)

Event
└── has many EventParticipation

EventParticipation
├── belongs to Event
└── belongs to Constituent

Organization
├── has many Relationship
└── has many Opportunity (future)

Relationship
├── belongs to Constituent
├── belongs to Constituent (related, optional)
└── belongs to Organization (optional)
```

---

## Data Seeding

### Seed Requirements

CRM Mock seed data should include:

- **300+ constituents** (mix of persons and organizations)
- **30 organizations** (households, corporations, foundations, nonprofits)
- **2,000 gifts** (won opportunities spanning 2 fiscal years)
- **1,500 interactions** (calls, emails, meetings, notes, tasks)
- **1,000 tasks** (subset of interactions)
- **25 events** (receptions, dinners, webinars, etc.)
- **Event participations** (constituents attending events)
- **Sentiment signals** (for >= 30% of interactions, future)
- **Propensity scores** (per constituent, future: ML-based)

### Fiscal Year Distribution

- **Current FY**: Gifts from July 1 of current calendar year to now
- **Prior FY**: Gifts from July 1 of prior calendar year to June 30 of current calendar year
- **2-year span**: Ensures realistic lapsed donor analysis

### Seeding via API

```typescript
// POST /api/crm-mock/admin/seed
await crmClient.seedData({
  workspace: 'advancement',
  app: 'crm-mock',
}, {
  constituentCount: 300,
  organizationCount: 30,
  opportunityCount: 2000,
  interactionCount: 1500,
});
```

---

## Limitations and Future Enhancements

### Current Limitations

1. **Portfolios**: Not yet in database schema
2. **Events**: Not yet in database schema
3. **Relationships**: Not yet in database schema
4. **Sentiment**: Not computed from interaction content
5. **Propensity**: Randomly generated, not ML-based
6. **Task Status**: Always 'open', not persisted
7. **Officer Assignment**: Not supported for portfolios or tasks
8. **Fund Designation**: Not supported for gifts

### Planned Enhancements

1. **Database Schema**:
   - Add `CrmPortfolio` table
   - Add `CrmPortfolioMember` table
   - Add `CrmEvent` table
   - Add `CrmEventParticipation` table
   - Add `CrmRelationship` table
   - Add `sentiment` and `sentimentScore` fields to `CrmInteraction`
   - Add `propensity` field to `CrmConstituent`
   - Add `status` and `dueDate` fields to `CrmInteraction` (for tasks)
   - Add `fund` field to `CrmOpportunity`

2. **Computed Fields**:
   - ML-based propensity scoring
   - Sentiment analysis from interaction content
   - Sentiment trend calculation
   - Household giving aggregation

3. **Advanced Features**:
   - Officer assignment and workload management
   - Fund designation and reporting
   - Event registration and attendance tracking
   - Relationship mapping and household views

---

## Data Access Patterns

### Client-Side (UI Components)

```typescript
import { crmMockProvider } from '@/lib/crm-mock';

// List constituents with filters
const constituents = await crmMockProvider.listConstituents(
  {},
  {
    filters: { propensityMin: 50 },
    paging: { page: 1, pageSize: 50 },
    sort: { field: 'propensity', direction: 'desc' },
  }
);

// Get constituent with rollups
const constituent = await crmMockProvider.getConstituent({}, id);

// List gifts for constituent
const gifts = await crmMockProvider.listGifts({}, constituentId);

// Get lapsed donors
const lapsedDonors = await crmMockProvider.getLapsedDonors({}, {
  currentFyStart: '2024-07-01',
  currentFyEnd: '2025-06-30',
});
```

### Server-Side (API Routes)

API routes handle database access and return JSON:

- `GET /api/crm-mock/constituents` - List constituents
- `GET /api/crm-mock/constituents?id={id}` - Get single constituent
- `GET /api/crm-mock/opportunities?status=won` - List gifts
- `GET /api/crm-mock/interactions` - List interactions
- `GET /api/crm-mock/lapsed-donors` - Get lapsed donors report
- `POST /api/crm-mock/admin/seed` - Seed data
- `POST /api/crm-mock/admin/reset` - Reset data

---

## Update Triggers

This document must be updated when:

- New entities are added to the data model
- Entity fields change or are added
- Computed field logic changes
- Relationships between entities change
- Database schema changes
- Data transformation logic changes
- Fiscal year calculation changes
- Filtering or sorting options change

---

## Related Documentation

- [CRM Unified Data Model](../../crm-unified/architecture.md) - Underlying database schema
- [CRM Mock API Reference](./apis-and-events.md) - API methods and contracts (future)
- [CRM Mock Architecture](./architecture.md) - System architecture (future)
- [CRM Unified Context](../../crm-unified/context.md) - When to use CRM Unified



