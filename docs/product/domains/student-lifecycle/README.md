# Student Lifecycle Domain - Product

**Purpose**: Product requirements and context for the Student Lifecycle domain.

**Audience**: Product Managers, Designers, Engineers, Support

**Scope**: Student lifecycle workflows, agent operations, student support

**Non-goals**: Technical implementation (see [Tech](../../tech/domains/student-lifecycle/README.md)), UX flows (see [Design](../../design/domains/student-lifecycle/README.md))

**Links**:
- [Design Docs](../../design/domains/student-lifecycle/README.md)
- [Tech Docs](../../tech/domains/student-lifecycle/README.md)
- [Requirements](requirements/)

**Ownership**: Student Lifecycle Product Team  
**Update Triggers**: New features, changed requirements

**Last Updated**: 2025-12-22

---

## Overview

The Student Lifecycle domain manages student support workflows and agent operations across workspaces.

## Key Workflows

1. Queue management for student lifecycle items
2. Agent operations triage
3. Student support workflows

## Queue Integration

Student Lifecycle workspaces use the shared Queue component for triage and agent operations.

- **[Queue Component Documentation](../../shared-components/queue/README.md)** - Complete Queue documentation
- **Entry Point**: `/student-lifecycle/[workspace]/agent-ops/queue`
- **Default Filters**: None (all items shown)
- **Game Plan Integration**: Not available (standard queue only)
- **Focus Mode**: Not available (Admissions/Advancement only)
- **Review Mode**: Available (feature flag: `queueReviewMode`)

For Queue behavior, actions, keyboard shortcuts, and URL parameters, see [Queue Documentation](../../shared-components/queue/README.md).

## Dependencies

- [Data Provider](../../shared-services/data-provider/README.md) - Data access
- [Agent Ops](../../shared-services/agent-ops/README.md) - Queue system
- [Segments](../../shared-services/segments/README.md) - Audience segmentation
- [Contacts](../../shared-services/contacts/README.md) - Contact management
- [Queue Component](../../shared-components/queue/README.md) - Shared queue component

