# CRM Unified - Runbooks

**Purpose**: Operational procedures, failure modes, and troubleshooting.

**Audience**: Engineers, DevOps, Support

**Last Updated**: 2025-12-22

---

## Failure Modes

### Service Not Initialized
- **Symptoms**: `crmClient` is undefined or throws
- **Check**: Service creation in `lib/crm-unified/index.ts`
- **Resolution**: Verify service implementation exists

### Data Not Filtered Correctly
- **Symptoms**: Data from wrong workspace/app shown
- **Check**: CRMContext passed correctly
- **Resolution**: Verify context values match expected format

### Database Provider Not Returning Data
- **Symptoms**: Empty arrays returned
- **Check**: Database connection, migrations run, data seeded
- **Resolution**: Verify database is accessible, run migrations, seed data if needed

### Contact Creation Fails
- **Symptoms**: createContact throws error
- **Check**: Required fields provided, context valid
- **Resolution**: Verify input data matches ContactInput schema

---

## Troubleshooting Steps

1. Check service initialization: Verify `crmClient` is properly exported
2. Verify CRMContext values: workspace and app must be provided
3. Check database connection: Verify DATABASE_URL is set and database is accessible
4. Verify migrations: Ensure Prisma migrations have been run
5. Check browser console for errors
6. Review database provider implementation logs
7. Verify data exists in database or seed data if needed

---

## Data Seeding

### Initial Seed
```typescript
import { crmClient } from '@/lib/crm-unified';

await crmClient.seedData({
  workspace: 'admissions',
  app: 'student-lifecycle',
}, {
  contactCount: 100,
  accountCount: 20,
  opportunityCount: 50,
});
```

### Verify Seed
- Check contact count matches expected
- Verify relationships are created
- Confirm data is scoped to correct workspace/app

---

## Recovery Procedures

### Service Recovery
1. Verify service implementation exists
2. Check context values are valid
3. Restart application if needed

### Data Recovery
1. Re-seed data if database data is corrupted: `npm run db:seed:crm`
2. Verify database connection and migrations
3. Check database permissions and access
4. Verify Prisma client is generated: `npm run db:generate`

---

## Common Operations

### Bulk Contact Import
- Use seedData with large contactCount
- Verify workspace/app context is set
- Check for memory limits with very large datasets

### Activity Simulation
- Use simulateActivity for time-based simulation
- Set appropriate date ranges
- Monitor performance with large simulations

---

## On-Call Contacts

- **Engineering**: See team Slack channel
- **Escalation**: Engineering lead

---

## Update Triggers

This doc must be updated when:
- New failure modes are discovered
- Troubleshooting steps change
- Recovery procedures evolve
- Common operations change

