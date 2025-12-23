# Detailed Entity Relationships

This document describes the cardinalities, constraints, and important relationships in the Affinity University SIS database schema.

## Person & Contact Information

### Person → PersonName
- **Cardinality**: One-to-Many (1:N)
- **Relationship**: A Person can have multiple PersonName records (legal, preferred, nickname, etc.)
- **Constraints**: 
  - `PersonName.personId` is required (foreign key to `Person.id`)
  - At least one PersonName should be marked as `preferred = true`
- **Notes**: The `type` field distinguishes name types (legal, preferred, etc.)

### Person → EmailAddress
- **Cardinality**: One-to-Many (1:N)
- **Relationship**: A Person can have multiple EmailAddress records
- **Constraints**:
  - `EmailAddress.personId` is required
  - `EmailAddress.address` must be unique (or unique per person)
  - One email should be marked as `preferred = true`
- **Notes**: Common types include "personal", "institutional", "work"

### Person → Phone
- **Cardinality**: One-to-Many (1:N)
- **Relationship**: A Person can have multiple Phone records
- **Constraints**:
  - `Phone.personId` is required
  - One phone should be marked as `preferred = true`
- **Notes**: Common types include "mobile", "home", "work"

### Person → Address
- **Cardinality**: One-to-Many (1:N)
- **Relationship**: A Person can have multiple Address records
- **Constraints**:
  - `Address.personId` is required
- **Notes**: Common types include "home", "mailing", "billing"

### Person → Student
- **Cardinality**: One-to-One (1:1) - Optional
- **Relationship**: A Person may be a Student (not all persons are students)
- **Constraints**:
  - `Student.personId` is required and unique (one Student per Person)
  - `Student.studentNumber` must be unique
- **Notes**: Faculty, staff, and other non-student persons exist in the Person table

## Student Relationships

### Student → SectionRegistration
- **Cardinality**: One-to-Many (1:N)
- **Relationship**: A Student can enroll in multiple Sections
- **Constraints**:
  - `SectionRegistration.studentId` is required
  - Unique constraint on `(studentId, sectionId)` - a student can only register once per section
- **Notes**: Status codes track registration state (REG, DROP, WITHDRAW)

### Student → StudentAcademicProgram
- **Cardinality**: One-to-Many (1:N)
- **Relationship**: A Student can pursue multiple Academic Programs (major + minor, double major, etc.)
- **Constraints**:
  - `StudentAcademicProgram.studentId` is required
  - `StudentAcademicProgram.academicProgramId` is required
  - At least one program should be marked as `primary = true`
- **Notes**: Junction table enabling many-to-many relationship

### Student → AcademicCredential
- **Cardinality**: One-to-Many (1:N)
- **Relationship**: A Student can earn multiple credentials (degrees, certificates)
- **Constraints**:
  - `AcademicCredential.studentId` is required
- **Notes**: Tracks awarded degrees and certificates

### Student → StudentTranscriptGrade
- **Cardinality**: One-to-Many (1:N)
- **Relationship**: A Student receives grades for multiple courses
- **Constraints**:
  - `StudentTranscriptGrade.studentId` is required
- **Notes**: Historical grade records

## Academic Structure

### AcademicPeriod → Section
- **Cardinality**: One-to-Many (1:N)
- **Relationship**: An AcademicPeriod contains multiple Sections
- **Constraints**:
  - `Section.academicPeriodId` is required
  - `AcademicPeriod.code` must be unique (e.g., "2024FA", "2025SP")
- **Notes**: Sections are specific to a term/semester

### AcademicPeriod → SectionRegistration
- **Cardinality**: One-to-Many (1:N)
- **Relationship**: An AcademicPeriod tracks multiple registrations
- **Constraints**:
  - `SectionRegistration.academicPeriodId` is required
- **Notes**: Redundant but useful for querying all registrations in a period

### AcademicPeriod → StudentTranscriptGrade
- **Cardinality**: One-to-Many (1:N)
- **Relationship**: An AcademicPeriod contains multiple grade records
- **Constraints**:
  - `StudentTranscriptGrade.academicPeriodId` is required
- **Notes**: Redundant but useful for querying all grades in a period

### Course → Section
- **Cardinality**: One-to-Many (1:N)
- **Relationship**: A Course can be offered as multiple Sections
- **Constraints**:
  - `Section.courseId` is required
  - Course unique on `(subjectCode, number, catalogYear)` if catalogYear is included
- **Notes**: Same course offered in different terms or sections

### Course → StudentTranscriptGrade
- **Cardinality**: One-to-Many (1:N)
- **Relationship**: A Course can have multiple grade records (different students, different terms)
- **Constraints**:
  - `StudentTranscriptGrade.courseId` is required
- **Notes**: Redundant but useful for querying all grades for a course

## Enrollment & Grades

### Section → SectionRegistration
- **Cardinality**: One-to-Many (1:N)
- **Relationship**: A Section can have multiple enrolled Students
- **Constraints**:
  - `SectionRegistration.sectionId` is required
  - Unique constraint on `(studentId, sectionId)`
  - `Section.enrolled` count should match number of active registrations
- **Notes**: Capacity and enrollment tracking

### Section → StudentTranscriptGrade
- **Cardinality**: One-to-Many (1:N)
- **Relationship**: A Section can have multiple grade records (one per student)
- **Constraints**:
  - `StudentTranscriptGrade.sectionId` is required
- **Notes**: Redundant but useful for querying all grades in a section

### SectionRegistration → StudentTranscriptGrade
- **Cardinality**: One-to-One (1:1)
- **Relationship**: Each SectionRegistration has exactly one StudentTranscriptGrade record
- **Constraints**:
  - `StudentTranscriptGrade.sectionRegistrationId` is required and unique
  - One grade record per registration
- **Notes**: Grade may be null if course is in progress

## Academic Programs

### AcademicProgram → StudentAcademicProgram
- **Cardinality**: One-to-Many (1:N)
- **Relationship**: An AcademicProgram can have multiple Students
- **Constraints**:
  - `StudentAcademicProgram.academicProgramId` is required
  - `AcademicProgram.code` must be unique
- **Notes**: Junction table enabling many-to-many relationship

### AcademicProgram → AcademicCredential
- **Cardinality**: One-to-Many (1:N)
- **Relationship**: An AcademicProgram can award multiple Credentials
- **Constraints**:
  - `AcademicCredential.academicProgramId` is optional (some credentials may not be program-specific)
- **Notes**: Tracks which program a credential was awarded for

## Uniqueness Constraints Summary

1. **AcademicPeriod.code** - Unique term codes
2. **Student.studentNumber** - Unique student identifiers
3. **AcademicProgram.code** - Unique program codes
4. **Section.crn** + **Section.academicPeriodId** - CRN unique per period
5. **SectionRegistration(studentId, sectionId)** - One registration per student per section
6. **StudentTranscriptGrade.sectionRegistrationId** - One grade per registration

## Index Recommendations

- `Person.id` (primary key, indexed automatically)
- `Student.personId` (foreign key, for joins)
- `Student.studentNumber` (unique lookup)
- `Section.academicPeriodId` (for period queries)
- `Section.courseId` (for course queries)
- `SectionRegistration.studentId` (for student enrollment queries)
- `SectionRegistration.sectionId` (for section enrollment queries)
- `SectionRegistration.academicPeriodId` (for period enrollment queries)
- `StudentTranscriptGrade.studentId` (for transcript queries)
- `StudentTranscriptGrade.sectionRegistrationId` (unique lookup)






