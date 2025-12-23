# CRM Unified Service

**Purpose**: Mock CRM service for testing, demos, and AI training. Provides a unified interface that mimics common CRM systems (Salesforce, Blackbaud, etc.) without requiring external integrations.

**Audience**: Engineers, Product Managers, QA

**Scope**: CRM data access, contact management, opportunity tracking, and simulation capabilities

**Non-goals**: Real CRM integrations (use dedicated integration services), domain-specific CRM logic (see domain docs)

**Key Terms**:
- **CRM Unified**: Mock CRM service that provides unified CRM-like functionality
- **Contact**: Person or organization record in the CRM
- **Opportunity**: Sales or engagement opportunity record
- **Account**: Organization or company record

**Links**:
- [Context](context.md)
- [Contracts](contracts.md)
- [Architecture](architecture.md)
- [APIs and Events](apis-and-events.md)
- [Runbooks](runbooks.md)

**Ownership**: Engineering Team  
**Update Triggers**: API changes, data model changes, contract changes

**Last Updated**: 2025-12-22

---

## Overview

CRM Unified is a mock CRM service designed to simulate common CRM functionality for testing, demos, and AI training scenarios. It provides a unified interface that mimics patterns from popular CRM systems like Salesforce and Blackbaud, without requiring external integrations.

The service supports:
- Contact and account management
- Opportunity tracking
- Activity logging
- Relationship mapping
- Data simulation and seeding

---

## Quick Start

```typescript
import { crmClient } from '@/lib/crm-unified';

// List contacts
const contacts = await crmClient.listContacts({
  workspace: 'admissions',
  app: 'student-lifecycle',
});

// Get contact details
const contact = await crmClient.getContact({
  workspace: 'admissions',
  app: 'student-lifecycle',
}, 'contact-123');

// List opportunities
const opportunities = await crmClient.listOpportunities({
  workspace: 'admissions',
  app: 'student-lifecycle',
});
```

---

## Product Requirements

### Purpose
CRM Unified serves as a mock CRM system for:
- Testing CRM integration patterns without external dependencies
- Providing realistic CRM data for demos and training
- Enabling AI training scenarios with CRM-like data structures
- Supporting development workflows that require CRM functionality

### Core Capabilities

#### Contact Management
- Create, read, update, and delete contact records
- Support for person and organization contacts
- Contact relationship mapping
- Contact activity history

#### Opportunity Tracking
- Create and manage sales/engagement opportunities
- Track opportunity stages and status
- Associate opportunities with contacts and accounts
- Opportunity activity logging

#### Account Management
- Organization and company records
- Account hierarchy support
- Account contact associations

#### Data Simulation
- Synthetic data generation
- Realistic data patterns
- Time-based simulation capabilities
- Bulk data operations

### Integration Points

CRM Unified integrates with:
- Data Provider service for unified data access
- Domain applications (Admissions, Advancement, etc.)
- AI training systems
- Testing frameworks

---

## See Also

- [Context](context.md) - When to use, alternatives
- [Contracts](contracts.md) - SLOs, limits, guarantees
- [Architecture](architecture.md) - Technical details
- [APIs and Events](apis-and-events.md) - Full API reference
- [Runbooks](runbooks.md) - Operational procedures

