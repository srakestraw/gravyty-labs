# CRM Unified - Contracts

**Purpose**: Product-facing promises: SLOs, limits, guarantees.

**Audience**: Engineers, Product Managers

**Last Updated**: 2025-12-22

---

## Service Level Objectives (SLOs)

- **Availability**: 99.9% uptime (mock service, local availability)
- **Latency**: < 100ms for read operations, < 200ms for write operations
- **Consistency**: Strong consistency (mock data, no distributed system)
- **Data Freshness**: Immediate (mock data, no sync delays)

---

## Rate Limits

- **Read Operations**: No limits (mock service)
- **Write Operations**: No limits (mock service)
- **Bulk Operations**: No limits, but large operations may take longer

---

## Guarantees

### Data Access
- All data access requires workspace and app context
- Data is scoped to the provided workspace/app context
- User-specific filtering when userId is provided

### Data Model Compatibility
- Compatible with common CRM patterns (Salesforce-like, Blackbaud-like)
- Standard contact, account, and opportunity models
- Extensible for domain-specific needs

### Mock Data Quality
- Realistic synthetic data generation
- Consistent data relationships
- Support for bulk data operations

---

## Breaking Change Policy

- Major version bumps for breaking API changes
- Deprecation warnings before removal
- Migration guides for breaking changes
- Backward compatibility maintained where possible

---

## Data Model Guarantees

### Contacts
- Always have at least a name or identifier
- Support for person and organization types
- Relationship tracking capabilities

### Opportunities
- Always associated with at least one contact or account
- Standard stage/status tracking
- Activity history support

### Accounts
- Organization-level records
- Support for account hierarchies
- Contact associations

---

## Update Triggers

This doc must be updated when:
- SLOs change
- Rate limits change
- Guarantees change
- Breaking change policy evolves
- Data model guarantees change

