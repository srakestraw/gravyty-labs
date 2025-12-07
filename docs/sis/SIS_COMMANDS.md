# SIS Commands Cheatsheet

Quick reference for all commands needed to operate the Affinity University SIS.

---

## Installation & Setup

| Task | Command | Location |
|------|---------|----------|
| Install dependencies | `npm install` | Root |
| Generate Prisma client | `cd packages/db && npm run db:generate` | `packages/db/` |
| Run database migrations | `cd packages/db && npm run db:migrate` | `packages/db/` |

---

## Database Operations

| Task | Command | Location | Time |
|------|---------|----------|------|
| Generate Prisma client | `npm run db:generate` | `packages/db/` | < 5s |
| Run migrations (dev) | `npm run db:migrate` | `packages/db/` | 10-30s |
| Deploy migrations (prod) | `npm run db:migrate:deploy` | `packages/db/` | 10-30s |
| Open Prisma Studio | `npm run db:studio` | `packages/db/` | - |
| Reset database | `npm run db:reset` | `packages/db/` | 30s-2m |

---

## Seeding

| Task | Command | Location | Time |
|------|---------|----------|------|
| Minimal seed (test data) | `npm run db:seed` | `packages/db/` | < 10s |
| 6-year Affinity seed | `npm run db:seed:affinity` | `packages/db/` | 5-15m |

---

## Simulation

| Task | Command | Location | Time |
|------|---------|----------|------|
| Run weekly simulation tick | `npm run simulate:week` | `packages/db/` | 10-30s |
| Run weekly tick (via API) | `POST /api/internal/simulator/tick` | Browser/API | 10-30s |

---

## Development Server

| Task | Command | Location | Notes |
|------|---------|----------|-------|
| Start dev server | `npm run dev` | Root | Opens `http://localhost:3000` |
| Build for production | `npm run build` | Root | Creates `.next/` directory |
| Start production server | `npm run start` | Root | Requires build first |

---

## Code Quality

| Task | Command | Location |
|------|---------|----------|
| Run linter | `npm run lint` | Root |

---

## Common Workflows

### Initial Setup (Fresh Database)

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
cd packages/db
npm run db:generate

# 3. Run migrations
npm run db:migrate

# 4. Seed 6 years of data
npm run db:seed:affinity

# 5. (Optional) Run simulation ticks
npm run simulate:week  # Run multiple times as needed

# 6. Start dev server
cd ../..
npm run dev
```

### Reset & Reseed

```bash
cd packages/db

# Drop and recreate database
npm run db:reset

# Seed Affinity data
npm run db:seed:affinity
```

### Run Simulation Ticks

```bash
cd packages/db

# Single tick
npm run simulate:week

# Multiple ticks (run multiple times)
npm run simulate:week
npm run simulate:week
npm run simulate:week
```

### Quick Development Cycle

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Database operations
cd packages/db
npm run db:studio  # Or other DB commands
```

---

## API Endpoints (for testing)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/banner/academic-periods` | GET | List academic periods |
| `/api/banner/students` | GET | List students |
| `/api/banner/sections` | GET | List sections |
| `/api/banner/section-registrations` | GET | List registrations |
| `/api/banner/student-transcript-grades` | GET | List transcript grades |
| `/api/banner/student-risks` | GET | List student risks |
| `/api/internal/simulation-state` | GET | Get simulation date |
| `/api/internal/simulator/tick` | POST | Run simulation tick |

---

## UI Routes

| Route | Purpose |
|-------|---------|
| `/sis` | SIS main page (Term & Section Explorer) |
| `/sis/students/[id]` | Student 360 view |
| `/sis/instructors/[id]` | Instructor schedule view (placeholder) |
| `/sis/dev/data-health` | Data health dashboard (dev-only) |

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes* | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes* | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes* | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes* | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes* | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes* | Firebase app ID |

*Required for Portal authentication. May be optional for SIS-only demos.

---

## Notes

- **All database commands** must be run from `packages/db/` directory
- **All dev server commands** must be run from repository root
- **Time estimates** are approximate and depend on system performance
- **Simulation ticks** advance time by exactly 7 days each
- **Seeding** is deterministic (same seed = same data)

---

**For detailed explanations, see:**
- [Operations Guide](./SIS_OPERATIONS_GUIDE.md) - Setup and maintenance
- [Demo Runbook](./SIS_DEMO_RUNBOOK.md) - Step-by-step demo guide
- [SIS README](./SIS_README.md) - Overview and architecture






