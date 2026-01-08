# Activity Tracker - Brief

**Purpose**: Comprehensive overview of the Activity Tracker feature in CRM Mock, including product requirements and technical implementation details.

**Audience**: Product Managers, Engineers, Designers

**Last Updated**: 2025-01-27

---

## Product Overview

The Activity Tracker is a core feature of CRM Mock that records and displays all constituent engagement activities across the Advancement CRM system. It provides gift officers with a complete audit trail of interactions, enabling better relationship management, outreach planning, and donor stewardship.

### Business Value

- **Complete Activity History**: Track all touchpoints with constituents (calls, emails, meetings, notes, tasks)
- **Engagement Insights**: Understand constituent engagement patterns and sentiment trends
- **Accountability**: Maintain records of all outreach activities for reporting and compliance
- **Relationship Context**: View interaction history when making cultivation decisions
- **Performance Tracking**: Monitor outreach activity levels and engagement effectiveness

### Key Use Cases

1. **Gift Officer Workflow**: Log interactions after constituent touchpoints
2. **Constituent Research**: Review activity history before meetings or calls
3. **Portfolio Management**: Track engagement across assigned constituents
4. **Reporting**: Generate outreach activity reports for leadership
5. **Sentiment Analysis**: Monitor relationship health through interaction sentiment

---

## Features

### Activity Types

The Activity Tracker supports five types of interactions:

1. **Call**: Phone conversations with constituents
2. **Email**: Email communications sent or received
3. **Meeting**: In-person or virtual meetings
4. **Note**: General notes or observations
5. **Task**: Action items and follow-ups

### Core Capabilities

#### Activity Logging
- Create new activity records with type, subject, and associated constituent
- Link activities to opportunities, organizations, or constituents
- Automatic timestamp tracking
- Optional sentiment tagging (positive, neutral, negative)

#### Activity Viewing
- **Constituent-Level**: View all activities for a specific constituent
- **Global View**: Browse all activities across the CRM (future)
- **Filtering**: Filter by activity type, date range, or constituent
- **Sorting**: Chronological ordering (newest first)

#### Sentiment Tracking
- Sentiment labels: `positive`, `neutral`, `negative`
- Sentiment scores: Numeric values (-1 to 1) for trend analysis
- Sentiment trends: Computed trends (improving, stable, declining) based on recent vs. older interactions

#### Activity Analytics
- Last interaction date and type per constituent
- Interaction counts and frequency
- Sentiment trend analysis
- Activity type distribution

---

## Technical Architecture

### System Architecture

```
UI Components (Activity Tracker)
    ↓
CRM Mock Provider (lib/crm-mock)
    ↓
CRM Mock Adapter (lib/crm-mock/adapter.ts)
    ↓
Next.js API Routes (app/api/crm-mock/interactions)
    ↓
CRM Unified Client (lib/crm-unified)
    ↓
Database Provider (lib/crm-unified/providers/dbProvider.ts)
    ↓
PostgreSQL Database (via Prisma ORM)
```

### Data Flow

1. **UI Layer**: Components call `crmMockProvider.listInteractions()` or `crmMockProvider.listInteractions(ctx, constituentId)`
2. **Provider Layer**: CRM Mock provider handles business logic and computed fields
3. **Adapter Layer**: Translates CRM Mock types to API calls
4. **API Layer**: Next.js API routes query CRM Unified with context filtering
5. **Data Layer**: CRM Unified queries PostgreSQL via Prisma
6. **Response**: Data flows back through layers with transformations applied

### Context Scoping

All activities are scoped to:
- `workspace: 'advancement'`
- `app: 'crm-mock'`

This ensures data isolation from other applications and workspaces.

---

## Data Model

### Database Schema

Activities are stored in the `crm_interactions` table:

```sql
CREATE TABLE "crm_interactions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "workspace" TEXT NOT NULL,
  "app" TEXT NOT NULL,
  "type" TEXT NOT NULL,              -- 'call' | 'email' | 'meeting' | 'note' | 'task'
  "subject" TEXT NOT NULL,
  "constituentId" TEXT,
  "organizationId" TEXT,
  "opportunityId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ON "crm_interactions" ("workspace", "app");
CREATE INDEX ON "crm_interactions" ("constituentId");
CREATE INDEX ON "crm_interactions" ("organizationId");
CREATE INDEX ON "crm_interactions" ("opportunityId");
```

### TypeScript Types

#### Base Interaction (CRM Unified)

```typescript
interface Interaction {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  subject: string;
  constituentId?: string;
  organizationId?: string;
  opportunityId?: string;
  workspace: string;
  app: string;
  createdAt: string;
}

interface InteractionInput {
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  subject: string;
  constituentId?: string;
  organizationId?: string;
  opportunityId?: string;
}
```

#### Extended Interaction (CRM Mock)

```typescript
interface Interaction {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  subject: string;
  constituentId?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentimentScore?: number;  // -1 to 1
  createdAt: string;
}
```

**Note**: Sentiment fields are computed/enriched in CRM Mock layer, not stored in database.

### Relationships

- **Constituent**: Many-to-one relationship (many interactions belong to one constituent)
- **Organization**: Many-to-one relationship (many interactions belong to one organization)
- **Opportunity**: Many-to-one relationship (many interactions belong to one opportunity)

### Computed Fields

CRM Mock extends base interactions with:

- **Sentiment**: Categorized sentiment (`positive`, `neutral`, `negative`)
- **Sentiment Score**: Numeric sentiment value (-1 to 1)
- **Last Interaction**: Most recent interaction per constituent (computed in `ConstituentDetail`)
- **Sentiment Trend**: Comparison of recent vs. older interaction sentiment

---

## API Reference

### Provider Methods

#### List Interactions

```typescript
listInteractions(ctx: CRMContext, constituentId?: string): Promise<Interaction[]>
```

**Parameters:**
- `ctx`: CRM context with `workspace: 'advancement'`, `app: 'crm-mock'`
- `constituentId` (optional): Filter interactions for specific constituent

**Returns:** Array of interactions, sorted by `createdAt` descending

**Example:**
```typescript
import { crmMockProvider } from '@/lib/crm-mock';

// All interactions
const allInteractions = await crmMockProvider.listInteractions({});

// Constituent-specific interactions
const constituentInteractions = await crmMockProvider.listInteractions({}, constituentId);
```

#### Create Interaction

```typescript
createInteraction(ctx: CRMContext, data: InteractionInput): Promise<Interaction>
```

**Parameters:**
- `ctx`: CRM context
- `data`: Interaction input with type, subject, and optional relationships

**Example:**
```typescript
const newInteraction = await crmMockProvider.createInteraction({}, {
  type: 'call',
  subject: 'Follow-up call about annual fund',
  constituentId: 'constituent-123',
});
```

### API Routes

#### GET `/api/crm-mock/interactions`

Returns all interactions for the CRM Mock workspace/app context.

**Query Parameters:**
- `constituentId` (optional): Filter by constituent ID
- `type` (optional): Filter by interaction type

**Response:**
```json
[
  {
    "id": "interaction-1",
    "type": "call",
    "subject": "Initial outreach call",
    "constituentId": "constituent-123",
    "sentiment": "positive",
    "sentimentScore": 0.75,
    "createdAt": "2025-01-15T10:30:00Z"
  }
]
```

#### POST `/api/crm-mock/interactions`

Creates a new interaction.

**Request Body:**
```json
{
  "type": "email",
  "subject": "Thank you for your donation",
  "constituentId": "constituent-123"
}
```

---

## UI Components

### Current Implementation

#### Constituent Detail Page - Engagement Tab

**Location:** `app/(shell)/crm-mock/constituents/[id]/page.tsx`

Displays recent interactions (last 10) with:
- Interaction type badge
- Subject line
- Sentiment indicator (if available)
- Timestamp

#### Constituent Detail Page - Outreach Tab

**Location:** `app/(shell)/crm-mock/constituents/[id]/page.tsx`

Shows complete interaction log with:
- All interactions for the constituent
- Type, subject, sentiment, and date
- Chronological ordering

#### Constituent Summary - Last Touch

**Location:** `app/(shell)/crm-mock/constituents/[id]/page.tsx` (Summary tab)

Displays:
- Last interaction date
- Last interaction type
- Last interaction subject

### Future Implementation

#### Interactions List Page

**Location:** `app/(shell)/crm-mock/interactions/page.tsx` (currently placeholder)

**Planned Features:**
- Global activity feed
- Filtering by type, date range, constituent
- Search functionality
- Bulk operations
- Export capabilities

#### Outreach Activity Report

**Location:** `app/(shell)/crm-mock/reports/outreach-activity/page.tsx` (currently placeholder)

**Planned Features:**
- Activity volume metrics
- Engagement trends over time
- Activity type distribution
- Sentiment analysis dashboard
- Gift officer activity comparison

---

## Integration Points

### With Other CRM Mock Features

1. **Constituents**: Activities are linked to constituents and displayed in constituent detail views
2. **Opportunities**: Activities can be associated with fundraising opportunities
3. **Tasks**: Tasks are a special type of interaction (`type: 'task'`)
4. **Reports**: Activity data feeds into outreach activity reports
5. **Analytics**: Interaction data contributes to sentiment trends and engagement metrics

### With CRM Unified

The Activity Tracker uses CRM Unified's `Interaction` model as its foundation:
- Base schema and storage via `CrmInteraction` table
- CRUD operations through CRM Unified provider
- Context-based filtering and isolation

---

## Data Seeding

### Seed Data Generation

When seeding CRM Mock data, interactions are generated with:
- **Count**: ~1,500 interactions for 300 constituents
- **Distribution**: Random assignment across constituents and opportunities
- **Types**: Mix of call, email, meeting, note, and task types
- **Timestamps**: Distributed over the last 2 years
- **Sentiment**: ~30% of interactions include sentiment data

### Seed Script

**Location:** `app/api/crm-mock/admin/seed/route.ts`

**Generation Logic:**
```typescript
const interactions: any[] = [];
for (let i = 0; i < 1500; i++) {
  const constituent = constituentRecords[i % constituentRecords.length];
  const opportunity = opportunities[i % opportunities.length];
  const createdAt = randomDate(twoYearsAgo, now);

  interactions.push({
    workspace: 'advancement',
    app: 'crm-mock',
    type: interactionTypes[i % interactionTypes.length],
    subject: `${interactionSubjects[i % interactionSubjects.length]} ${i + 1}`,
    constituentId: constituent.id,
    opportunityId: opportunity.id,
    createdAt,
  });
}
```

---

## Limitations & Future Enhancements

### Current Limitations

1. **Sentiment Analysis**: Sentiment is randomly generated, not computed from interaction content
2. **Global View**: Interactions list page is not yet implemented
3. **Activity Creation UI**: No UI for creating new interactions (API-only)
4. **Rich Content**: No support for attachments, email body, or call transcripts
5. **User Attribution**: No tracking of which user created the interaction
6. **Activity Templates**: No templates for common interaction types

### Planned Enhancements

1. **ML-Based Sentiment**: Compute sentiment from interaction content using NLP
2. **Activity Feed UI**: Full-featured interactions list page with filtering and search
3. **Activity Creation Form**: UI for gift officers to log interactions
4. **Email Integration**: Auto-create interactions from email sends
5. **Call Logging**: Integration with phone systems for automatic call logging
6. **Activity Templates**: Pre-defined templates for common interaction types
7. **Bulk Import**: Import activities from external systems
8. **Activity Analytics**: Advanced analytics and visualization dashboards

---

## Related Documentation

- [CRM Mock README](./README.md) - Main CRM Mock documentation
- [CRM Mock Data Model](./data-model.md) - Complete data model reference
- [CRM Unified README](../crm-unified/README.md) - Underlying CRM service
- [CRM Unified APIs](../crm-unified/apis-and-events.md) - API reference

---

## Update Triggers

This documentation must be updated when:

- New activity types are added
- Sentiment analysis implementation changes
- API contracts change
- UI components are added or modified
- Data model changes
- Integration points change

