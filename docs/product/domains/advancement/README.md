# Advancement Domain - Product

**Purpose**: Product requirements and context for the Advancement domain.

**Audience**: Product Managers, Designers, Engineers, Support

**Scope**: Advancement workflows, pipeline management, giving, payments

**Non-goals**: Technical implementation (see [Tech](../../tech/domains/advancement/README.md)), UX flows (see [Design](../../design/domains/advancement/README.md))

**Links**:
- [Design Docs](../../design/domains/advancement/README.md)
- [Tech Docs](../../tech/domains/advancement/README.md)
- [Requirements](requirements/)

**Ownership**: Advancement Product Team  
**Update Triggers**: New features, changed requirements

**Last Updated**: 2025-12-22

---

## Overview

The Advancement domain manages donor relationships, pipeline, giving, and payments.

## Key Workflows

1. Pipeline management
2. Donor giving
3. Payment processing

## Requirements

[Link to requirements docs]

---

## Queue Integration

Advancement uses the shared Queue component for pipeline triage and agent operations.

- **[Queue Component Documentation](../../shared-components/queue/README.md)** - Complete Queue documentation
- **Entry Point**: `/advancement/pipeline/agent-ops/queue`
- **Default Filters**: None (all items shown)
- **Game Plan Integration**: Full support for Advancement objectives:
  - `re-engage-stalled`: Stalled/inactive items
  - `prep-briefs`: Meeting/brief preparation items
  - `advance-proposals`: Proposal review items
  - `stewardship-followups`: Stewardship/follow-up items
- **Focus Mode**: Available (toggle via button or `?focus=1`)
- **Review Mode**: Available (feature flag: `queueReviewMode`)

For Queue behavior, actions, keyboard shortcuts, and URL parameters, see [Queue Documentation](../../shared-components/queue/README.md).

## Dependencies

- [Data Provider](../../shared-services/data-provider/README.md) - Data access
- [Agent Ops](../../shared-services/agent-ops/README.md) - Queue system
- [Segments](../../shared-services/segments/README.md) - Audience segmentation
- [Contacts](../../shared-services/contacts/README.md) - Contact management
- [Queue Component](../../shared-components/queue/README.md) - Shared queue component

