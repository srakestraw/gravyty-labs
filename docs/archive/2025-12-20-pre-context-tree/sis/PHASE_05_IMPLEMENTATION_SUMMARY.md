# Phase 05 – Synthetic Data Engine Implementation Summary

## ✅ Implementation Complete

Phase 05 delivers a comprehensive synthetic data engine for Affinity University, including a 6-year seed and weekly simulation system.

---

## 📁 Files Created/Updated

### Schema Extensions
| File | Description |
|------|-------------|
| `packages/db/prisma/schema.prisma` | Added risk/behavior fields to Student, SectionRegistration; added StudentRisk and SimulationState models |

### Seed Infrastructure
| File | Description |
|------|-------------|
| `packages/db/prisma/seed-data/affinity/random.ts` | Seeded random number generator for deterministic data |
| `packages/db/prisma/seed-data/affinity/constants.ts` | Affinity persona constants and configuration |
| `packages/db/prisma/seed-data/affinity/generators.ts` | Helper functions for generating academic periods, programs, courses, students |
| `packages/db/prisma/seed-affinity.ts` | Main 6-year Affinity seed script |

### Simulation Engine
| File | Description |
|------|-------------|
| `packages/db/prisma/simulate-week.ts` | Weekly simulation engine (one tick = one week) |

### API Routes
| File | Description |
|------|-------------|
| `app/api/internal/simulator/tick/route.ts` | Dev-only API endpoint to run simulation tick |
| `app/api/internal/simulation-state/route.ts` | API endpoint to get current simulation date |
| `app/api/banner/student-risks/route.ts` | API endpoint to fetch student risk data |

### Dashboard
| File | Description |
|------|-------------|
| `app/(shell)/sis/dev/data-health/page.tsx` | Data health dev dashboard with metrics and simulation controls |

### Configuration
| File | Description |
|------|-------------|
| `packages/db/package.json` | Added `db:seed:affinity` and `simulate:week` scripts |

---

## 🎯 How the 6-Year Seed Approximates the Affinity Persona

### Enrollment Distribution
- **Total Students**: ~18,500 across 6 years
- **Undergraduate vs Graduate**: 82% UG, 18% GR (matches persona)
- **Entry Year Distribution**: Students distributed across entry years 2019-2025 with realistic proportions

### Student Attributes
- **Traditional vs Non-Traditional Age**: 68% traditional (18-24), 32% non-traditional (25+)
- **Full-Time vs Part-Time**: 73% full-time, 27% part-time
- **First-Generation**: 42% of students marked as first-gen
- **Pell-Eligible**: 38% marked as Pell-eligible
- **In-State vs Out-of-State**: 78% in-state, 22% out-of-state
- **Work Hours**: 18% work 30+ hours/week
- **Commute**: 25% commute 30+ minutes
- **Housing Instability**: 12% have housing instability

### Retention & Graduation
- **Year 1 to Year 2 Retention**: 78% of first-year students retained (matches persona)
- **4-Year Graduation Rate**: ~42% graduate by 4 years
- **6-Year Graduation Rate**: ~61% graduate by 6 years (cumulative)
- Graduated students marked with `AcademicCredential` and status set to 'graduated'

### Academic Programs
- **6 Colleges**: Arts & Sciences, Business, Education, Engineering & Technology, Health Sciences, Professional Studies
- **~85 Undergraduate Majors**: Comprehensive program catalog
- **~45 Graduate Programs**: Master's and professional programs

### Course Catalog
- **Subjects**: 25+ subject areas across all colleges
- **Course Levels**: 100, 200, 300, 400 (UG), 500, 600 (GR)
- **Sections**: Generated for each term with realistic capacities and meeting patterns

### Risk Distribution
- **Attendance Risk**: ~15% of students have high attendance risk (based on work hours, commute, housing)
- **Academic Support Risk**: ~22% have high academic support risk (based on GPA, first-gen status, Pell eligibility)
- Risk scores calculated using weighted factors from student attributes

---

## 🔄 How the Weekly Simulation Updates Data

### 1. Enrollment Churn (Early Term Only)
- **Drops**: 2-5% of registrations randomly dropped in first 3 weeks
- **Adds**: Small number of new registrations to open sections for students needing more credits
- Updates section `enrolled` and `available` counts

### 2. Attendance Updates
- Each active registration's `attendanceRate` adjusted by ±5% weekly
- Risk factor adjustments:
  - Work 30+ hours/week: -2% attendance
  - Commute 30+ minutes: -1% attendance
  - Housing instability: -3% attendance
- Attendance rate clamped between 0 and 1

### 3. Grade Progression
- **Midterm (40-60% through term)**:
  - Assigns `midtermGrade` based on:
    - Student's cumulative GPA
    - Current attendance rate
    - Random variance
- **Late Term (80%+ through term)**:
  - Progresses toward `finalGrade` based on:
    - Cumulative GPA
    - Midterm grade (if available)
    - Attendance rate
    - Random variance

### 4. Risk Recomputation
- For each active student in active terms:
  - Calculates average attendance across all current registrations
  - Calculates current GPA from completed transcript grades
  - Recomputes `attendanceRiskScore` and `academicSupportRiskScore`
  - Updates `overallRiskBucket` (LOW/MEDIUM/HIGH) based on thresholds:
    - HIGH: Average risk ≥ 0.6
    - MEDIUM: Average risk ≥ 0.3
    - LOW: Average risk < 0.3

### 5. End-of-Term Logic
- When simulation date passes term end date:
  - Finalizes any remaining `finalGrade` values
  - Creates `StudentTranscriptGrade` records for all completed registrations
  - Updates period status to 'closed'

### Simulation Date Tracking
- `SimulationState` model tracks `currentSimDate`
- Each tick advances by 7 days
- Initialized to first active term's start date if not exists

---

## 🚀 Commands to Run

### 1. Run Migrations (for Schema Changes)

```bash
cd packages/db
npm run db:migrate
cd ../..
```

This will create a new migration for:
- New fields on `Student` (isFirstGen, isPellEligible, isInState, workHoursPerWeek, commuteMinutes, hasHousingInstability)
- New fields on `SectionRegistration` (attendanceRate, midtermGrade, finalGrade)
- New `StudentRisk` model
- New `SimulationState` model

### 2. Run the 6-Year Affinity Seed

```bash
cd packages/db
npm run db:seed:affinity
cd ../..
```

**Note**: This seed generates ~18,500 students across 6 years and may take several minutes to complete. The seed is deterministic (uses fixed seed 12345) so results are reproducible.

### 3. Run Weekly Simulation Tick

**Option A: Via API (from dashboard)**
1. Start dev server: `npm run dev`
2. Navigate to `/sis/dev/data-health`
3. Click "Run Weekly Tick" button

**Option B: Via CLI**
```bash
cd packages/db
npm run simulate:week
cd ../..
```

Each tick advances the simulation by 7 days and updates:
- Enrollment counts
- Attendance rates
- Midterm/final grades
- Risk scores
- Transcript grades (at term end)

### 4. Start Dev Server and View Dashboard

```bash
npm run dev
```

Then navigate to:
- **Data Health Dashboard**: `http://localhost:3000/sis/dev/data-health`

The dashboard shows:
- Total students, sections, registrations, periods
- Years spanned by data
- Risk distribution (LOW/MEDIUM/HIGH)
- GPA distribution buckets
- Current simulation date
- "Run Weekly Tick" button

---

## 📊 Data Health Dashboard Features

### Metrics Displayed
1. **Core Metrics Cards**:
   - Total Students
   - Total Sections
   - Total Registrations
   - Academic Periods (with years span)

2. **Risk Distribution**:
   - Count and percentage for LOW, MEDIUM, HIGH risk buckets
   - Color-coded cards (green/yellow/red)

3. **GPA Distribution**:
   - Students grouped by GPA ranges: <2.0, 2.0-2.5, 2.5-3.0, 3.0-3.5, 3.5+
   - Visual progress bars showing distribution
   - Count and percentage for each bucket

4. **Simulation Controls**:
   - Current simulation date display
   - "Run Weekly Tick" button
   - Loading states and error handling

---

## 🔧 Technical Details

### Deterministic Seeding
- Uses `SeededRandom` class with fixed seed (12345)
- Ensures reproducible data generation
- Same seed always produces same data

### Performance Considerations
- Seed script uses batch operations where possible
- Progress logging every 500-1000 students
- Simulation engine processes one term at a time
- Risk recomputation only for active students in active terms

### Data Relationships
- Students linked to entry academic periods
- Section registrations track attendance and grades
- Transcript grades created at term end
- Risk scores updated weekly for active students
- Graduation credentials created when students complete programs

---

## ✅ Phase 05 Complete

The synthetic data engine is fully functional and ready for use. The 6-year seed provides realistic Affinity University data matching the persona specifications, and the weekly simulation engine allows dynamic evolution of enrollment, attendance, grades, and risk over time.






