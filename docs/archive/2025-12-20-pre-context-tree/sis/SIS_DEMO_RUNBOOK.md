# SIS Demo Runbook

A step-by-step guide for demonstrating the Affinity University SIS, from initial setup through live demo scenarios.

---

## Section 1 – Pre-Demo Setup

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running (local or remote)
- Git repository cloned
- Terminal access

### Step 1: Install Dependencies

```bash
# From repository root
npm install
```

### Step 2: Environment Setup

Create a `.env.local` file in the repository root (or update existing):

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/affinity_sis"

# Firebase (for authentication - required for Portal)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Note**: For demo purposes, you may be able to run without full Firebase setup if authentication is bypassed, but full setup is recommended.

### Step 3: Database Migration

```bash
cd packages/db
npm run db:migrate
cd ../..
```

This creates all database tables based on the Prisma schema.

### Step 4: Seed 6 Years of Affinity Data

```bash
cd packages/db
npm run db:seed:affinity
cd ../..
```

**Expected Time**: 5-15 minutes (generates ~18,500 students)

**What it does**:
- Creates 6 years of academic periods (2019-2025)
- Generates ~85 undergraduate and ~45 graduate programs
- Creates course catalog with sections for each term
- Generates ~18,500 students with realistic attributes
- Creates enrollment history and transcript grades
- Calculates initial risk scores

**Verification**: You should see output like:
```
✅ Affinity University 6-Year Seed completed successfully!
   - 18 academic periods
   - 130 academic programs
   - [X] courses
   - [Y] sections
   - [Z] students
   - [W] section registrations
   - [V] transcript grades
```

### Step 5: Run Initial Simulation Ticks (Optional)

To get interesting state for the demo, run a few weekly simulation ticks:

```bash
cd packages/db
npm run simulate:week  # Run once
npm run simulate:week  # Run again (advances another week)
npm run simulate:week  # Run a third time
cd ../..
```

**Why**: This advances the simulation date and updates attendance, grades, and risk scores, making the demo more dynamic.

**Expected Time**: 10-30 seconds per tick

### Step 6: Verify Setup

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Check API health**:
   - Open `http://localhost:3000/api/health`
   - Should return `{"status":"healthy"}`

3. **Check Banner API**:
   - Open `http://localhost:3000/api/banner/academic-periods`
   - Should return JSON array of academic periods

4. **Check database**:
   ```bash
   cd packages/db
   npm run db:studio
   ```
   - Opens Prisma Studio at `http://localhost:5555`
   - Browse tables to verify data

---

## Section 2 – Live Demo Script

### Demo Overview (5-15 minutes)

**Narrative Arc**:
1. Show Affinity University at a glance
2. Explore sections and enrollment
3. Drill into a student's complete profile
4. Demonstrate risk indicators
5. Show data health and simulation

---

### Step 1: Open SIS Main Page

**URL**: `http://localhost:3000/sis`

**What to Show**:
- Affinity University SIS header with logo
- Term & Section Explorer interface
- Current term selected (e.g., "Fall 2024 (2024FA)")

**What to Say**:
> "This is the Affinity University Student Information System. We have 6 years of comprehensive student data, from 2019 through 2025. The system is Banner-compatible, meaning it follows Ellucian Banner's Ethos API structure, making it easy to integrate with existing Banner systems."

**Action**: Point out the term selector and subject filter.

---

### Step 2: Explore Sections

**What to Show**:
- Select a term (e.g., "Fall 2024")
- Optionally filter by subject (e.g., "Computer Science")
- Scroll through the section list

**What to Say**:
> "Here we can see all sections for the selected term. Each section shows the CRN, course code, title, instructor, meeting schedule, room, and enrollment status. Notice the color-coded enrollment indicators - green for open, yellow for nearly full, red for closed."

**Action**:
- Point out enrollment counts (e.g., "25/30 enrolled")
- Show different meeting patterns (MWF, TR, etc.)
- Highlight sections with high enrollment

**Demo Tip**: If you filtered by subject, clear the filter to show the full breadth of courses.

---

### Step 3: Open Student 360 View

**What to Show**:
- Navigate to a student view (e.g., `/sis/students/{studentId}`)
- Show student information card
- Show current schedule
- Show academic history

**What to Say**:
> "This is the Student 360 view - a complete profile for a single student. We can see their basic information, current term schedule, and complete academic history. Notice the academic programs listed - students can have multiple programs, with one marked as primary."

**Action**:
- Scroll through the current schedule
- Expand academic history to show past terms
- Point out GPA calculation
- Show term-by-term progression

**How to Get a Student ID**:
- Option 1: From the API: `http://localhost:3000/api/banner/students` (pick an `id`)
- Option 2: From Prisma Studio (browse `students` table)
- Option 3: From section registrations: `http://localhost:3000/api/banner/section-registrations` (get `student.id`)

**Demo Tip**: Choose a student with interesting history (multiple terms, varied grades, risk indicators).

---

### Step 4: Highlight Risk Indicators

**What to Show**:
- Student attributes (first-gen, Pell-eligible, work hours, commute)
- Risk scores (if visible in UI)
- Attendance rates in current schedule

**What to Say**:
> "Affinity University has a diverse student population. We track risk factors like first-generation status, Pell eligibility, work hours, commute time, and housing stability. These factors influence attendance rates and academic performance. The system calculates risk scores weekly to identify students who may need additional support."

**Action**:
- Point out risk-related attributes
- Show attendance rates in section registrations
- Explain how risk factors affect attendance

**Demo Tip**: If available, show a high-risk student vs. a low-risk student for contrast.

---

### Step 5: Open Data Health Dashboard

**URL**: `http://localhost:3000/sis/dev/data-health`

**What to Show**:
- Core metrics (students, sections, registrations, periods)
- Risk distribution (LOW/MEDIUM/HIGH)
- GPA distribution buckets
- Current simulation date

**What to Say**:
> "The Data Health Dashboard gives us an aggregate view of the entire system. We can see the total number of students, sections, and registrations across all 6 years. The risk distribution shows how many students fall into each risk bucket. The GPA distribution shows the academic performance spread across the student population."

**Action**:
- Point out the years spanned (e.g., "2019-2025")
- Highlight risk distribution percentages
- Show GPA distribution bars

---

### Step 6: Run Weekly Simulation Tick

**What to Show**:
- Click "Run Weekly Tick" button
- Wait for completion (watch loading state)
- Refresh the page
- Observe metric changes

**What to Say**:
> "The simulation engine advances time by one week per tick. Each tick updates attendance rates, progresses grades toward midterm or final, recomputes risk scores, and handles enrollment churn. Let's run one tick and see how the data evolves."

**Action**:
1. Click "Run Weekly Tick"
2. Wait 10-30 seconds
3. Refresh the dashboard
4. Compare metrics:
   - Risk distribution may shift
   - GPA distribution may change slightly
   - Simulation date advances by 7 days

**What Happens**:
- Attendance rates adjust based on risk factors
- Grades progress (midterm grades assigned if at midterm point)
- Risk scores recomputed
- Enrollment may change (drops/adds in early term)

**Demo Tip**: Run 2-3 ticks to show more noticeable changes, especially if approaching midterm or end of term.

---

## Section 3 – Demo Variations

### Variation 1: High-Risk Student Journey

**Setup**: Find a student with high risk indicators (work 30+ hours, long commute, housing instability).

**Narrative**:
1. Show the student's profile
2. Point out risk factors
3. Show lower attendance rates
4. Show impact on grades
5. Explain how the system identifies these students for intervention

**Student Selection**: Query for students with `overallRiskBucket: 'HIGH'` in risk data.

---

### Variation 2: Improving Student

**Setup**: Find a student with improving GPA over time.

**Narrative**:
1. Show academic history
2. Point out GPA trend (e.g., 2.5 → 2.8 → 3.1)
3. Show improving attendance
4. Explain how the system tracks progress

**Student Selection**: Look for students with upward GPA trend in transcript grades.

---

### Variation 3: Term Progression

**Setup**: Run multiple simulation ticks to advance through a term.

**Narrative**:
1. Start at term beginning (week 1)
2. Show initial enrollment
3. Run ticks to midterm (weeks 4-6)
4. Show midterm grades appearing
5. Run ticks to end of term (weeks 12-15)
6. Show final grades and transcript creation

**Timeline**: A full term is ~15 weeks, so you'd need ~15 ticks to go through a complete term.

---

### Variation 4: Enrollment Churn

**Setup**: Run ticks during early term (first 3 weeks).

**Narrative**:
1. Show initial enrollment counts
2. Run 1-2 ticks
3. Show dropped registrations
4. Show new registrations added
5. Explain add/drop patterns

---

## Demo Tips

### Before the Demo
- **Test the flow**: Run through the demo once yourself
- **Have student IDs ready**: Pre-select 2-3 interesting students
- **Check simulation date**: Know where you are in the academic calendar
- **Verify API**: Ensure all endpoints are responding

### During the Demo
- **Keep it conversational**: Don't read slides, tell a story
- **Handle errors gracefully**: If something breaks, explain it's a demo system
- **Use real numbers**: Reference actual counts and percentages
- **Show, don't tell**: Let the UI speak for itself

### After the Demo
- **Q&A preparation**: Be ready to discuss:
  - How risk scores are calculated
  - How the simulation works
  - How to extend the system
  - Integration possibilities

---

## Troubleshooting

### Issue: Database connection error
**Solution**: Check `DATABASE_URL` in `.env.local`, ensure PostgreSQL is running

### Issue: Seed takes too long
**Solution**: This is normal (5-15 minutes). Consider running in background or using a smaller seed for quick demos.

### Issue: API returns empty arrays
**Solution**: Verify seed completed successfully, check database with Prisma Studio

### Issue: Simulation tick fails
**Solution**: Check that simulation state exists, verify database connection

### Issue: Student 360 view not loading
**Solution**: Verify student ID is valid, check API endpoint directly

---

**Ready to demo!** 🎬






