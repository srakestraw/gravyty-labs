# Product Environment Brief

**Purpose**: Concise overview of the Gravyty Labs product environment and services utilized.

**Audience**: Product, Design, Engineering, Support, new hires

**Last Updated**: 2026-01-27

---

## Product Overview

**Gravyty Labs** is a Next.js 14 platform for admissions management, student information systems (SIS), and AI-powered automation. It operates as a multi-app environment with a shared shell (header, sidebar, app switcher) and domain-specific routes and workflows.

### Domains / Applications

| Domain | Scope |
|--------|--------|
| **Admissions** | Admissions management |
| **SIS** | Student information system, Banner-aligned data |
| **Student Lifecycle** | Student lifecycle AI workflows |
| **Advancement** | Philanthropy, CRM Mock (constituent/gift/portfolio) |
| **AI Assistants** | AI chatbots and messaging |
| **Community** | Engagement hub |
| **Career** | Career services |
| **Admin** | Admin and settings |
| **Dashboard** | Home and dashboards |
| **Data** | Insights and reporting |

---

## Services Utilized

### Authentication & Authorization

- **Auth (Firebase)**  
  - Firebase Authentication (Google OAuth).  
  - Domain restrictions: `gravyty.com`, `rakestraw.com`.  
  - Middleware-based route protection, role-aware access.  
  - Config via `NEXT_PUBLIC_FIREBASE_*` env vars.

### Data & Storage

- **Data Provider**  
  - Unified data access via `@/lib/data` (`dataClient`).  
  - Abstracts mock / future HTTP or MCP providers.  
  - Context-based filtering: `workspace`, `app`, `mode`, `userId`.  
  - Surfaces: queue items, contacts, segments, segment definitions, guardrail policies, do-not-engage.  
  - Current runtime: **mock** (`NEXT_PUBLIC_DATA_PROVIDER` defaults to `"mock"`).

- **Banner**  
  - SIS data services for Banner integration.  
  - Next.js API routes under `/api/banner/` (academic credentials, periods, programs, courses, persons, sections, section-registrations, students, student-academic-programs, student-transcript-grades, student-risks).  
  - Consumed by SIS and related domains.

- **CRM Unified**  
  - Mock CRM service (Salesforce/Blackbaud-style) for testing, demos, and AI training.  
  - Contact/account/opportunity and activity-style data.  
  - Backed by **PostgreSQL via Prisma** (`packages/db`).

- **CRM Mock**  
  - Advancement-only CRM demo on top of CRM Unified.  
  - Constituents, gifts, portfolios, interactions, events, lapsed donors, etc.  
  - Scoped to `workspace: 'advancement'`, `app: 'crm-mock'`.  
  - API surface under `/api/crm-mock/*`.

### Communication

- **Communication**  
  - Voice profiles and messaging configuration.  
  - Exposed via `/api/communication-config` and Netlify function `communication-config`.

### AI & Automation

- **Guardrails**  
  - AI policy enforcement.  
  - Served by Netlify function `guardrails` (e.g. `/api/guardrails`).

- **Do Not Engage (DNE)**  
  - DNE rules and checks.  
  - API routes under `/api/dne/` and `/api/do-not-engage/`.

- **Agent Ops**  
  - Queue / agent-ops workflow.  
  - Data surfaced through the Data Provider (e.g. `listQueueItems`).

### Segmentation & Contacts

- **Segments**  
  - Audience segmentation.  
  - Accessed via Data Provider (`listSegments`, `listSegmentDefinitions`, etc.).

- **Contacts**  
  - Contact management.  
  - Accessed via Data Provider and CRM Mock/Unified where applicable.

### Platform

- **Command Center**  
  - Working modes (e.g. operator, leadership, global, workspace).  
  - Used for context and filtering.

- **Assignments**  
  - Assignment handling.  
  - Used by queue and workflow surfaces.

- **Features**  
  - Feature flags and gating.

---

## Hosting & Deployment

- **Netlify**  
  - Static publish from `out`.  
  - Build: `npm run build:static` (with `NODE_ENV=production`).  
  - Node 20.  
  - Redirects: `/api/guardrails` → `/.netlify/functions/guardrails`, `/api/communication-config` → `/.netlify/functions/communication-config`.

- **Firebase**  
  - Project: `gravyty-labs` (from `.firebaserc`).  
  - Used for Authentication only in this environment.

- **Docker**  
  - Supported via project `Dockerfile` for containerized builds.

---

## Technical Stack (Summary)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI | Tailwind CSS, Radix UI, MUI, Framer Motion |
| State | Zustand |
| Auth | Firebase Auth |
| Icons | Font Awesome Pro (via `FontAwesomeIcon` component) |
| Data provider | `lib/data` (mock; future HTTP/MCP) |
| CRM persistence | Prisma + PostgreSQL (`packages/db`) |
| Serverless | Netlify Functions (guardrails, communication-config) |

---

## Environment Variables (Product-Relevant)

- **Firebase**: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`
- **Data provider**: `NEXT_PUBLIC_DATA_PROVIDER` (e.g. `"mock"`)

Database and CRM-related config live with the Prisma/`packages/db` setup and any Netlify/build env needed for `build:static`.

---

## References

- [README](/README.md) – Quick start and high-level features  
- [Shared Services](shared-services/README.md) – Service list and pointers  
- [Tech Architecture](tech/architecture.md) – Patterns and boundaries  
- [Product Docs](product/README.md) – Domains and requirements
