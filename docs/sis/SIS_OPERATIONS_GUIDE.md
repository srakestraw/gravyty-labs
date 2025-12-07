# SIS Operations Guide

A practical guide for setting up, maintaining, and operating the Affinity University SIS system.

---

## Environment Variables

### Required Variables

#### Database

**`DATABASE_URL`** (Required)
- **Format**: `postgresql://user:password@host:port/database`
- **Example**: `postgresql://postgres:password@localhost:5432/affinity_sis`
- **Location**: Repository root `.env.local` or `packages/db/.env`
- **Purpose**: Prisma connection string for PostgreSQL database

#### Firebase (For Portal Authentication)

**`NEXT_PUBLIC_FIREBASE_API_KEY`**
- Firebase project API key

**`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`**
- Firebase authentication domain (e.g., `project.firebaseapp.com`)

**`NEXT_PUBLIC_FIREBASE_PROJECT_ID`**
- Firebase project ID

**`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`**
- Firebase storage bucket

**`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`**
- Firebase messaging sender ID

**`NEXT_PUBLIC_FIREBASE_APP_ID`**
- Firebase app ID

**Note**: For SIS-only demos without authentication, Firebase variables may not be strictly required, but the Portal shell expects them.

---

## Database Configuration

### Local Development

1. **Install PostgreSQL** (if not already installed)
   - macOS: `brew install postgresql@14`
   - Linux: `sudo apt-get install postgresql`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)

2. **Create Database**:
   ```bash
   createdb affinity_sis
   ```

3. **Set DATABASE_URL**:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/affinity_sis"
   ```

### Remote Database

For production or shared environments:

1. **Get connection string** from your database provider (e.g., AWS RDS, Heroku Postgres, Supabase)

2. **Set DATABASE_URL** to the remote connection string

3. **SSL Configuration** (if required):
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   ```

---

## Commands Reference

### Database Operations

#### Generate Prisma Client
```bash
cd packages/db
npm run db:generate
```
**When**: After schema changes, before running migrations
**Time**: < 5 seconds

#### Run Migrations
```bash
cd packages/db
npm run db:migrate
```
**When**: After schema changes, on fresh database
**Time**: 10-30 seconds
**What it does**: Creates/updates database tables

#### Deploy Migrations (Production)
```bash
cd packages/db
npm run db:migrate:deploy
```
**When**: In production, after schema changes
**Note**: Use `db:migrate:deploy` in production (non-interactive), not `db:migrate`

#### Open Prisma Studio
```bash
cd packages/db
npm run db:studio
```
**When**: To browse/edit database data visually
**Opens**: `http://localhost:5555`

#### Reset Database
```bash
cd packages/db
npm run db:reset
```
**When**: To completely wipe and recreate database
**Warning**: Deletes all data!
**What it does**: Drops database, runs migrations, runs seed (if configured)

### Seeding

#### Minimal Seed (Test Data)
```bash
cd packages/db
npm run db:seed
```
**When**: Quick test data for development
**Time**: < 10 seconds
**What it creates**: 2 students, 2 courses, 2 sections, minimal data

#### 6-Year Affinity Seed
```bash
cd packages/db
npm run db:seed:affinity
```
**When**: Full demo dataset, initial setup
**Time**: 5-15 minutes
**What it creates**: ~18,500 students, 6 years of data, complete academic history

### Simulation

#### Run Weekly Simulation Tick
```bash
cd packages/db
npm run simulate:week
```
**When**: To advance simulation by one week
**Time**: 10-30 seconds
**What it does**:
- Advances simulation date by 7 days
- Updates attendance rates
- Progresses grades (midterm/final)
- Recomputes risk scores
- Handles enrollment churn
- Finalizes grades at term end

**Via API** (from dashboard):
```bash
POST http://localhost:3000/api/internal/simulator/tick
```

### Development Server

#### Start Dev Server
```bash
npm run dev
```
**When**: To run the application locally
**Opens**: `http://localhost:3000`
**Hot Reload**: Yes (automatic on file changes)

#### Build for Production
```bash
npm run build
```
**When**: Before deploying
**Time**: 1-3 minutes
**Output**: `.next` directory with optimized build

#### Start Production Server
```bash
npm run start
```
**When**: To run production build locally
**Requires**: Run `npm run build` first

### Code Quality

#### Lint
```bash
npm run lint
```
**When**: To check code quality
**Time**: 10-30 seconds

---

## Reset & Reseed Workflow

### Complete Reset

To completely wipe and start fresh:

```bash
# 1. Drop database and recreate
cd packages/db
npm run db:reset

# 2. Run Affinity seed
npm run db:seed:affinity

# 3. (Optional) Run simulation ticks
npm run simulate:week  # Run as many times as needed
```

**Warning**: `db:reset` will delete all data!

### Partial Reset (Keep Schema)

If you only want to reset data, not schema:

```bash
cd packages/db

# 1. Connect to database and truncate tables (manual SQL)
# Or use Prisma Studio to delete records

# 2. Run seed
npm run db:seed:affinity
```

### Reset Simulation State Only

To reset simulation date without reseeding:

```bash
# Connect to database
psql $DATABASE_URL

# Update simulation state
UPDATE simulation_state SET current_sim_date = '2024-08-26' WHERE id = (SELECT id FROM simulation_state LIMIT 1);
```

---

## Performance Expectations

### Seed Times

| Operation | Expected Time | Notes |
|-----------|---------------|-------|
| Minimal seed (`db:seed`) | < 10 seconds | 2 students, minimal data |
| 6-year Affinity seed (`db:seed:affinity`) | 5-15 minutes | ~18,500 students, 6 years |
| Migration (`db:migrate`) | 10-30 seconds | Depends on schema complexity |

**Factors affecting seed time**:
- Database performance (local vs remote)
- Network latency (for remote DB)
- Number of students (Affinity seed is large)
- CPU/memory available

### Simulation Times

| Operation | Expected Time | Notes |
|-----------|---------------|-------|
| Single weekly tick | 10-30 seconds | Depends on active students/terms |
| Multiple ticks (10) | 2-5 minutes | Linear scaling |

**Factors affecting simulation time**:
- Number of active students
- Number of active terms
- Number of registrations per student
- Database performance

### API Response Times

| Endpoint | Expected Time | Notes |
|----------|---------------|-------|
| `/api/banner/students` | < 1 second | All students |
| `/api/banner/sections` | < 1 second | Filtered by term |
| `/api/banner/student-transcript-grades` | < 2 seconds | With joins |
| `/api/banner/student-risks` | < 1 second | Current term |

**Optimization**: API responses are generally fast due to Prisma query optimization and indexing.

---

## Deployment Considerations

### Production Checklist

- [ ] Set `DATABASE_URL` to production database
- [ ] Set all Firebase environment variables
- [ ] Run `npm run build` to verify build succeeds
- [ ] Run `db:migrate:deploy` (not `db:migrate`) for migrations
- [ ] Seed production database with `db:seed:affinity` (if needed)
- [ ] Configure simulation state (if using simulation in production)
- [ ] Set up monitoring for API endpoints
- [ ] Configure backup strategy for database

### Environment-Specific Configuration

**Development**:
- Local PostgreSQL database
- `db:migrate` for schema changes
- `db:seed:affinity` for full dataset
- Simulation ticks for testing

**Staging**:
- Remote PostgreSQL database
- `db:migrate:deploy` for schema changes
- May use subset of Affinity seed
- Simulation ticks optional

**Production**:
- Production PostgreSQL database
- `db:migrate:deploy` only
- Real data (no synthetic seed)
- Simulation disabled (or read-only)

---

## Maintenance Tasks

### Weekly

- **Run simulation ticks** (if using simulation):
  ```bash
  cd packages/db
  npm run simulate:week  # Run multiple times as needed
  ```

### Monthly

- **Check database size**: Monitor growth
- **Review API performance**: Check response times
- **Update dependencies**: `npm update` (test first)

### As Needed

- **Schema changes**: Run migrations
- **Data fixes**: Use Prisma Studio or direct SQL
- **Reset simulation**: Update `simulation_state` table

---

## Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`
- Check PostgreSQL is running: `pg_isready`
- Verify `DATABASE_URL` is correct
- Check firewall/network for remote databases

**Error**: `Authentication failed`
- Verify username/password in `DATABASE_URL`
- Check database user permissions

### Migration Issues

**Error**: `Migration failed`
- Check Prisma schema syntax
- Verify database connection
- Review migration SQL in `packages/db/prisma/migrations/`

### Seed Issues

**Error**: `Seed failed` or timeout
- Check database connection
- Verify sufficient database resources
- Try minimal seed first (`db:seed`) to isolate issue
- Check logs for specific error

### Simulation Issues

**Error**: `Simulation failed`
- Verify `SimulationState` record exists
- Check active academic periods
- Review logs for specific error
- Ensure database connection is stable

---

## Backup & Recovery

### Database Backup

**PostgreSQL dump**:
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

**Restore**:
```bash
psql $DATABASE_URL < backup_20240101.sql
```

### Prisma Migrations Backup

Migrations are in `packages/db/prisma/migrations/` - keep this directory in version control.

---

## Security Considerations

- **Never commit `.env.local`** - contains sensitive credentials
- **Use strong database passwords** in production
- **Limit database access** - use read-only users where possible
- **Enable SSL** for remote database connections
- **Rotate credentials** periodically

---

**For questions or issues, refer to the [SIS README](./SIS_README.md) or [Demo Runbook](./SIS_DEMO_RUNBOOK.md).**






