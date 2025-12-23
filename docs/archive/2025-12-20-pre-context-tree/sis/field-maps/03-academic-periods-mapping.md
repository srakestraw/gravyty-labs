# Academic Periods Resource Mapping

Maps Ethos `academic-periods` resource to `AcademicPeriod` table.

## AcademicPeriod Table

| Ethos Field Path | DB Column / Relation | Type | Notes |
|------------------|----------------------|------|-------|
| `id` | `AcademicPeriod.id` | UUID | Primary key, Ethos GUID |
| `code` | `AcademicPeriod.code` | String | Unique term code (e.g., "2024FA", "2025SP") |
| `title` | `AcademicPeriod.title` | String | Display title (e.g., "Fall 2024") |
| `type` | `AcademicPeriod.type` | String | Period type (term, year, etc.) |
| `startOn` | `AcademicPeriod.startOn` | Date | Period start date |
| `endOn` | `AcademicPeriod.endOn` | Date | Period end date |
| `censusOn` | `AcademicPeriod.censusOn` | Date? | Census date (nullable) |
| `registrationStartOn` | `AcademicPeriod.registrationStartOn` | Date? | Registration start date (nullable) |
| `registrationEndOn` | `AcademicPeriod.registrationEndOn` | Date? | Registration end date (nullable) |
| `academicYear` | `AcademicPeriod.academicYear` | String | Academic year (e.g., "2024-2025") |
| `status` | `AcademicPeriod.status` | String | Period status (active, closed, etc.) |
| - | `AcademicPeriod.createdAt` | DateTime | Audit field (not from Ethos) |
| - | `AcademicPeriod.updatedAt` | DateTime | Audit field (not from Ethos) |

## Constraints

- `AcademicPeriod.code` must be unique

## Relationships

- `Section.academicPeriodId` → `AcademicPeriod.id` (One-to-Many)
- `SectionRegistration.academicPeriodId` → `AcademicPeriod.id` (One-to-Many)
- `Student.entryAcademicPeriodId` → `AcademicPeriod.id` (One-to-Many, nullable)






