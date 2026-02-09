# Shared Services Documentation

**Purpose**: Documentation for cross-cutting services used by multiple domains.

**Audience**: Engineers, Product Managers, Support

**Scope**: Service contracts, architecture, APIs, runbooks, and operational procedures

**Non-goals**: Domain-specific usage (see domain docs), product requirements (see [Product](../product/README.md))

**Key Terms**:
- **Service**: A reusable component or system used by multiple domains
- **Contract**: The promises a service makes (SLOs, limits, guarantees)
- **Consumer**: A domain or application that uses the service

**Last Updated**: 2025-12-20

---

## Services

### Authentication & Authorization
- **[Auth](auth/README.md)** - Firebase Authentication

### Data & Storage
- **[Data Provider](data-provider/README.md)** - Unified data access layer
- **[Banner](banner/README.md)** - SIS data services
- **[CRM Unified](crm-unified/README.md)** - Mock CRM service

### Communication
- **[Communication](communication/README.md)** - Voice profiles and messaging

### AI & Automation
- **[Guardrails](guardrails/README.md)** - AI policy enforcement
- **[Do Not Engage](do-not-engage/README.md)** - DNE service
- **[Agent Ops](agent-ops/README.md)** - Queue system

### Segmentation & Contacts
- **[Segments](segments/README.md)** - Audience segmentation
- **[Contacts](contacts/README.md)** - Contact management

### Platform
- **[Command Center](command-center/README.md)** - Working modes
- **[Assignments](assignments/README.md)** - Assignment management
- **[Features](features/README.md)** - Feature flags
- **[Narrative](narrative/README.md)** - Storytelling content library and personalization

---

## Service Documentation Structure

Each service must have:
- `README.md` - Service overview and quick start
- `context.md` - Who uses it, when to use it, alternatives
- `contracts.md` - Product-facing promises (SLOs, limits, guarantees)
- `architecture.md` - Technical architecture
- `apis-and-events.md` - API contracts and event schemas
- `runbooks.md` - Operational procedures

---

## Using Shared Services

**Domains must link to shared services, not duplicate their documentation.**

✅ **Correct**: "See [Data Provider](../shared-services/data-provider/README.md) for API details"

❌ **Incorrect**: Copying API contracts into domain docs

---

## Links

- [Root Docs](../README.md)
- [Product Docs](../product/README.md)
- [Tech Docs](../tech/README.md)
- [Service Rules](CLAUDE.md)

---

## Ownership

**Shared Services Documentation Owner**: Engineering Team  
**Update Triggers**: Service changes, contract changes, new services, API changes


