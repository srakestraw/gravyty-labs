# Students Resource Mapping

Maps Ethos `students` resource to `Student` table.

## Student Table

| Ethos Field Path | DB Column / Relation | Type | Notes |
|------------------|----------------------|------|-------|
| `id` | `Student.id` | UUID | Primary key, Ethos GUID |
| `person.id` | `Student.personId` | UUID (FK) | Foreign key to `Person.id` |
| `type` | `Student.type` | String | Student type (undergraduate, graduate, etc.) |
| `status` | `Student.status` | String | Student status (active, inactive, graduated, etc.) |
| `startOn` | `Student.startOn` | Date | Student start date |
| `entryAcademicPeriod.id` | `Student.entryAcademicPeriodId` | UUID (FK)? | Foreign key to `AcademicPeriod.id` (nullable) |
| `entryAcademicPeriod.code` | - | - | Stored via relation, not directly |
| `academicLevel` | `Student.academicLevel` | String | Academic level (freshman, sophomore, etc.) |
| `residency` | `Student.residency` | String | Residency status (in-state, out-of-state, etc.) |
| `studentClassification` | `Student.studentClassification` | String | Classification (full-time, part-time, etc.) |
| `studentLoad` | `Student.studentLoad` | String | Student load (full-time, part-time) |
| `academicStanding.code` | `Student.academicStandingCode` | String? | Academic standing code (nullable) |
| `academicStanding.title` | - | - | Not stored, can be looked up |
| `studentNumber` | `Student.studentNumber` | String | Unique student identifier |
| `studentId` | - | - | Same as `studentNumber`, not stored separately |
| - | `Student.createdAt` | DateTime | Audit field (not from Ethos) |
| - | `Student.updatedAt` | DateTime | Audit field (not from Ethos) |

## Relationships

- `Student.personId` → `Person.id` (Many-to-One)
- `Student.entryAcademicPeriodId` → `AcademicPeriod.id` (Many-to-One, nullable)

## Not Mapped (Phase 02)

- Financial aid information
- Transfer credits
- Academic history details (handled via `StudentTranscriptGrade`)






