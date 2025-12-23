# Admissions - Runbooks

**Purpose**: Operational procedures, failure modes, and troubleshooting.

**Audience**: Engineers, DevOps, Support

**Last Updated**: 2025-12-20

---

## Failure Modes

### Queue Not Loading
- **Symptoms**: Queue shows loading state indefinitely
- **Check**: Data Provider connection, network status
- **Resolution**: Check provider logs, verify data source

### Program Match Failing
- **Symptoms**: Quiz submission fails, no recommendations
- **Check**: Data Provider connection, quiz data validation
- **Resolution**: Check provider logs, verify data format

---

## Troubleshooting Steps

1. Check browser console for errors
2. Verify Data Provider is configured correctly
3. Check network requests in DevTools
4. Review provider logs (if applicable)

---

## Recovery Procedures

### Queue Recovery
1. Refresh page
2. Clear browser cache if needed
3. Check Data Provider status

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
- On-call contacts change


