# System Architecture

**Purpose**: High-level system overview and architecture patterns.

**Audience**: Engineers, Architects

**Last Updated**: 2025-12-20

---

## Platform Overview

Gravyty Labs is a Next.js 14 platform for admissions management, student information systems, and AI-powered automation.

### Core Technologies
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Components**: Radix UI primitives
- **Auth**: Firebase Authentication
- **Icons**: Font Awesome Pro

---

## Architecture Patterns

### Multi-App Platform
- Apps organized under `app/(shell)/`
- Shared shell components (header, sidebar, switcher)
- App-specific routes and pages

### Data Provider Pattern
- Unified data access via `lib/data`
- Provider abstraction (mock, HTTP, MCP)
- Context-based filtering

### Shared Services
- Cross-cutting services in `lib/`
- Shared components in `components/shared/`
- UI components in `components/ui/`

---

## System Boundaries

### Frontend
- Next.js App Router
- React Server Components
- Client components for interactivity

### Data Layer
- Data Provider abstraction
- Mock provider (current)
- HTTP/MCP providers (future)

### Authentication
- Firebase Authentication
- Middleware-based route protection
- Role-based access control

---

## Domain Architecture

See domain-specific architecture docs:
- [Admissions](domains/admissions/architecture.md)
- [Advancement](domains/advancement/README.md)
- [AI Assistants](domains/ai-assistants/README.md)
- [SIS](domains/sis/README.md)
- [Student Lifecycle](domains/student-lifecycle/README.md)

---

## Shared Services

See shared service architecture docs:
- [Data Provider](../shared-services/data-provider/architecture.md)
- [Auth](../shared-services/auth/README.md)
- [Agent Ops](../shared-services/agent-ops/README.md)

---

## Update Triggers

This doc must be updated when:
- Architecture patterns change
- Technology choices change
- System boundaries evolve
- New architectural decisions are made




