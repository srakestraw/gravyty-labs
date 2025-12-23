# Field Mapping Documentation

This directory contains detailed field mappings from Ellucian Banner/Ethos API resources to our Prisma database schema.

## Mapping Conventions

- **DB Column Naming**: Uses camelCase (e.g., `termCode`, `academicPeriodId`)
- **Nested Arrays**: Arrays like `names[]`, `addresses[]`, `emails[]`, `phones[]` map to separate tables with foreign keys
- **Foreign Keys**: References to other resources use `{resource}Id` naming (e.g., `personId`, `studentId`)
- **UUIDs**: All primary keys are UUIDs, aligned with Ethos GUIDs
- **Timestamps**: `createdAt` and `updatedAt` are added to core tables (not from Ethos)

## Mapping Files

1. **01-persons-mapping.md** - Person core identity and demographics
2. **02-students-mapping.md** - Student-specific data
3. **03-academic-periods-mapping.md** - Terms/semesters
4. **04-courses-mapping.md** - Course catalog
5. **05-sections-mapping.md** - Section/class instances
6. **06-section-registrations-mapping.md** - Student enrollments
7. **07-academic-programs-mapping.md** - Degree programs
8. **08-academic-credentials-mapping.md** - Degrees/awards
9. **09-student-transcript-grades-mapping.md** - Final grades

## Notes

- Fields marked as "Not Mapped" are either not needed for Phase 02 or will be handled in later phases
- Some Ethos metadata fields (`_etag`, `_self`) are omitted
- Effective dating fields may be added in future phases if historical tracking is required






