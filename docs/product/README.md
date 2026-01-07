# Product Documentation

**Purpose**: Product requirements, vision, and domain context for all Gravyty Labs applications.

**Audience**: Product Managers, Designers, Engineers, Support

**Scope**: Product vision, requirements, user stories, success metrics, and domain context

**Non-goals**: Technical implementation details (see [Tech](../tech/README.md)), UX flows (see [Design](../design/README.md))

**Last Updated**: 2025-12-20

---

## Structure

```
product/
├── README.md              # This file
├── CLAUDE.md              # Product docs operating rules
├── vision.md              # Platform vision (if exists)
├── principles.md          # Product principles (if exists)
└── domains/               # Domain-specific requirements
    └── <domain>/
        ├── README.md      # Domain overview
        ├── CLAUDE.md      # Domain-specific rules
        ├── context.md     # Who it serves, workflows, terminology
        └── requirements/  # Feature requirements
            └── <feature>.md
```

---

## Domains

- [Admissions](domains/admissions/README.md) - Admissions Management
- [Advancement](domains/advancement/README.md) - Advancement & Philanthropy
- [AI Assistants](domains/ai-assistants/README.md) - AI Chatbots & Messaging
- [SIS](domains/sis/README.md) - Student Information System
- [Student Lifecycle](domains/student-lifecycle/README.md) - Student Lifecycle AI
- [Community](domains/community/README.md) - Engagement Hub
- [Career](domains/career/README.md) - Career Services
- [Admin](domains/admin/README.md) - Admin & Settings
- [Dashboard](domains/dashboard/README.md) - Home/Dashboard
- [Data](domains/data/README.md) - Insights & Reporting

---

## Requirements Template

When creating a new requirements doc, use this structure:

```markdown
# Feature Name

**Purpose**: [What problem does this solve?]

**Audience**: [Product, Design, Eng, Support]

**Last Updated**: [Date]

## Problem Statement

[Clear description of the problem]

## Users and Jobs-to-Be-Done

[Who uses this and what are they trying to accomplish?]

## Outcomes and Success Metrics

[What success looks like and how we measure it]

## MVP Requirements

[Testable statements of what must work]

## Later Requirements

[Future enhancements, out of scope for MVP]

## Edge Cases

[Error states, boundary conditions, special cases]

## Dependencies

[Links to shared services, other domains, external systems]

## Instrumentation and Observability

[What to log/measure to track success]

## Open Questions / Risks

[Unresolved questions and known risks]
```

---

## Links

- [Root Docs](../README.md)
- [Design Docs](../design/README.md)
- [Tech Docs](../tech/README.md)
- [Product Rules](CLAUDE.md)

---

## Ownership

**Product Documentation Owner**: Product Team  
**Update Triggers**: New features, changed requirements, new domains




