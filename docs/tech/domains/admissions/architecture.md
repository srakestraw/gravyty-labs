# Admissions - Architecture

**Purpose**: Current state architecture, component boundaries, and system interactions.

**Audience**: Engineers

**Last Updated**: 2025-12-20

---

## Current State

### Component Boundaries

**Frontend**:
- `app/(shell)/admissions/` - Admissions pages
- `components/ai-assistants/agent-ops/` - Queue components
- `components/shared/queue/` - Shared queue components

**Data Layer**:
- `lib/data/` - Data provider (unified access)
- `lib/agent-ops/` - Queue types and utilities
- `lib/segments/` - Segment types

**API Layer**:
- `app/api/` - API routes (if applicable)

### System Interactions

```
User → Frontend → Data Provider → Mock/HTTP/MCP Provider
```

### Technology Choices

- **Framework**: Next.js 14 (App Router)
- **State**: Zustand
- **Styling**: Tailwind CSS
- **Components**: Radix UI primitives

---

## Component Boundaries

### Queue System
- **Location**: `components/shared/queue/`
- **Dependencies**: Data Provider, Agent Ops service
- **Responsibilities**: Queue UI, filtering, review mode

### Program Match
- **Location**: `app/(shell)/admissions/program-match/`
- **Dependencies**: Data Provider
- **Responsibilities**: Quiz UI, recommendation display

---

## Future Considerations

- Migration to HTTP API provider
- Migration to MCP provider
- Real-time queue updates

---

## Update Triggers

This doc must be updated when:
- Architecture changes
- Component boundaries change
- Technology choices change
- New systems are integrated




