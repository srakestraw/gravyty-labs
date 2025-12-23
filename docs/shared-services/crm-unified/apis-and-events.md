# CRM Unified - APIs and Events

**Purpose**: Complete API reference and event schemas.

**Audience**: Engineers

**Last Updated**: 2025-12-22

---

## CRM Context

```typescript
interface CRMContext {
  workspace: string;  // e.g., 'admissions', 'advancement'
  app: string;        // e.g., 'student-lifecycle', 'pipeline'
  userId?: string;    // Current user ID for user-specific filtering
}
```

---

## Contacts

### listContacts(ctx: CRMContext): Promise<Contact[]>
- Returns contacts filtered by workspace/app context
- Supports optional userId filtering

### getContact(ctx: CRMContext, id: string): Promise<Contact | null>
- Returns single contact by ID
- Filtered by context

### createContact(ctx: CRMContext, data: ContactInput): Promise<Contact>
- Creates a new contact
- Returns created contact with generated ID

### updateContact(ctx: CRMContext, id: string, data: ContactInput): Promise<Contact>
- Updates existing contact
- Returns updated contact

### deleteContact(ctx: CRMContext, id: string): Promise<void>
- Deletes contact by ID
- Cascades to related records if applicable

### Types
```typescript
interface Contact {
  id: string;
  name: string;
  type: 'person' | 'organization';
  email?: string;
  phone?: string;
  workspace: string;
  app: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Accounts

### listAccounts(ctx: CRMContext): Promise<Account[]>
- Returns accounts filtered by workspace/app context

### getAccount(ctx: CRMContext, id: string): Promise<Account | null>
- Returns single account by ID

### createAccount(ctx: CRMContext, data: AccountInput): Promise<Account>
- Creates a new account

### updateAccount(ctx: CRMContext, id: string, data: AccountInput): Promise<Account>
- Updates existing account

### Types
```typescript
interface Account {
  id: string;
  name: string;
  type: string;
  workspace: string;
  app: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Opportunities

### listOpportunities(ctx: CRMContext): Promise<Opportunity[]>
- Returns opportunities filtered by workspace/app context

### getOpportunity(ctx: CRMContext, id: string): Promise<Opportunity | null>
- Returns single opportunity by ID

### createOpportunity(ctx: CRMContext, data: OpportunityInput): Promise<Opportunity>
- Creates a new opportunity

### updateOpportunity(ctx: CRMContext, id: string, data: OpportunityInput): Promise<Opportunity>
- Updates existing opportunity

### Types
```typescript
interface Opportunity {
  id: string;
  name: string;
  stage: string;
  status: 'open' | 'won' | 'lost' | 'closed';
  contactId?: string;
  accountId?: string;
  amount?: number;
  workspace: string;
  app: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Activities

### listActivities(ctx: CRMContext, contactId?: string): Promise<Activity[]>
- Returns activities, optionally filtered by contact

### createActivity(ctx: CRMContext, data: ActivityInput): Promise<Activity>
- Creates a new activity record

### Types
```typescript
interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  subject: string;
  contactId?: string;
  accountId?: string;
  opportunityId?: string;
  workspace: string;
  app: string;
  createdAt: string;
}
```

---

## Data Simulation

### seedData(ctx: CRMContext, options: SeedOptions): Promise<void>
- Seeds mock CRM data for testing/demos
- Options include count, date ranges, etc.

### simulateActivity(ctx: CRMContext, options: SimulateOptions): Promise<void>
- Simulates CRM activity over time
- Generates realistic activity patterns

---

## Update Triggers

This doc must be updated when:
- API methods change
- Types change
- New methods are added
- Event schemas change

