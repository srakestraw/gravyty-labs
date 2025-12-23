# Data Provider - Runbooks

**Purpose**: Operational procedures, failure modes, and troubleshooting.

**Audience**: Engineers, DevOps, Support

**Last Updated**: 2025-12-20

---

## Failure Modes

### Provider Not Initialized
- **Symptoms**: `dataClient` is undefined or throws
- **Check**: Provider creation in `lib/data/index.ts`
- **Resolution**: Verify provider implementation exists

### Data Not Filtered Correctly
- **Symptoms**: Data from wrong workspace/app shown
- **Check**: DataContext passed correctly
- **Resolution**: Verify context values match expected format

### Mock Provider Not Returning Data
- **Symptoms**: Empty arrays returned
- **Check**: Mock data sources exist
- **Resolution**: Verify mock data files are present

---

## Troubleshooting Steps

1. Check provider mode: `process.env.NEXT_PUBLIC_DATA_PROVIDER`
2. Verify DataContext values
3. Check browser console for errors
4. Review provider implementation logs

---

## Recovery Procedures

### Provider Recovery
1. Verify environment variable is set
2. Check provider implementation exists
3. Restart application if needed

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


