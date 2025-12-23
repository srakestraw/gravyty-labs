# Affinity University SIS – Overview

## What is the Affinity University SIS?

The **Affinity University Student Information System (SIS)** is a comprehensive, Banner/Ethos-aligned student information system built inside the Gravyty Labs Portal. It provides a complete view of student data, academic records, enrollment, and risk indicators for a fictional institution called **Affinity University**.

The SIS is designed to:
- Demonstrate realistic student data management workflows
- Showcase Banner-compatible API patterns
- Provide a rich dataset for testing and demos
- Support synthetic data generation and simulation

---

## Affinity University Persona

**Affinity University (AU)** is a mid-sized public university with the following characteristics:

- **Total Enrollment**: ~18,500 students
- **Student Mix**: 82% undergraduate, 18% graduate
- **Age Distribution**: 68% traditional age (18-24), 32% non-traditional (25+)
- **Load**: 73% full-time, 27% part-time
- **Demographics**:
  - 42% first-generation students
  - 38% Pell-eligible
  - 78% in-state, 22% out-of-state
- **Risk Factors**:
  - 15% at-risk for attendance issues
  - 22% require academic support
  - 18% work 30+ hours/week
  - 25% commute 30+ minutes
  - 12% have housing instability

**Academic Calendar**: Fall (Aug-Dec), Spring (Jan-May), Summer (Jun-Jul)

**Retention & Graduation**:
- 78% year 1 to year 2 retention
- 42% 4-year graduation rate
- 61% 6-year graduation rate

---

## Architecture Overview

The SIS is built as a multi-layered system within the existing Portal Next.js application:

```
┌─────────────────────────────────────────────────────────────┐
│                    Portal Next.js App                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  SIS Front-End (app/(shell)/sis/*)                    │ │
│  │  - Term & Section Explorer                             │ │
│  │  - Student 360 View                                    │ │
│  │  - Data Health Dashboard                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Banner-Compatible API (/api/banner/*)                 │ │
│  │  - RESTful endpoints matching Ethos structure           │ │
│  │  - Zod schema validation                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Database Layer (packages/db/)                         │ │
│  │  - Prisma ORM                                          │ │
│  │  - PostgreSQL database                                 │ │
│  │  - 6 years of synthetic data                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Synthetic Data Engine                                  │ │
│  │  - 6-year Affinity seed                                │ │
│  │  - Weekly simulation (one tick = one week)             │ │
│  │  - Updates: enrollment, attendance, grades, risk       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Components

#### 1. **Database Layer** (`packages/db/`)
- **Prisma Schema**: Models for Person, Student, AcademicPeriod, Course, Section, SectionRegistration, StudentRisk, etc.
- **Migrations**: Database schema versioning
- **Seed Scripts**: 
  - `seed.ts` - Minimal test data
  - `seed-affinity.ts` - Full 6-year Affinity dataset

#### 2. **API Layer** (`app/api/banner/*`)
- **Banner-Compatible Endpoints**: RESTful API matching Ellucian Banner Ethos structure
- **Resources**: `/api/banner/students`, `/api/banner/sections`, `/api/banner/academic-periods`, etc.
- **Validation**: Zod schemas ensure response shape matches Banner format
- **Mappers**: Transform Prisma models to Banner JSON format

#### 3. **Front-End** (`app/(shell)/sis/*`)
- **Term & Section Explorer**: Browse sections by term and subject
- **Student 360 View**: Complete student profile with schedule, history, and risk indicators
- **Data Health Dashboard**: Dev-only metrics and simulation controls (`/sis/dev/data-health`)

#### 4. **Synthetic Data Engine**
- **6-Year Seed**: Generates ~18,500 students across 6 academic years (2019-2025)
- **Weekly Simulation**: Advances time by one week per tick, updating:
  - Enrollment counts
  - Attendance rates
  - Midterm and final grades
  - Risk scores
  - Transcript grades (at term end)

---

## Data Flow

```
1. Seed (Initial)
   └─> Generate 6 years of academic periods, programs, courses, students
   └─> Create enrollment history and transcript grades
   └─> Calculate initial risk scores

2. Simulation (Ongoing)
   └─> Weekly tick advances simulation date
   └─> Updates attendance, grades, enrollment
   └─> Recomputes risk scores
   └─> Finalizes grades at term end

3. API (On-Demand)
   └─> Front-end requests data via /api/banner/* endpoints
   └─> API queries Prisma database
   └─> Mappers transform to Banner format
   └─> Zod validates response shape

4. UI (User Interaction)
   └─> User navigates SIS pages
   └─> Components fetch from API
   └─> Display data with Affinity branding
```

---

## Key Features

### For Developers
- **Banner-Compatible API**: Easy integration with Banner-style systems
- **Type-Safe**: Full TypeScript with Zod validation
- **Deterministic Seeding**: Reproducible data generation
- **Simulation Engine**: Test scenarios with time-based data evolution

### For Demos
- **Realistic Data**: 6 years of comprehensive student records
- **Risk Indicators**: Visual risk buckets (LOW/MEDIUM/HIGH)
- **Student Journeys**: Complete academic history per student
- **Live Simulation**: Watch data evolve in real-time

---

## Documentation Index

### Getting Started
- **[SIS Commands](./SIS_COMMANDS.md)** - Quick command reference
- **[Demo Runbook](./SIS_DEMO_RUNBOOK.md)** - Step-by-step demo guide
- **[Operations Guide](./SIS_OPERATIONS_GUIDE.md)** - Setup and maintenance

### Technical Documentation
- **[Build Overview](./01_SIS_BUILD_OVERVIEW.md)** - Phased development plan
- **[Data Model Plan](./02_SIS_BANNER_DATA_MODEL_PLAN.md)** - Database design
- **[API Compatibility Plan](./03_SIS_API_COMPATIBILITY_PLAN.md)** - API structure
- **[Front-End UX Plan](./04_SIS_FRONTEND_UX_PLAN_AFFINITY_UNIVERSITY.md)** - UI design
- **[Synthetic Data Engine Plan](./05_SIS_SYNTHETIC_DATA_ENGINE_PLAN_AFFINITY.md)** - Data generation
- **[ERD Overview](./erd-overview.md)** - Entity relationships
- **[ERD Detailed](./erd-detailed.md)** - Detailed schema documentation
- **[Field Maps](./field-maps/)** - Ethos to DB field mappings
- **[API Documentation](./api/banner/)** - Endpoint reference

### Implementation Summaries
- **[Phase 03 Summary](./PHASE_03_IMPLEMENTATION_SUMMARY.md)** - API implementation
- **[Phase 04 Summary](./PHASE_04_IMPLEMENTATION_SUMMARY.md)** - Front-end implementation
- **[Phase 05 Summary](./PHASE_05_IMPLEMENTATION_SUMMARY.md)** - Synthetic data engine

### Brand & Design
- **[Affinity Brand Guide](./00_AFFINITY_BRAND_GUIDE.md)** - Branding guidelines

---

## Quick Start

For a quick demo setup, see the [Demo Runbook](./SIS_DEMO_RUNBOOK.md).

For day-to-day operations, see the [Operations Guide](./SIS_OPERATIONS_GUIDE.md).

For command reference, see [SIS Commands](./SIS_COMMANDS.md).

---

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **API**: RESTful endpoints with Zod validation
- **Front-End**: React, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Icons**: Font Awesome Pro
- **Styling**: Tailwind CSS with Affinity Blue (`#336AEA`)

---

**Built as part of the Gravyty Labs Platform**






