# Section Registrations Resource Mapping

Maps Ethos `section-registrations` resource to `SectionRegistration` table.

## SectionRegistration Table

| Ethos Field Path | DB Column / Relation | Type | Notes |
|------------------|----------------------|------|-------|
| `id` | `SectionRegistration.id` | UUID | Primary key, Ethos GUID |
| `student.id` | `SectionRegistration.studentId` | UUID (FK) | Foreign key to `Student.id` |
| `section.id` | `SectionRegistration.sectionId` | UUID (FK) | Foreign key to `Section.id` |
| `academicPeriod.id` | `SectionRegistration.academicPeriodId` | UUID (FK) | Foreign key to `AcademicPeriod.id` |
| `status.code` | `SectionRegistration.statusCode` | String | Registration status (REG, DROP, WITHDRAW, etc.) |
| `status.title` | - | - | Not stored, can be looked up |
| `registrationDate` | `SectionRegistration.registrationDate` | DateTime | Full timestamp of registration |
| `registeredOn` | `SectionRegistration.registeredOn` | Date | Date of registration |
| `creditType` | `SectionRegistration.creditType` | String | Credit type (institutional, transfer, etc.) |
| `credits` | `SectionRegistration.credits` | Decimal | Credits for this registration |
| `gradingOption.code` | `SectionRegistration.gradingOptionCode` | String? | Grading option (GRAD, P/F, etc.) |
| `gradingOption.title` | - | - | Not stored, can be looked up |
| `academicLoad` | `SectionRegistration.academicLoad` | String? | Academic load (full-time, part-time) |
| `residencyStatus` | `SectionRegistration.residencyStatus` | String? | Residency status (nullable) |
| - | `SectionRegistration.createdAt` | DateTime | Audit field (not from Ethos) |
| - | `SectionRegistration.updatedAt` | DateTime | Audit field (not from Ethos) |

## Constraints

- Unique constraint on `(studentId, sectionId)` - A student can only register once per section

## Relationships

- `SectionRegistration.studentId` → `Student.id` (Many-to-One)
- `SectionRegistration.sectionId` → `Section.id` (Many-to-One)
- `SectionRegistration.academicPeriodId` → `AcademicPeriod.id` (Many-to-One)
- `StudentTranscriptGrade.sectionRegistrationId` → `SectionRegistration.id` (One-to-One)

## Not Mapped (Phase 02)

- Waitlist position
- Registration priority
- Registration holds/restrictions






