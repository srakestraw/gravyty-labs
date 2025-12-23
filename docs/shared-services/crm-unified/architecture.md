# CRM Unified - Architecture

**Purpose**: Technical architecture and implementation details.

**Audience**: Engineers

**Last Updated**: 2025-12-22

---

## Current State

### Service Architecture

```
CRM Client → CRM Service Interface → Database Provider
                                    ├── Contact Management
                                    ├── Account Management
                                    ├── Opportunity Tracking
                                    └── Data Simulation
                                    └── Prisma/PostgreSQL
```

### Location
- **API**: `lib/crm-unified/index.ts` (exports `crmClient`)
- **Service Interface**: `lib/crm-unified/types.ts`
- **Database Provider**: `lib/crm-unified/providers/dbProvider.ts`
- **Database Schema**: `packages/db/prisma/schema.prisma` (CrmContact, CrmAccount, CrmOpportunity, CrmActivity)
- **Seed Script**: `packages/db/prisma/seed-crm.ts`

---

## Component Boundaries

### CRM Client
- **Location**: `lib/crm-unified/index.ts`
- **Responsibilities**: Public API, service creation
- **Dependencies**: CRM provider implementations

### Service Interface
- **Location**: `lib/crm-unified/types.ts`
- **Responsibilities**: Type definitions, contracts
- **Dependencies**: None

### Database Provider
- **Location**: `lib/crm-unified/providers/dbProvider.ts`
- **Responsibilities**: Database-backed CRM data implementation using Prisma
- **Dependencies**: Prisma client, PostgreSQL database

### Database Schema
- **Location**: `packages/db/prisma/schema.prisma`
- **Responsibilities**: CrmContact, CrmAccount, CrmOpportunity, CrmActivity models
- **Dependencies**: Prisma ORM

---

## Data Flow

```
1. Domain Code Request
   └─> CRM Client API call
   └─> Service Interface validation
   └─> Database Provider execution

2. Database Provider
   └─> Prisma query with workspace/app filtering
   └─> PostgreSQL database query
   └─> Transform Prisma models to API types
   └─> Return results

3. Response
   └─> CRM Client formats response
   └─> Returns to domain code
```

---

## Integration Points

### Data Provider Service
- CRM Unified may integrate with Data Provider for unified data access
- Shared context filtering patterns
- Consistent API patterns

### Domain Applications
- Admissions domain for prospective student contacts
- Advancement domain for donor management
- AI Assistants for training data

---

## Future Considerations

- Real CRM provider implementations (Salesforce, Blackbaud)
- HTTP provider for external CRM integrations
- Real-time synchronization capabilities
- Advanced relationship mapping
- Bulk import/export capabilities
- Query optimization and caching

---

## Update Triggers

This doc must be updated when:
- Architecture changes
- New providers are added
- Component boundaries change
- Integration points evolve

