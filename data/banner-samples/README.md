# Banner/Ethos Sample Payloads

This directory contains realistic synthetic JSON payloads representing Ellucian Banner resources accessed via the Ethos API.

## Resource Versions

These samples are based on **Ethos API v16** conventions, which align with Banner 9.x data structures.

## Conventions

- **IDs**: All resources use UUID/GUID strings (e.g., `"550e8400-e29b-41d4-a716-446655440000"`)
- **Field Naming**: Uses camelCase for most fields (e.g., `termCode`, `academicPeriod`)
- **Nested Objects**: Arrays like `names`, `addresses`, `emails`, `phones` are represented as arrays of objects
- **Effective Dating**: Some resources include `startOn` and `endOn` fields for effective dating
- **Metadata**: Ethos-specific fields like `_etag` and `_self` are omitted for clarity

## Resources Included

1. **persons.json** - Core person identity records (name, demographics, contact info)
2. **students.json** - Student-specific data linked to persons
3. **academic-periods.json** - Terms/semesters (Fall 2024, Spring 2025, etc.)
4. **courses.json** - Course catalog definitions
5. **sections.json** - Course delivery instances (specific class offerings)
6. **section-registrations.json** - Student enrollments in sections
7. **academic-programs.json** - Degree programs (majors, minors)
8. **student-academic-programs.json** - Student-program associations
9. **academic-credentials.json** - Degrees/awards earned by students
10. **student-transcript-grades.json** - Final grades for completed courses

## Usage

These samples serve as:
- Reference for field mapping documentation
- Examples for API response structure
- Test data for development
- Documentation of expected data shapes

## Notes

- All data is **synthetic** and represents **Affinity University (AU)**
- No real or sensitive information is included
- Fields included are those we intend to model in the database schema
- Some optional fields are included for completeness






