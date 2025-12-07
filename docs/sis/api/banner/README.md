# Banner-Compatible API Documentation

This directory contains documentation for the Banner-compatible API endpoints that expose Affinity University SIS data in Ellucian Banner/Ethos format.

## Overview

The Banner API provides read-only endpoints that return data in the same JSON structure as Ellucian Banner's Ethos API. This allows front-end applications and integrations to consume the data seamlessly without modification.

## Base URL

All endpoints are prefixed with `/api/banner/`:

```
http://localhost:3000/api/banner/{resource}
```

## Resources

### Core Resources

1. **Persons** - `/api/banner/persons`
2. **Students** - `/api/banner/students`
3. **Academic Periods** - `/api/banner/academic-periods`
4. **Courses** - `/api/banner/courses`
5. **Sections** - `/api/banner/sections`
6. **Section Registrations** - `/api/banner/section-registrations`
7. **Academic Programs** - `/api/banner/academic-programs`
8. **Student Academic Programs** - `/api/banner/student-academic-programs`
9. **Academic Credentials** - `/api/banner/academic-credentials`
10. **Student Transcript Grades** - `/api/banner/student-transcript-grades`

## Query Parameters

All endpoints support filtering via query parameters. Common patterns:

- `?id={uuid}` - Filter by resource ID
- `?student={uuid}` - Filter by student ID (for student-related resources)
- `?academicPeriod={uuid}` or `?termCode={code}` - Filter by academic period
- `?status={status}` - Filter by status code

See individual resource documentation for specific query parameters.

## Response Format

All endpoints return JSON arrays of resources, matching the Ethos API format:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    // ... resource fields
  }
]
```

## Error Handling

Errors are returned in the following format:

```json
{
  "error": "Internal server error"
}
```

HTTP status codes:
- `200` - Success
- `500` - Internal server error

## Data Mapping

The API automatically converts Prisma database models to Banner/Ethos JSON format using mappers in `packages/contracts/src/mappers.ts`. All UUIDs are preserved, and relationships are flattened into nested objects as per Ethos conventions.

## Validation

All responses are validated against Zod schemas defined in `packages/contracts/src/schemas/` to ensure they match the expected Banner format.

## Examples

### Get all students
```bash
GET /api/banner/students
```

### Get sections for a specific term
```bash
GET /api/banner/sections?termCode=2024FA
```

### Get registrations for a student
```bash
GET /api/banner/section-registrations?student={studentId}
```

### Get transcript grades for a student
```bash
GET /api/banner/student-transcript-grades?student={studentId}
```

## Implementation Details

- **Service Layer**: `lib/banner/services/` - Business logic and data fetching
- **Mappers**: `packages/contracts/src/mappers.ts` - Prisma → Banner conversion
- **Schemas**: `packages/contracts/src/schemas/` - Zod validation schemas
- **Routes**: `app/api/banner/` - Next.js API route handlers

## Related Documentation

- Field mappings: `docs/sis/field-maps/`
- ERD: `docs/sis/erd-overview.md`
- Sample payloads: `data/banner-samples/`






