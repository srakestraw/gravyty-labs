# CRM Unified Service

Mock Advancement CRM service for testing, demos, and AI training. Provides database-backed CRM functionality with Constituents, Organizations, Opportunities (Fundraising Asks), and Interactions.

## Quick Start

```typescript
import { crmClient } from '@/lib/crm-unified';

// List constituents
const constituents = await crmClient.listConstituents({
  workspace: 'advancement',
  app: 'pipeline',
});

// Create a constituent
const newConstituent = await crmClient.createConstituent({
  workspace: 'advancement',
  app: 'pipeline',
}, {
  name: 'John Doe',
  type: 'person',
  email: 'john.doe@example.com',
  phone: '555-1234',
});

// List opportunities (fundraising asks)
const opportunities = await crmClient.listOpportunities({
  workspace: 'advancement',
  app: 'pipeline',
});

// Create an interaction
const interaction = await crmClient.createInteraction({
  workspace: 'advancement',
  app: 'pipeline',
}, {
  type: 'call',
  subject: 'Follow-up call',
  constituentId: newConstituent.id,
});
```

## Seeding Data

To seed mock CRM data:

```bash
cd packages/db
npm run db:seed:crm
```

Or programmatically:

```typescript
await crmClient.seedData({
  workspace: 'advancement',
  app: 'pipeline',
}, {
  constituentCount: 50,
  organizationCount: 10,
  opportunityCount: 25,
  interactionCount: 100,
});
```

## API Reference

See [docs/shared-services/crm-unified/apis-and-events.md](../../docs/shared-services/crm-unified/apis-and-events.md) for complete API documentation.

## Database Setup

1. Run migration:
   ```bash
   cd packages/db
   npm run db:migrate
   ```

2. Generate Prisma client:
   ```bash
   cd packages/db
   npm run db:generate
   ```

3. Seed data:
   ```bash
   cd packages/db
   npm run db:seed:crm
   ```
