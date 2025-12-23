# Gravyty Labs Documentation

**Purpose**: Central entry point for all product, design, and technical documentation. This is a living documentation system that scales across teams and domains.

**Audience**: Product Managers, Designers, Engineers, Support, and new team members

**Last Updated**: 2025-12-22

---

## 🚀 Start Here

New to the codebase? Start here:

1. **What is this platform?** → [Product Overview](../README.md)
2. **How is it built?** → [Tech Architecture](tech/README.md)
3. **What are the design principles?** → [Design System](design/README.md)
4. **Where do I change X?** → See [Common Tasks](#common-tasks) below

---

## 📁 Where Do I Put This?

**Adding new documentation?** Use this guide:

- **Product requirements** → `docs/product/domains/<domain>/requirements/<feature>.md`
- **UX flows and design specs** → `docs/design/domains/<domain>/ia-and-flows.md`
- **Technical architecture** → `docs/tech/domains/<domain>/architecture.md`
- **Shared service docs** → `docs/shared-services/<service>/README.md`
- **Shared component docs** → `docs/shared-components/<component>/README.md`
- **Architecture decisions** → `docs/tech/decisions/ADR-XXX.md`

**Not sure which domain?** Check the [Domain Index](#domains) below.

---

## 📚 Documentation Structure

```
docs/
├── product/          # Product requirements and vision
│   └── domains/      # Domain-specific requirements
├── design/           # UX, flows, and design system
│   └── domains/      # Domain-specific design docs
├── tech/             # Technical architecture and implementation
│   ├── decisions/    # Architecture Decision Records (ADRs)
│   └── domains/       # Domain-specific technical docs
├── shared-services/  # Cross-cutting services (auth, data, etc.)
└── shared-components/ # Shared UI components (queue, etc.)
```

---

## 🗺️ Domains

### Core Applications

- **[Admissions](product/domains/admissions/README.md)** - Admissions Management
- **[Advancement](product/domains/advancement/README.md)** - Advancement & Philanthropy
- **[AI Assistants](product/domains/ai-assistants/README.md)** - AI Chatbots & Messaging
- **[SIS](product/domains/sis/README.md)** - Student Information System
- **[Student Lifecycle](product/domains/student-lifecycle/README.md)** - Student Lifecycle AI

### Supporting Applications

- **[Community](product/domains/community/README.md)** - Engagement Hub
- **[Career](product/domains/career/README.md)** - Career Services
- **[Admin](product/domains/admin/README.md)** - Admin & Settings
- **[Dashboard](product/domains/dashboard/README.md)** - Home/Dashboard
- **[Data](product/domains/data/README.md)** - Insights & Reporting

---

## 🔧 Shared Services

Cross-cutting services used by multiple domains:

- **[Auth](shared-services/auth/README.md)** - Firebase Authentication
- **[Data Provider](shared-services/data-provider/README.md)** - Unified data access layer
- **[Communication](shared-services/communication/README.md)** - Voice profiles and messaging
- **[Guardrails](shared-services/guardrails/README.md)** - AI policy enforcement
- **[Do Not Engage](shared-services/do-not-engage/README.md)** - DNE service
- **[Segments](shared-services/segments/README.md)** - Audience segmentation
- **[Contacts](shared-services/contacts/README.md)** - Contact management
- **[Banner](shared-services/banner/README.md)** - SIS data services
- **[CRM Unified](shared-services/crm-unified/README.md)** - Mock CRM service
- **[Command Center](shared-services/command-center/README.md)** - Working modes
- **[Agent Ops](shared-services/agent-ops/README.md)** - Queue system
- **[Assignments](shared-services/assignments/README.md)** - Assignment management
- **[Features](shared-services/features/README.md)** - Feature flags

## 🧩 Shared Components

Reusable UI components used across multiple domains:

- **[Queue](shared-components/queue/README.md)** - Shared triage interface for agent operations

---

## ✅ Common Tasks

### Add a Feature

1. Create requirements doc: `docs/product/domains/<domain>/requirements/<feature>.md`
2. Update UX flows: `docs/design/domains/<domain>/ia-and-flows.md`
3. Update architecture: `docs/tech/domains/<domain>/architecture.md`
4. Link all three in the same PR

### Update an API

1. Update API contract: `docs/tech/domains/<domain>/apis.md` or `docs/shared-services/<service>/apis-and-events.md`
2. Update any dependent domain docs that reference it
3. Add migration notes if breaking changes

### Change a Shared Service Contract

1. Update the service doc: `docs/shared-services/<service>/contracts.md`
2. Update `docs/shared-services/<service>/architecture.md` if needed
3. Update all domain docs that depend on it (search for service name)
4. Add migration guide if breaking

### Change a Shared Component

1. Update the component doc: `docs/shared-components/<component>/README.md`
2. Update component-specific docs (product.md, design.md, tech.md) if needed
3. Update all domain docs that use the component (search for component name)
4. Add migration guide if breaking

### Update a UX Flow

1. Update flows: `docs/design/domains/<domain>/ia-and-flows.md`
2. Update content rules: `docs/design/domains/<domain>/content-and-voice.md` if messaging changed
3. Update requirements: `docs/product/domains/<domain>/requirements/<feature>.md` if behavior changed

---

## 📋 PR Checklist

When opening a PR, verify:

- [ ] Did behavior change? → Update relevant requirements doc
- [ ] Did API or data shape change? → Update `apis.md` or `data.md`
- [ ] Did shared service contract change? → Update service doc and dependent domains
- [ ] Did shared component contract change? → Update component doc (e.g., `docs/shared-components/queue/`) and dependent domains
- [ ] Did UX flow change? → Update `ia-and-flows.md`
- [ ] Did copy/content change? → Update `content-and-voice.md`
- [ ] Which docs were updated? → List in PR description

**If you cannot fully update docs**, add a "Needs update" note with what changed and where to fix it (temporary, not permanent).

---

## 🔗 Quick Links

- [Product Vision](product/README.md)
- [Design System](design/README.md)
- [Tech Architecture](tech/README.md)
- [Documentation Rules](CLAUDE.md)
- [Legacy Docs Archive](archive/)

---

## 📞 Ownership

**Documentation System Owner**: Engineering Team  
**Primary Contact**: See [CLAUDE.md](CLAUDE.md) for escalation paths

---

## 🔄 Update Triggers

This README must be updated when:
- New domains are added
- New shared services are created
- Documentation structure changes
- Common tasks change

