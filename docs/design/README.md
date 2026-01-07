# Design Documentation

**Purpose**: UX flows, interaction rules, design system usage, and content guidelines.

**Audience**: Designers, Engineers, Product Managers

**Scope**: User flows, states, interaction patterns, accessibility, content rules, design system

**Non-goals**: Product requirements (see [Product](../product/README.md)), technical implementation (see [Tech](../tech/README.md))

**Last Updated**: 2025-12-20

---

## Structure

```
design/
├── README.md              # This file
├── CLAUDE.md              # Design docs operating rules
├── system/                # Design system (if applicable)
│   └── [tokens, components, usage]
└── domains/               # Domain-specific design
    └── <domain>/
        ├── README.md      # Domain design overview
        ├── ia-and-flows.md      # Key flows, states, UX rules
        └── content-and-voice.md # Tone, messaging, accessibility
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

## Design System

**Font Awesome Pro Kit**: https://kit.fontawesome.com/a983b74f3b.js

**Component Library**: See `components/ui/` and `components/shared/`

**Design Tokens**: See `tailwind.config.ts`

---

## Required Content

### ia-and-flows.md

Must include:
- Primary user flows (happy path)
- Key states (loading, empty, error, success)
- Interaction rules (keyboard, focus, responsiveness)
- Accessibility requirements
- Analytics events (links to instrumentation)

### content-and-voice.md

Must include:
- Tone and voice guidelines
- Messaging rules
- Accessibility notes (alt text, ARIA labels)
- Content patterns and examples

---

## Links

- [Root Docs](../README.md)
- [Product Docs](../product/README.md)
- [Tech Docs](../tech/README.md)
- [Design Rules](CLAUDE.md)

---

## Ownership

**Design Documentation Owner**: Design Team  
**Update Triggers**: UX changes, new flows, design system updates, accessibility improvements




