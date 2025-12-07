# Academic Programs Resource Mapping

Maps Ethos `academic-programs` resource to `AcademicProgram` and `StudentAcademicProgram` tables.

## AcademicProgram Table

| Ethos Field Path | DB Column / Relation | Type | Notes |
|------------------|----------------------|------|-------|
| `id` | `AcademicProgram.id` | UUID | Primary key, Ethos GUID |
| `code` | `AcademicProgram.code` | String | Unique program code (e.g., "CS-BS", "MATH-BS") |
| `title` | `AcademicProgram.title` | String | Program title |
| `type` | `AcademicProgram.type` | String | Program type (major, minor, certificate) |
| `level` | `AcademicProgram.level` | String | Program level (undergraduate, graduate) |
| `degree.code` | `AcademicProgram.degreeCode` | String? | Degree code (BS, BA, MS, etc.) |
| `degree.title` | - | - | Not stored, can be looked up |
| `status` | `AcademicProgram.status` | String | Program status (active, inactive) |
| `startOn` | `AcademicProgram.startOn` | Date? | Program effective start date (nullable) |
| `endOn` | `AcademicProgram.endOn` | Date? | Program effective end date (nullable) |
| `accreditation.code` | `AcademicProgram.accreditationCode` | String? | Accreditation code (nullable) |
| `accreditation.title` | - | - | Not stored, can be looked up |
| `creditsRequired` | `AcademicProgram.creditsRequired` | Int | Total credits required for program |
| `description` | `AcademicProgram.description` | String? | Program description (nullable) |
| - | `AcademicProgram.createdAt` | DateTime | Audit field (not from Ethos) |
| - | `AcademicProgram.updatedAt` | DateTime | Audit field (not from Ethos) |

## StudentAcademicProgram Table (Junction)

| Ethos Field Path | DB Column / Relation | Type | Notes |
|------------------|----------------------|------|-------|
| `id` | `StudentAcademicProgram.id` | UUID | Primary key, Ethos GUID |
| `student.id` | `StudentAcademicProgram.studentId` | UUID (FK) | Foreign key to `Student.id` |
| `academicProgram.id` | `StudentAcademicProgram.academicProgramId` | UUID (FK) | Foreign key to `AcademicProgram.id` |
| `startOn` | `StudentAcademicProgram.startOn` | Date | Student program start date |
| `endOn` | `StudentAcademicProgram.endOn` | Date? | Student program end date (nullable) |
| `status` | `StudentAcademicProgram.status` | String | Status (active, completed, withdrawn) |
| `catalogYear` | `StudentAcademicProgram.catalogYear` | String? | Catalog year (nullable) |
| `primary` | `StudentAcademicProgram.primary` | Boolean | Is this the primary program? |
| - | `StudentAcademicProgram.createdAt` | DateTime | Audit field (not from Ethos) |
| - | `StudentAcademicProgram.updatedAt` | DateTime | Audit field (not from Ethos) |

## Constraints

- `AcademicProgram.code` must be unique
- `StudentAcademicProgram` unique on `(studentId, academicProgramId)` if one student can only have one active program record

## Relationships

- `StudentAcademicProgram.studentId` → `Student.id` (Many-to-One)
- `StudentAcademicProgram.academicProgramId` → `AcademicProgram.id` (Many-to-One)
- `AcademicCredential.academicProgramId` → `AcademicProgram.id` (Many-to-One)






