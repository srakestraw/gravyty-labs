import { PrismaClient } from '@prisma/client';
import { SeededRandom } from './random';
import {
  COLLEGES,
  SUBJECTS,
  MEETING_PATTERNS,
  TIME_SLOTS,
  BUILDINGS,
  GRADE_VALUES,
  GRADE_POINTS,
  AFFINITY_CONFIG,
} from './constants';

export async function generateAcademicPeriods(
  prisma: PrismaClient,
  rng: SeededRandom,
  startYear: number,
  endYear: number
) {
  const periods: any[] = [];
  const termTypes = ['FA', 'SP', 'SU']; // Fall, Spring, Summer

  for (let year = startYear; year <= endYear; year++) {
    for (const termType of termTypes) {
      const code = `${year}${termType}`;
      let title = '';
      let startDate: Date;
      let endDate: Date;
      let academicYear: string;

      if (termType === 'FA') {
        title = `Fall ${year}`;
        startDate = new Date(year, 7, 26); // August 26
        endDate = new Date(year, 11, 13); // December 13
        academicYear = `${year}-${year + 1}`;
      } else if (termType === 'SP') {
        title = `Spring ${year + 1}`;
        startDate = new Date(year + 1, 0, 13); // January 13
        endDate = new Date(year + 1, 4, 2); // May 2
        academicYear = `${year}-${year + 1}`;
      } else {
        // SU
        title = `Summer ${year + 1}`;
        startDate = new Date(year + 1, 5, 3); // June 3
        endDate = new Date(year + 1, 7, 9); // August 9
        academicYear = `${year}-${year + 1}`;
      }

      const censusOn = new Date(startDate);
      censusOn.setDate(censusOn.getDate() + 18); // ~3 weeks after start

      const registrationStartOn = new Date(startDate);
      registrationStartOn.setMonth(registrationStartOn.getMonth() - 4); // 4 months before

      const registrationEndOn = new Date(startDate);
      registrationEndOn.setDate(registrationEndOn.getDate() + 11); // ~11 days after start

      const now = new Date();
      const status =
        endDate < now ? 'closed' : startDate > now ? 'future' : 'active';

      const period = await prisma.academicPeriod.create({
        data: {
          code,
          title,
          type: 'term',
          startOn: startDate,
          endOn: endDate,
          censusOn,
          registrationStartOn,
          registrationEndOn,
          academicYear,
          status,
        },
      });

      periods.push(period);
    }
  }

  return periods;
}

export async function generateAcademicPrograms(
  prisma: PrismaClient,
  rng: SeededRandom
) {
  const programs: any[] = [];

  // Undergraduate majors (~85)
  const ugMajors = [
    // Arts & Sciences
    'English', 'History', 'Philosophy', 'Psychology', 'Sociology',
    'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Political Science',
    // Business
    'Accounting', 'Business Administration', 'Economics', 'Finance', 'Marketing',
    'Management', 'Entrepreneurship', 'International Business',
    // Education
    'Elementary Education', 'Secondary Education', 'Special Education',
    'Early Childhood Education',
    // Engineering & Technology
    'Computer Science', 'Software Engineering', 'Information Technology',
    'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
    // Health Sciences
    'Nursing', 'Health Sciences', 'Kinesiology', 'Public Health',
    // Professional Studies
    'Criminal Justice', 'Social Work', 'Criminal Justice Administration',
  ];

  // Add more synthetic majors to reach ~85
  const additionalMajors = [
    'Communication', 'Journalism', 'Theatre', 'Art', 'Music', 'Spanish',
    'French', 'German', 'Anthropology', 'Geography', 'Environmental Science',
    'Statistics', 'Data Science', 'Cybersecurity', 'Network Administration',
    'Biomedical Engineering', 'Industrial Engineering', 'Aerospace Engineering',
    'Exercise Science', 'Nutrition', 'Health Administration', 'Paralegal Studies',
    'Human Services', 'Counseling', 'Urban Planning', 'Public Administration',
  ];

  const allUgMajors = [...ugMajors, ...additionalMajors].slice(0, 85);

  for (const major of allUgMajors) {
    const college = rng.nextChoice(COLLEGES);
    const degreeCode = rng.nextChoice(['BS', 'BA']);
    const code = `${major.substring(0, 3).toUpperCase()}-${degreeCode}`;

    const program = await prisma.academicProgram.create({
      data: {
        code,
        title: `${degreeCode === 'BS' ? 'Bachelor of Science' : 'Bachelor of Arts'} in ${major}`,
        type: 'major',
        level: 'undergraduate',
        degreeCode,
        status: 'active',
        startOn: new Date('2019-08-01'),
        creditsRequired: 120,
        description: `Comprehensive ${major} program.`,
      },
    });

    programs.push(program);
  }

  // Graduate programs (~45)
  const grPrograms = [
    'Master of Science in Computer Science',
    'Master of Business Administration',
    'Master of Education',
    'Master of Science in Nursing',
    'Master of Arts in Psychology',
    'Master of Science in Engineering',
    'Master of Public Health',
    'Master of Social Work',
    'Master of Arts in English',
    'Master of Science in Data Science',
  ];

  // Add more to reach ~45
  const additionalGr = [
    'Master of Accounting', 'Master of Finance', 'Master of Marketing',
    'Master of Science in Biology', 'Master of Science in Chemistry',
    'Master of Arts in History', 'Master of Science in Mathematics',
    'Master of Science in Information Technology', 'Master of Health Administration',
    'Master of Criminal Justice', 'Master of Arts in Communication',
  ];

  const allGrPrograms = [...grPrograms, ...additionalGr].slice(0, 45);

  for (const programTitle of allGrPrograms) {
    const degreeCode = programTitle.includes('MBA')
      ? 'MBA'
      : programTitle.includes('Master of Arts')
      ? 'MA'
      : 'MS';
    const major = programTitle.replace(/Master of (Science|Arts|Business Administration) in /, '');
    const code = `${major.substring(0, 3).toUpperCase()}-${degreeCode}`;

    const program = await prisma.academicProgram.create({
      data: {
        code,
        title: programTitle,
        type: 'major',
        level: 'graduate',
        degreeCode,
        status: 'active',
        startOn: new Date('2019-08-01'),
        creditsRequired: degreeCode === 'MBA' ? 36 : 30,
        description: `Graduate program in ${major}.`,
      },
    });

    programs.push(program);
  }

  return programs;
}

export async function generateCourses(
  prisma: PrismaClient,
  rng: SeededRandom
) {
  const courses: any[] = [];
  const levels = ['100', '200', '300', '400', '500', '600'];

  for (const subject of SUBJECTS) {
    // Generate courses at different levels
    for (const level of levels) {
      const courseNumber = `${level}${rng.nextInt(1, 10)}`;
      const title = `${subject.name} ${level}-Level Course`;
      const courseLevel = parseInt(level) < 500 ? 'undergraduate' : 'graduate';

      const course = await prisma.course.create({
        data: {
          subjectCode: subject.code,
          number: courseNumber,
          title,
          description: `Course description for ${subject.code} ${courseNumber}.`,
          creditType: 'institutional',
          creditsMinimum: parseInt(level) >= 500 ? 3 : rng.nextChoice([3, 4]),
          creditsMaximum: parseInt(level) >= 500 ? 3 : rng.nextChoice([3, 4]),
          creditsIncrement: 1,
          courseLevel,
          status: 'active',
          effectiveStartDate: new Date('2019-08-01'),
          catalogYear: '2024-2025',
        },
      });

      courses.push(course);
    }
  }

  return courses;
}

export function generateStudentAttributes(rng: SeededRandom) {
  const isFirstGen = rng.nextBoolean(AFFINITY_CONFIG.firstGenPercent);
  const isPellEligible = rng.nextBoolean(AFFINITY_CONFIG.pellEligiblePercent);
  const isInState = rng.nextBoolean(AFFINITY_CONFIG.inStatePercent);
  const workHoursPerWeek = rng.nextBoolean(AFFINITY_CONFIG.workHours30PlusPercent)
    ? rng.nextInt(30, 41)
    : rng.nextInt(0, 30);
  const commuteMinutes = rng.nextBoolean(AFFINITY_CONFIG.commute30PlusPercent)
    ? rng.nextInt(30, 91)
    : rng.nextInt(0, 30);
  const hasHousingInstability = rng.nextBoolean(AFFINITY_CONFIG.housingInstabilityPercent);

  return {
    isFirstGen,
    isPellEligible,
    isInState,
    workHoursPerWeek,
    commuteMinutes,
    hasHousingInstability,
  };
}

export function calculateRiskScores(
  student: any,
  attendanceRate: number,
  gpa: number | null
): { attendanceRisk: number; academicSupportRisk: number; overallBucket: 'LOW' | 'MEDIUM' | 'HIGH' } {
  // Attendance risk (0-1, higher = more risk)
  let attendanceRisk = 1 - attendanceRate; // Base on attendance
  if (student.workHoursPerWeek >= 30) attendanceRisk += 0.15;
  if (student.commuteMinutes >= 30) attendanceRisk += 0.1;
  if (student.hasHousingInstability) attendanceRisk += 0.2;
  attendanceRisk = Math.min(1, Math.max(0, attendanceRisk));

  // Academic support risk (0-1, higher = more risk)
  let academicSupportRisk = 0.3; // Base
  if (gpa !== null && gpa < 2.0) academicSupportRisk += 0.4;
  else if (gpa !== null && gpa < 2.5) academicSupportRisk += 0.25;
  else if (gpa !== null && gpa < 3.0) academicSupportRisk += 0.1;
  if (student.isFirstGen) academicSupportRisk += 0.15;
  if (student.isPellEligible) academicSupportRisk += 0.1;
  if (student.workHoursPerWeek >= 30) academicSupportRisk += 0.1;
  academicSupportRisk = Math.min(1, Math.max(0, academicSupportRisk));

  // Overall bucket
  const avgRisk = (attendanceRisk + academicSupportRisk) / 2;
  let overallBucket: 'LOW' | 'MEDIUM' | 'HIGH';
  if (avgRisk >= 0.6) overallBucket = 'HIGH';
  else if (avgRisk >= 0.3) overallBucket = 'MEDIUM';
  else overallBucket = 'LOW';

  return { attendanceRisk, academicSupportRisk, overallBucket };
}

export function getGradeFromGPA(targetGPA: number, rng: SeededRandom): string {
  // Add some variance around target GPA
  const variance = rng.nextFloat(-0.3, 0.3);
  const actualGPA = Math.max(0, Math.min(4, targetGPA + variance));

  // Map GPA to grade
  if (actualGPA >= 3.7) return rng.nextChoice(['A', 'A-']);
  if (actualGPA >= 3.3) return rng.nextChoice(['A-', 'B+']);
  if (actualGPA >= 3.0) return rng.nextChoice(['B+', 'B']);
  if (actualGPA >= 2.7) return rng.nextChoice(['B', 'B-']);
  if (actualGPA >= 2.3) return rng.nextChoice(['B-', 'C+']);
  if (actualGPA >= 2.0) return rng.nextChoice(['C+', 'C']);
  if (actualGPA >= 1.7) return rng.nextChoice(['C', 'C-']);
  if (actualGPA >= 1.0) return rng.nextChoice(['D+', 'D']);
  return 'F';
}






