# Sections Resource Mapping

Maps Ethos `sections` resource to `Section` table.

## Section Table

| Ethos Field Path | DB Column / Relation | Type | Notes |
|------------------|----------------------|------|-------|
| `id` | `Section.id` | UUID | Primary key, Ethos GUID |
| `course.id` | `Section.courseId` | UUID (FK) | Foreign key to `Course.id` |
| `academicPeriod.id` | `Section.academicPeriodId` | UUID (FK) | Foreign key to `AcademicPeriod.id` |
| `number` | `Section.number` | String | Section number (e.g., "001", "002") |
| `title` | `Section.title` | String? | Section title (nullable, may override course title) |
| `crn` | `Section.crn` | String | Course Reference Number (unique per period) |
| `startOn` | `Section.startOn` | Date | Section start date |
| `endOn` | `Section.endOn` | Date | Section end date |
| `status` | `Section.status` | String | Section status (open, closed, cancelled) |
| `capacity` | `Section.capacity` | Int | Maximum enrollment capacity |
| `enrolled` | `Section.enrolled` | Int | Current enrollment count |
| `available` | `Section.available` | Int | Available seats (calculated or stored) |
| `waitlistCapacity` | `Section.waitlistCapacity` | Int? | Waitlist capacity (nullable) |
| `waitlistEnrolled` | `Section.waitlistEnrolled` | Int? | Current waitlist count (nullable) |
| `instructionalMethod.code` | `Section.instructionalMethodCode` | String? | Instructional method (LEC, LAB, etc.) |
| `instructionalMethod.title` | - | - | Not stored, can be looked up |
| `schedule.daysOfWeek` | `Section.daysOfWeek` | String[] | Array of days (e.g., ["monday", "wednesday"]) |
| `schedule.startTime` | `Section.startTime` | String? | Start time (e.g., "10:00") |
| `schedule.endTime` | `Section.endTime` | String? | End time (e.g., "10:50") |
| `schedule.room.building` | `Section.building` | String? | Building code (nullable) |
| `schedule.room.number` | `Section.roomNumber` | String? | Room number (nullable) |
| `credits.creditType` | `Section.creditType` | String | Credit type (institutional, etc.) |
| `credits.minimum` | `Section.creditsMinimum` | Decimal | Minimum credits for this section |
| `credits.maximum` | `Section.creditsMaximum` | Decimal | Maximum credits for this section |
| - | `Section.createdAt` | DateTime | Audit field (not from Ethos) |
| - | `Section.updatedAt` | DateTime | Audit field (not from Ethos) |

## Constraints

- Unique constraint on `(academicPeriodId, crn)` - CRN must be unique per period
- Alternative: Unique on `(courseId, academicPeriodId, number)` if section numbers are unique

## Relationships

- `Section.courseId` → `Course.id` (Many-to-One)
- `Section.academicPeriodId` → `AcademicPeriod.id` (Many-to-One)
- `SectionRegistration.sectionId` → `Section.id` (One-to-Many)

## Not Mapped (Phase 02)

- `instructors[]` - Instructor assignments (future phase, may need separate `SectionInstructor` table)






