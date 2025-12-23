# Admissions Domain - Product

**Purpose**: Product requirements and context for the Admissions Management domain.

**Audience**: Product Managers, Designers, Engineers, Support

**Scope**: Admissions workflows, program matching, lead management, agent operations

**Non-goals**: Technical implementation (see [Tech](../../tech/domains/admissions/README.md)), UX flows (see [Design](../../design/domains/admissions/README.md))

**Key Terms**:
- **Lead**: Prospective student inquiry
- **Program Match**: AI-powered program recommendation
- **Agent Ops**: Queue-based workflow management
- **Segment**: Audience grouping for targeted outreach

**Links**:
- [Design Docs](../../design/domains/admissions/README.md)
- [Tech Docs](../../tech/domains/admissions/README.md)
- [Requirements](requirements/)

**Ownership**: Admissions Product Team  
**Update Triggers**: New features, changed requirements, workflow changes

**Last Updated**: 2025-12-22

---

## Overview

The Admissions domain streamlines the admissions process with intelligent automation, program matching, and lead management.

## Key Workflows

1. **Lead Intake** - Prospective students submit inquiries
2. **Program Matching** - AI recommends programs based on student profile
3. **Queue Management** - Agents review and process leads
4. **Segmentation** - Target outreach to specific audiences

## Requirements

- [Program Match](requirements/program-match.md)
- [Agent Ops Queue](requirements/agent-ops-queue.md)

---

## Queue Integration

Admissions uses the shared Queue component for triage and agent operations.

- **[Queue Component Documentation](../../shared-components/queue/README.md)** - Complete Queue documentation
- **Entry Point**: `/admissions/agent-ops/queue`
- **Default Filters**: None (all items shown)
- **Game Plan Integration**: Full support for Admissions objectives:
  - `stalled-applicants`: Items matching stalled/incomplete patterns
  - `missing-documents`: Items matching missing document patterns
  - `melt-risk`: Items matching melt risk patterns
- **Focus Mode**: Available (toggle via button or `?focus=1`)
- **Review Mode**: Available (feature flag: `queueReviewMode`)

For Queue behavior, actions, keyboard shortcuts, and URL parameters, see [Queue Documentation](../../shared-components/queue/README.md).

## Dependencies

- [Data Provider](../../shared-services/data-provider/README.md) - Data access
- [Agent Ops](../../shared-services/agent-ops/README.md) - Queue system
- [Segments](../../shared-services/segments/README.md) - Audience segmentation
- [Contacts](../../shared-services/contacts/README.md) - Contact management
- [Queue Component](../../shared-components/queue/README.md) - Shared queue component

