// Affinity University constants and configuration

export const AFFINITY_CONFIG = {
  totalEnrollment: 18500,
  ugPercent: 0.82,
  grPercent: 0.18,
  traditionalAgePercent: 0.68,
  nonTraditionalAgePercent: 0.32,
  fullTimePercent: 0.73,
  partTimePercent: 0.27,
  firstGenPercent: 0.42,
  pellEligiblePercent: 0.38,
  inStatePercent: 0.78,
  outOfStatePercent: 0.22,
  workHours30PlusPercent: 0.18,
  commute30PlusPercent: 0.25,
  housingInstabilityPercent: 0.12,
  attendanceRiskPercent: 0.15,
  academicSupportRiskPercent: 0.22,
  retentionRate: 0.78, // Year 1 to Year 2
  graduationRate4Year: 0.42,
  graduationRate6Year: 0.61,
};

export const COLLEGES = [
  { code: 'AS', name: 'Arts & Sciences' },
  { code: 'BUS', name: 'Business' },
  { code: 'EDU', name: 'Education' },
  { code: 'ET', name: 'Engineering & Technology' },
  { code: 'HS', name: 'Health Sciences' },
  { code: 'PS', name: 'Professional Studies' },
];

export const SUBJECTS = [
  // Arts & Sciences
  { code: 'ENGL', name: 'English', college: 'AS' },
  { code: 'HIST', name: 'History', college: 'AS' },
  { code: 'PHIL', name: 'Philosophy', college: 'AS' },
  { code: 'PSYC', name: 'Psychology', college: 'AS' },
  { code: 'SOCI', name: 'Sociology', college: 'AS' },
  { code: 'BIOL', name: 'Biology', college: 'AS' },
  { code: 'CHEM', name: 'Chemistry', college: 'AS' },
  { code: 'PHYS', name: 'Physics', college: 'AS' },
  { code: 'MATH', name: 'Mathematics', college: 'AS' },
  // Business
  { code: 'ACCT', name: 'Accounting', college: 'BUS' },
  { code: 'BUSN', name: 'Business', college: 'BUS' },
  { code: 'ECON', name: 'Economics', college: 'BUS' },
  { code: 'FIN', name: 'Finance', college: 'BUS' },
  { code: 'MKTG', name: 'Marketing', college: 'BUS' },
  { code: 'MGMT', name: 'Management', college: 'BUS' },
  // Education
  { code: 'EDUC', name: 'Education', college: 'EDU' },
  { code: 'SPED', name: 'Special Education', college: 'EDU' },
  // Engineering & Technology
  { code: 'CSCI', name: 'Computer Science', college: 'ET' },
  { code: 'ENGR', name: 'Engineering', college: 'ET' },
  { code: 'IT', name: 'Information Technology', college: 'ET' },
  // Health Sciences
  { code: 'NURS', name: 'Nursing', college: 'HS' },
  { code: 'HLTH', name: 'Health Sciences', college: 'HS' },
  { code: 'KINE', name: 'Kinesiology', college: 'HS' },
  // Professional Studies
  { code: 'CRIM', name: 'Criminal Justice', college: 'PS' },
  { code: 'SW', name: 'Social Work', college: 'PS' },
];

export const GRADE_VALUES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'W'];
export const GRADE_POINTS: Record<string, number> = {
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'F': 0.0,
  'W': 0.0,
};

export const MEETING_PATTERNS = [
  { days: ['monday', 'wednesday', 'friday'], pattern: 'MWF' },
  { days: ['tuesday', 'thursday'], pattern: 'TR' },
  { days: ['monday', 'wednesday'], pattern: 'MW' },
  { days: ['tuesday', 'thursday', 'friday'], pattern: 'TRF' },
  { days: ['monday'], pattern: 'M' },
  { days: ['wednesday'], pattern: 'W' },
];

export const TIME_SLOTS = [
  { start: '08:00', end: '08:50' },
  { start: '09:00', end: '09:50' },
  { start: '10:00', end: '10:50' },
  { start: '11:00', end: '11:50' },
  { start: '12:00', end: '12:50' },
  { start: '13:00', end: '13:50' },
  { start: '14:00', end: '14:50' },
  { start: '15:00', end: '15:50' },
  { start: '16:00', end: '16:50' },
  { start: '11:00', end: '12:15' }, // TR 75-minute slots
  { start: '13:30', end: '14:45' },
  { start: '15:00', end: '16:15' },
];

export const BUILDINGS = ['SCI', 'MATH', 'LIB', 'BUS', 'EDU', 'HS', 'ET', 'AS', 'GYM', 'ART'];






