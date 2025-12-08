// API utility functions for Banner endpoints

const API_BASE = '/api/banner';

export async function fetchAcademicPeriods() {
  const response = await fetch(`${API_BASE}/academic-periods`);
  if (!response.ok) {
    throw new Error('Failed to fetch academic periods');
  }
  return response.json();
}

export async function fetchSections(filters?: {
  termCode?: string;
  academicPeriodId?: string;
  courseId?: string;
  subject?: string;
  status?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.termCode) params.append('termCode', filters.termCode);
  if (filters?.academicPeriodId) params.append('academicPeriod', filters.academicPeriodId);
  if (filters?.courseId) params.append('course', filters.courseId);
  if (filters?.subject) params.append('subject', filters.subject);
  if (filters?.status) params.append('status', filters.status);

  const response = await fetch(`${API_BASE}/sections?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch sections');
  }
  return response.json();
}

export async function fetchCourses(filters?: {
  subjectCode?: string;
  status?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.subjectCode) params.append('subject', filters.subjectCode);
  if (filters?.status) params.append('status', filters.status);

  const response = await fetch(`${API_BASE}/courses?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch courses');
  }
  return response.json();
}

export async function fetchStudent(studentId: string) {
  const response = await fetch(`${API_BASE}/students?id=${studentId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch student');
  }
  const data = await response.json();
  return data[0] || null;
}

export async function searchStudents(query: string) {
  const response = await fetch(`${API_BASE}/students?search=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search students');
  }
  return response.json();
}

export async function fetchPerson(personId: string) {
  const response = await fetch(`${API_BASE}/persons?id=${personId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch person');
  }
  const data = await response.json();
  return data[0] || null;
}

export async function fetchSectionRegistrations(filters?: {
  studentId?: string;
  sectionId?: string;
  termCode?: string;
  academicPeriodId?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.studentId) params.append('student', filters.studentId);
  if (filters?.sectionId) params.append('section', filters.sectionId);
  if (filters?.termCode) params.append('termCode', filters.termCode);
  if (filters?.academicPeriodId) params.append('academicPeriod', filters.academicPeriodId);

  const response = await fetch(`${API_BASE}/section-registrations?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch section registrations');
  }
  return response.json();
}

export async function fetchStudentAcademicPrograms(studentId: string) {
  const response = await fetch(`${API_BASE}/student-academic-programs?student=${studentId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch student academic programs');
  }
  return response.json();
}

export async function fetchStudentTranscriptGrades(filters?: {
  studentId?: string;
  termCode?: string;
  status?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.studentId) params.append('student', filters.studentId);
  if (filters?.termCode) params.append('termCode', filters.termCode);
  if (filters?.status) params.append('status', filters.status);

  const response = await fetch(`${API_BASE}/student-transcript-grades?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch transcript grades');
  }
  return response.json();
}

// Extract unique subjects from courses
export async function fetchSubjects() {
  const courses = await fetchCourses({ status: 'active' });
  const subjects = new Set<string>();
  courses.forEach((course: any) => {
    if (course.subject?.code) {
      subjects.add(course.subject.code);
    }
  });
  return Array.from(subjects).sort();
}






