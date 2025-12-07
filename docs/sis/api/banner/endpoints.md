# Banner API Endpoints Reference

## Persons

**Endpoint**: `GET /api/banner/persons`

**Query Parameters**:
- `id` (string, UUID) - Filter by person ID

**Example**:
```bash
GET /api/banner/persons
GET /api/banner/persons?id=550e8400-e29b-41d4-a716-446655440001
```

**Response**: Array of Person objects

---

## Students

**Endpoint**: `GET /api/banner/students`

**Query Parameters**:
- `id` (string, UUID) - Filter by student ID
- `person` (string, UUID) - Filter by person ID
- `studentNumber` (string) - Filter by student number

**Example**:
```bash
GET /api/banner/students
GET /api/banner/students?studentNumber=STU2022001
```

**Response**: Array of Student objects

---

## Academic Periods

**Endpoint**: `GET /api/banner/academic-periods`

**Query Parameters**:
- `id` (string, UUID) - Filter by period ID
- `code` (string) - Filter by period code (e.g., "2024FA")
- `status` (string) - Filter by status (e.g., "active", "closed")

**Example**:
```bash
GET /api/banner/academic-periods
GET /api/banner/academic-periods?code=2024FA
GET /api/banner/academic-periods?status=active
```

**Response**: Array of AcademicPeriod objects

---

## Courses

**Endpoint**: `GET /api/banner/courses`

**Query Parameters**:
- `id` (string, UUID) - Filter by course ID
- `subject` (string) - Filter by subject code (e.g., "CS", "MATH")
- `number` (string) - Filter by course number (e.g., "101")
- `status` (string) - Filter by status (e.g., "active", "inactive")

**Example**:
```bash
GET /api/banner/courses
GET /api/banner/courses?subject=CS
GET /api/banner/courses?subject=CS&number=101
```

**Response**: Array of Course objects

---

## Sections

**Endpoint**: `GET /api/banner/sections`

**Query Parameters**:
- `id` (string, UUID) - Filter by section ID
- `course` (string, UUID) - Filter by course ID
- `academicPeriod` (string, UUID) - Filter by academic period ID
- `termCode` (string) - Filter by academic period code (e.g., "2024FA")
- `crn` (string) - Filter by Course Reference Number
- `status` (string) - Filter by status (e.g., "open", "closed")

**Example**:
```bash
GET /api/banner/sections
GET /api/banner/sections?termCode=2024FA
GET /api/banner/sections?course={courseId}&termCode=2024FA
```

**Response**: Array of Section objects

---

## Section Registrations

**Endpoint**: `GET /api/banner/section-registrations`

**Query Parameters**:
- `id` (string, UUID) - Filter by registration ID
- `student` (string, UUID) - Filter by student ID
- `section` (string, UUID) - Filter by section ID
- `academicPeriod` (string, UUID) - Filter by academic period ID
- `termCode` (string) - Filter by academic period code
- `status` (string) - Filter by status code (e.g., "REG", "DROP")

**Example**:
```bash
GET /api/banner/section-registrations?student={studentId}
GET /api/banner/section-registrations?student={studentId}&termCode=2024FA
```

**Response**: Array of SectionRegistration objects

---

## Academic Programs

**Endpoint**: `GET /api/banner/academic-programs`

**Query Parameters**:
- `id` (string, UUID) - Filter by program ID
- `code` (string) - Filter by program code (e.g., "CS-BS")
- `status` (string) - Filter by status (e.g., "active", "inactive")
- `type` (string) - Filter by type (e.g., "major", "minor")
- `level` (string) - Filter by level (e.g., "undergraduate", "graduate")

**Example**:
```bash
GET /api/banner/academic-programs
GET /api/banner/academic-programs?code=CS-BS
GET /api/banner/academic-programs?type=major&level=undergraduate
```

**Response**: Array of AcademicProgram objects

---

## Student Academic Programs

**Endpoint**: `GET /api/banner/student-academic-programs`

**Query Parameters**:
- `id` (string, UUID) - Filter by student program ID
- `student` (string, UUID) - Filter by student ID
- `academicProgram` (string, UUID) - Filter by academic program ID
- `status` (string) - Filter by status (e.g., "active", "completed")

**Example**:
```bash
GET /api/banner/student-academic-programs?student={studentId}
```

**Response**: Array of StudentAcademicProgram objects

---

## Academic Credentials

**Endpoint**: `GET /api/banner/academic-credentials`

**Query Parameters**:
- `id` (string, UUID) - Filter by credential ID
- `student` (string, UUID) - Filter by student ID
- `academicProgram` (string, UUID) - Filter by academic program ID
- `status` (string) - Filter by status (e.g., "awarded", "pending")

**Example**:
```bash
GET /api/banner/academic-credentials?student={studentId}
```

**Response**: Array of AcademicCredential objects

---

## Student Transcript Grades

**Endpoint**: `GET /api/banner/student-transcript-grades`

**Query Parameters**:
- `id` (string, UUID) - Filter by grade ID
- `student` (string, UUID) - Filter by student ID
- `section` (string, UUID) - Filter by section ID
- `sectionRegistration` (string, UUID) - Filter by section registration ID
- `academicPeriod` (string, UUID) - Filter by academic period ID
- `termCode` (string) - Filter by academic period code
- `course` (string, UUID) - Filter by course ID
- `status` (string) - Filter by status (e.g., "final", "in-progress")

**Example**:
```bash
GET /api/banner/student-transcript-grades?student={studentId}
GET /api/banner/student-transcript-grades?student={studentId}&termCode=2024FA
```

**Response**: Array of StudentTranscriptGrade objects






