# Data Provider - Context

**Purpose**: When to use this service, alternatives, and integration patterns.

**Audience**: Engineers

**Last Updated**: 2025-12-20

---

## When to Use

Use Data Provider for:
- All data access in domain code
- Context-based filtering (workspace, app, mode, user)
- Abstraction over data sources (mock, HTTP, MCP)

## When NOT to Use

Do NOT use Data Provider for:
- Direct database access (use packages/db)
- External API calls (use dedicated service)
- File system access (use Node.js APIs)

---

## Alternatives

- **Direct API calls**: Not recommended, breaks abstraction
- **Direct database access**: Only for packages/db internal use
- **Mock data imports**: Forbidden, use Data Provider with mock mode

---

## Integration Patterns

### In Components
```typescript
const items = await dataClient.listQueueItems({ workspace, app, mode, userId });
```

### In API Routes
```typescript
const contacts = await dataClient.listContacts({ workspace });
```

---

## Update Triggers

This doc must be updated when:
- Use cases change
- Alternatives are added
- Integration patterns evolve


