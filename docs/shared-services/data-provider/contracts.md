# Data Provider - Contracts

**Purpose**: Product-facing promises: SLOs, limits, guarantees.

**Audience**: Engineers, Product Managers

**Last Updated**: 2025-12-20

---

## Service Level Objectives (SLOs)

- **Availability**: 99.9% uptime (when using HTTP/MCP providers)
- **Latency**: < 200ms for list operations (mock provider)
- **Consistency**: Eventual consistency (when using HTTP/MCP providers)

---

## Rate Limits

- **Mock Provider**: No limits
- **HTTP Provider**: TBD (when implemented)
- **MCP Provider**: TBD (when implemented)

---

## Guarantees

### Data Filtering
- All data is filtered by provided DataContext
- User-specific filtering when userId is provided
- Workspace/app scoping is enforced

### Provider Abstraction
- Same API across all providers (mock, HTTP, MCP)
- Provider can be switched via environment variable
- No breaking changes to API when switching providers

---

## Breaking Change Policy

- Major version bumps for breaking API changes
- Deprecation warnings before removal
- Migration guides for breaking changes

---

## Update Triggers

This doc must be updated when:
- SLOs change
- Rate limits change
- Guarantees change
- Breaking change policy evolves




