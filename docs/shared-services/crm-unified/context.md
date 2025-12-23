# CRM Unified - Context

**Purpose**: When to use this service, alternatives, and integration patterns.

**Audience**: Engineers

**Last Updated**: 2025-12-22

---

## When to Use

Use CRM Unified for:
- Testing CRM integration patterns without external dependencies
- Demos and training scenarios requiring CRM-like data
- AI training workflows that need CRM data structures
- Development environments where external CRM access is unavailable
- Simulating CRM behavior for testing purposes

## When NOT to Use

Do NOT use CRM Unified for:
- Production integrations with real CRM systems (use dedicated integration services)
- Real-time CRM data synchronization (use actual CRM APIs)
- Production contact management (use real CRM systems)
- External customer-facing CRM functionality

---

## Alternatives

### Real CRM Integrations
- **Salesforce**: Use Salesforce API integration for production Salesforce data
- **Blackbaud**: Use Blackbaud API integration for production Blackbaud data
- **Other CRMs**: Use dedicated integration services for production CRM access

### Data Provider Service
- Use Data Provider for unified data access patterns
- CRM Unified may use Data Provider internally for data access abstraction

### Direct Database Access
- Only for internal CRM Unified implementation
- Not for domain code or external consumers

---

## Integration Patterns

### In Components
```typescript
import { crmClient } from '@/lib/crm-unified';

const contacts = await crmClient.listContacts({
  workspace: 'admissions',
  app: 'student-lifecycle',
});
```

### In API Routes
```typescript
import { crmClient } from '@/lib/crm-unified';

export async function GET(request: NextRequest) {
  const opportunities = await crmClient.listOpportunities({
    workspace: 'admissions',
    app: 'student-lifecycle',
  });
  return NextResponse.json(opportunities);
}
```

### In Domain Code
```typescript
// Domain code should use CRM Unified through Data Provider when possible
// Direct CRM Unified access is acceptable for CRM-specific operations
const contact = await crmClient.getContact(ctx, contactId);
```

---

## Consumer Domains

CRM Unified is used by:
- **Admissions**: Contact management for prospective students
- **Advancement**: Donor and prospect management
- **AI Assistants**: Training data and simulation scenarios
- **Testing**: Test scenarios requiring CRM functionality

---

## Update Triggers

This doc must be updated when:
- Use cases change
- Alternatives are added
- Integration patterns evolve
- New consumer domains are added

