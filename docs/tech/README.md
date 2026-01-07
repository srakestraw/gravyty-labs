# Technical Documentation

**Purpose**: Architecture, APIs, data models, runbooks, and implementation details.

**Audience**: Engineers, DevOps, Support

**Scope**: System architecture, component boundaries, APIs, data models, failure modes, runbooks

**Non-goals**: Product requirements (see [Product](../product/README.md)), UX flows (see [Design](../design/README.md))

**Last Updated**: 2025-12-20

---

## Structure

```
tech/
├── README.md              # This file
├── CLAUDE.md              # Tech docs operating rules
├── architecture.md        # System overview
├── decisions/             # Architecture Decision Records (ADRs)
│   └── ADR-XXX.md
└── domains/               # Domain-specific technical docs
    └── <domain>/
        ├── README.md      # Domain tech overview
        ├── architecture.md    # Domain architecture
        ├── data.md            # Data models and ownership
        ├── apis.md            # API contracts
        └── runbooks.md        # Operational procedures
```

---

## Domains

- [Admissions](domains/admissions/README.md)
- [Advancement](domains/advancement/README.md)
- [AI Assistants](domains/ai-assistants/README.md)
- [SIS](domains/sis/README.md)
- [Student Lifecycle](domains/student-lifecycle/README.md)
- [Community](domains/community/README.md)
- [Career](domains/career/README.md)
- [Admin](domains/admin/README.md)
- [Dashboard](domains/dashboard/README.md)
- [Data](domains/data/README.md)

---

## Architecture Decision Records (ADRs)

ADRs document significant architectural decisions:
- Why a decision was made
- Alternatives considered
- Consequences

Format: `decisions/ADR-XXX-<short-name>.md`

---

## Required Content

### architecture.md

Must include:
- Current state (what exists today)
- Component boundaries
- System interactions
- Technology choices

### data.md

Must include:
- Data models
- Systems of record
- Data ownership
- Migration considerations

### apis.md

Must include:
- API contracts
- Request/response formats
- Authentication/authorization
- Rate limits and quotas

### runbooks.md

Must include:
- Failure modes
- Troubleshooting steps
- Recovery procedures
- On-call contacts

---

## Links

- [Root Docs](../README.md)
- [Product Docs](../product/README.md)
- [Design Docs](../design/README.md)
- [Tech Rules](CLAUDE.md)
- [System Architecture](architecture.md)

---

## Ownership

**Technical Documentation Owner**: Engineering Team  
**Update Triggers**: Architecture changes, API changes, data model changes, new runbooks




