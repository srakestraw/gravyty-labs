# Courses Resource Mapping

Maps Ethos `courses` resource to `Course` table.

## Course Table

| Ethos Field Path | DB Column / Relation | Type | Notes |
|------------------|----------------------|------|-------|
| `id` | `Course.id` | UUID | Primary key, Ethos GUID |
| `subject.code` | `Course.subjectCode` | String | Subject code (e.g., "CS", "MATH") |
| `subject.title` | - | - | Not stored, can be looked up if needed |
| `number` | `Course.number` | String | Course number (e.g., "101", "201") |
| `title` | `Course.title` | String | Course title |
| `description` | `Course.description` | String? | Course description (nullable) |
| `credits.creditType` | `Course.creditType` | String | Credit type (institutional, transfer, etc.) |
| `credits.minimum` | `Course.creditsMinimum` | Decimal | Minimum credits |
| `credits.maximum` | `Course.creditsMaximum` | Decimal | Maximum credits |
| `credits.increment` | `Course.creditsIncrement` | Decimal? | Credit increment (nullable) |
| `courseLevel` | `Course.courseLevel` | String | Course level (undergraduate, graduate) |
| `status` | `Course.status` | String | Course status (active, inactive) |
| `effectiveStartDate` | `Course.effectiveStartDate` | Date? | Effective start date (nullable) |
| `effectiveEndDate` | `Course.effectiveEndDate` | Date? | Effective end date (nullable) |
| `catalogYear` | `Course.catalogYear` | String? | Catalog year (nullable, e.g., "2024-2025") |
| - | `Course.createdAt` | DateTime | Audit field (not from Ethos) |
| - | `Course.updatedAt` | DateTime | Audit field (not from Ethos) |

## Constraints

- Unique constraint on `(subjectCode, number, catalogYear)` if catalogYear is included
- Alternative: Unique on `(subjectCode, number)` if catalogYear is not part of uniqueness

## Relationships

- `Section.courseId` → `Course.id` (One-to-Many)

## Not Mapped (Phase 02)

- `prerequisites[]` - Prerequisite relationships (future phase)
- `corequisites[]` - Corequisite relationships (future phase)






