# Student Transcript Grades Resource Mapping

Maps Ethos `student-transcript-grades` resource to `StudentTranscriptGrade` table.

## StudentTranscriptGrade Table

| Ethos Field Path | DB Column / Relation | Type | Notes |
|------------------|----------------------|------|-------|
| `id` | `StudentTranscriptGrade.id` | UUID | Primary key, Ethos GUID |
| `student.id` | `StudentTranscriptGrade.studentId` | UUID (FK) | Foreign key to `Student.id` |
| `sectionRegistration.id` | `StudentTranscriptGrade.sectionRegistrationId` | UUID (FK) | Foreign key to `SectionRegistration.id` |
| `section.id` | `StudentTranscriptGrade.sectionId` | UUID (FK) | Foreign key to `Section.id` |
| `academicPeriod.id` | `StudentTranscriptGrade.academicPeriodId` | UUID (FK) | Foreign key to `AcademicPeriod.id` |
| `course.id` | `StudentTranscriptGrade.courseId` | UUID (FK) | Foreign key to `Course.id` |
| `grade.scheme.code` | `StudentTranscriptGrade.gradeSchemeCode` | String? | Grade scheme code (nullable) |
| `grade.scheme.title` | - | - | Not stored, can be looked up |
| `grade.value` | `StudentTranscriptGrade.gradeValue` | String? | Grade value (A, B+, C, etc.) |
| `grade.title` | - | - | Not stored, can be looked up |
| `gradePoints` | `StudentTranscriptGrade.gradePoints` | Decimal? | Grade points (4.0, 3.3, etc.) |
| `qualityPoints` | `StudentTranscriptGrade.qualityPoints` | Decimal? | Quality points (credits × gradePoints) |
| `creditsAttempted` | `StudentTranscriptGrade.creditsAttempted` | Decimal | Credits attempted |
| `creditsEarned` | `StudentTranscriptGrade.creditsEarned` | Decimal | Credits earned |
| `finalGradeDate` | `StudentTranscriptGrade.finalGradeDate` | Date? | Date final grade was assigned (nullable) |
| `status` | `StudentTranscriptGrade.status` | String | Status (final, in-progress, incomplete) |
| `incomplete` | `StudentTranscriptGrade.incomplete` | Boolean | Is grade incomplete? |
| `repeat` | `StudentTranscriptGrade.repeat` | Boolean | Is this a repeated course? |
| - | `StudentTranscriptGrade.createdAt` | DateTime | Audit field (not from Ethos) |
| - | `StudentTranscriptGrade.updatedAt` | DateTime | Audit field (not from Ethos) |

## Relationships

- `StudentTranscriptGrade.studentId` → `Student.id` (Many-to-One)
- `StudentTranscriptGrade.sectionRegistrationId` → `SectionRegistration.id` (One-to-One)
- `StudentTranscriptGrade.sectionId` → `Section.id` (Many-to-One)
- `StudentTranscriptGrade.academicPeriodId` → `AcademicPeriod.id` (Many-to-One)
- `StudentTranscriptGrade.courseId` → `Course.id` (Many-to-One)

## Notes

- One grade record per section registration (1:1 relationship)
- Grade may be null if course is in progress
- Quality points are calculated as: `creditsEarned × gradePoints`






