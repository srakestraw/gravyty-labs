# Academic Credentials Resource Mapping

Maps Ethos `academic-credentials` resource to `AcademicCredential` table.

## AcademicCredential Table

| Ethos Field Path | DB Column / Relation | Type | Notes |
|------------------|----------------------|------|-------|
| `id` | `AcademicCredential.id` | UUID | Primary key, Ethos GUID |
| `student.id` | `AcademicCredential.studentId` | UUID (FK) | Foreign key to `Student.id` |
| `credential.code` | `AcademicCredential.credentialCode` | String | Credential code (BS, BA, MS, etc.) |
| `credential.title` | - | - | Not stored, can be looked up |
| `academicProgram.id` | `AcademicCredential.academicProgramId` | UUID (FK)? | Foreign key to `AcademicProgram.id` (nullable) |
| `awardedOn` | `AcademicCredential.awardedOn` | Date | Date credential was awarded |
| `status` | `AcademicCredential.status` | String | Status (awarded, pending, revoked) |
| `academicPeriod.id` | `AcademicCredential.academicPeriodId` | UUID (FK)? | Foreign key to `AcademicPeriod.id` (nullable) |
| `academicPeriod.code` | - | - | Stored via relation, not directly |
| `honors[]` | - | - | Honors not stored in Phase 02 (future phase) |
| - | `AcademicCredential.createdAt` | DateTime | Audit field (not from Ethos) |
| - | `AcademicCredential.updatedAt` | DateTime | Audit field (not from Ethos) |

## Relationships

- `AcademicCredential.studentId` → `Student.id` (Many-to-One)
- `AcademicCredential.academicProgramId` → `AcademicProgram.id` (Many-to-One, nullable)
- `AcademicCredential.academicPeriodId` → `AcademicPeriod.id` (Many-to-One, nullable)

## Not Mapped (Phase 02)

- `honors[]` - Honors designations (summa cum laude, etc.) - future phase






