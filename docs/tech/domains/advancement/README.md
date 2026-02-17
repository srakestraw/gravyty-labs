# Advancement Domain - Technical

**Purpose**: Technical architecture, APIs, data models, and runbooks for Advancement.

**Audience**: Engineers, DevOps, Support

**Scope**: System architecture, component boundaries, navigation, data models, failure modes

**Non-goals**: Product requirements (see [Product](../../product/domains/advancement/README.md)), UX flows (see [Design](../../design/domains/advancement/README.md))

**Key Terms**:
- **Pipeline & Portfolio**: Advancement workspace for prospect pipeline management, portfolio health, and AI-assisted outreach
- **Workspace**: Top-level subdivision of Advancement (Pipeline & Portfolio, Giving, Payments & Processing)

**Links**:
- [Product Docs](../../product/domains/advancement/README.md)
- [Design Docs](../../design/domains/advancement/README.md)
- [Advancement Pipeline Nav Brief](advancement-pipeline-nav-brief.md) - Sidebar and workspace navigation

**Ownership**: Engineering Team  
**Update Triggers**: Architecture changes, navigation changes, API changes, data model changes

**Last Updated**: 2025-02-17

---

## Technical Documentation

- [Advancement Pipeline Nav Brief](advancement-pipeline-nav-brief.md) - Sidebar items, workspace switcher, and navigation structure

---

## Dependencies

- [Data Provider](../../shared-services/data-provider/README.md) - Data access
- [Agent Ops](../../shared-services/agent-ops/README.md) - Queue system
- [Command Center](../../shared-services/command-center/README.md) - Working modes (Team/Leadership)
- [Segments](../../shared-services/segments/README.md) - Audience segmentation
- [Contacts](../../shared-services/contacts/README.md) - Contact management
- [Queue Component](../../shared-components/queue/README.md) - Shared queue component
