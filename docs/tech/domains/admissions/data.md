# Admissions - Data Models

**Purpose**: Data structures, systems of record, and data ownership.

**Audience**: Engineers

**Last Updated**: 2025-12-20

---

## Data Models

### Queue Items
- **Type**: See `lib/agent-ops/types.ts`
- **System of Record**: Data Provider
- **Ownership**: Agent Ops service

### Contacts
- **Type**: See `lib/contacts/types.ts`
- **System of Record**: Data Provider
- **Ownership**: Contacts service

### Segments
- **Type**: See `lib/segments/types.ts`
- **System of Record**: Data Provider
- **Ownership**: Segments service

---

## Data Flow

```
Frontend → Data Provider → Provider (Mock/HTTP/MCP) → Data Source
```

---

## Migration Considerations

- Current: Mock provider
- Future: HTTP API or MCP provider
- No breaking changes expected in data models

---

## Update Triggers

This doc must be updated when:
- Data models change
- Systems of record change
- Data ownership changes
- Migration paths are needed


