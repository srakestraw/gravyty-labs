# CRM Unified Service - Usage Examples

## Basic CRUD Operations

### Constituents

```typescript
import { crmClient } from '@/lib/crm-unified';

// List all constituents
const constituents = await crmClient.listConstituents({
  workspace: 'advancement',
  app: 'pipeline',
});

// Get a specific constituent
const constituent = await crmClient.getConstituent({
  workspace: 'advancement',
  app: 'pipeline',
}, 'constituent-id-here');

// Create a new constituent
const newConstituent = await crmClient.createConstituent({
  workspace: 'advancement',
  app: 'pipeline',
}, {
  name: 'Jane Smith',
  type: 'person',
  email: 'jane.smith@example.com',
  phone: '555-1234',
});

// Update a constituent
const updatedConstituent = await crmClient.updateConstituent({
  workspace: 'advancement',
  app: 'pipeline',
}, newConstituent.id, {
  name: 'Jane Smith-Jones',
  type: 'person',
  email: 'jane.smith-jones@example.com',
  phone: '555-1234',
});

// Delete a constituent (cascades to related opportunities/interactions)
await crmClient.deleteConstituent({
  workspace: 'advancement',
  app: 'pipeline',
}, newConstituent.id);
```

### Organizations

```typescript
// List all organizations
const organizations = await crmClient.listOrganizations({
  workspace: 'advancement',
  app: 'pipeline',
});

// Create an organization
const organization = await crmClient.createOrganization({
  workspace: 'advancement',
  app: 'pipeline',
}, {
  name: 'Acme Foundation',
  type: 'foundation',
});

// Update an organization
const updatedOrganization = await crmClient.updateOrganization({
  workspace: 'advancement',
  app: 'pipeline',
}, organization.id, {
  name: 'Acme Foundation Inc.',
  type: 'foundation',
});
```

### Opportunities (Fundraising Asks)

```typescript
// List all opportunities
const opportunities = await crmClient.listOpportunities({
  workspace: 'advancement',
  app: 'pipeline',
});

// Create an opportunity linked to a constituent
const opportunity = await crmClient.createOpportunity({
  workspace: 'advancement',
  app: 'pipeline',
}, {
  name: 'Annual Fund Campaign Gift',
  stage: 'cultivation',
  status: 'open',
  constituentId: constituent.id,
  amount: 50000,
});

// Update opportunity stage
const updatedOpportunity = await crmClient.updateOpportunity({
  workspace: 'advancement',
  app: 'pipeline',
}, opportunity.id, {
  name: 'Annual Fund Campaign Gift',
  stage: 'solicitation',
  status: 'open',
  constituentId: constituent.id,
  amount: 50000,
});
```

### Interactions

```typescript
// List all interactions
const interactions = await crmClient.listInteractions({
  workspace: 'advancement',
  app: 'pipeline',
});

// List interactions for a specific constituent
const constituentInteractions = await crmClient.listInteractions({
  workspace: 'advancement',
  app: 'pipeline',
}, constituent.id);

// Create an interaction
const interaction = await crmClient.createInteraction({
  workspace: 'advancement',
  app: 'pipeline',
}, {
  type: 'call',
  subject: 'Follow-up call about annual fund',
  constituentId: constituent.id,
  opportunityId: opportunity.id,
});
```

## Data Simulation

### Seed Data

```typescript
// Seed mock CRM data
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

### Simulate Interaction

```typescript
// Generate time-based interaction simulation
await crmClient.simulateInteraction({
  workspace: 'advancement',
  app: 'pipeline',
}, {
  days: 7,        // Simulate interactions over last 7 days
  interactionCount: 20, // Generate 20 interactions
});
```

## Server Component Example

```typescript
// app/(shell)/crm/page.tsx
import { crmClient } from '@/lib/crm-unified';

export default async function CRMPage() {
  const constituents = await crmClient.listConstituents({
    workspace: 'advancement',
    app: 'pipeline',
  });

  const opportunities = await crmClient.listOpportunities({
    workspace: 'advancement',
    app: 'pipeline',
  });

  return (
    <div>
      <h1>CRM Dashboard</h1>
      <div>
        <h2>Constituents ({constituents.length})</h2>
        <ul>
          {constituents.map(constituent => (
            <li key={constituent.id}>{constituent.name} - {constituent.email}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Fundraising Asks ({opportunities.length})</h2>
        <ul>
          {opportunities.map(opp => (
            <li key={opp.id}>
              {opp.name} - {opp.stage} ({opp.status})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

## Client Component Example

```typescript
// components/crm/ConstituentList.tsx
'use client';

import { useState, useEffect } from 'react';
import { crmClient } from '@/lib/crm-unified';
import type { Constituent } from '@/lib/crm-unified';

export function ConstituentList({ workspace, app }: { workspace: string; app: string }) {
  const [constituents, setConstituents] = useState<Constituent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConstituents() {
      try {
        const data = await crmClient.listConstituents({ workspace, app });
        setConstituents(data);
      } catch (error) {
        console.error('Failed to load constituents:', error);
      } finally {
        setLoading(false);
      }
    }
    loadConstituents();
  }, [workspace, app]);

  if (loading) return <div>Loading constituents...</div>;

  return (
    <div>
      <h2>Constituents</h2>
      <ul>
        {constituents.map(constituent => (
          <li key={constituent.id}>
            {constituent.name} ({constituent.type})
            {constituent.email && <span> - {constituent.email}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Error Handling

```typescript
try {
  const constituent = await crmClient.getConstituent(
    { workspace: 'advancement', app: 'pipeline' },
    'invalid-id'
  );
  
  if (!constituent) {
    console.log('Constituent not found');
  }
} catch (error) {
  console.error('Error fetching constituent:', error);
}

try {
  // This will fail if constituent doesn't exist
  const opportunity = await crmClient.createOpportunity(
    { workspace: 'advancement', app: 'pipeline' },
    {
      name: 'Test Fundraising Ask',
      stage: 'prospecting',
      status: 'open',
      constituentId: 'non-existent-constituent-id',
    }
  );
} catch (error) {
  // Error: Constituent not found
  console.error('Failed to create opportunity:', error);
}
```
