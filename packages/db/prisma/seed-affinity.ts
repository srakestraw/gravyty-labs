import { PrismaClient } from '@prisma/client';
import { SeededRandom } from './seed-data/affinity/random';
import {
  generateAcademicPeriods,
  generateAcademicPrograms,
  generateCourses,
  generateStudentAttributes,
  calculateRiskScores,
  getGradeFromGPA,
} from './seed-data/affinity/generators';
import { AFFINITY_CONFIG, SUBJECTS, MEETING_PATTERNS, TIME_SLOTS, BUILDINGS, GRADE_POINTS } from './seed-data/affinity/constants';

const prisma = new PrismaClient();
const SEED = 12345; // Fixed seed for determinism
const rng = new SeededRandom(SEED);

// Generate realistic names
const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn',
  'Alexandra', 'Marcus', 'Sarah', 'David', 'Emily', 'Michael', 'Jessica', 'Christopher',
  'Ashley', 'Matthew', 'Amanda', 'Daniel', 'Melissa', 'James', 'Nicole', 'Robert',
  'Michelle', 'John', 'Laura', 'William', 'Kimberly', 'Richard', 'Amy', 'Joseph',
  'Angela', 'Thomas', 'Lisa', 'Charles', 'Nancy', 'Christopher', 'Karen', 'Anthony',
];
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor',
  'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez',
  'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
];

function generateName(rng: SeededRandom): { given: string; family: string } {
  return {
    given: rng.nextChoice(FIRST_NAMES),
    family: rng.nextChoice(LAST_NAMES),
  };
}

function generateEmail(given: string, family: string, rng: SeededRandom): string {
  const num = rng.nextInt(100, 9999);
  return `${given.toLowerCase()}.${family.toLowerCase()}${num}@affinity.edu`;
}

function generatePhone(rng: SeededRandom): string {
  const area = rng.nextInt(200, 999);
  const exchange = rng.nextInt(200, 999);
  const number = rng.nextInt(1000, 9999);
  return `${area}-${exchange}-${number}`;
}

function generateAddress(rng: SeededRandom): { line1: string; city: string; state: string; postalCode: string } {
  const streetNum = rng.nextInt(100, 9999);
  const streets = ['Oak', 'Elm', 'Maple', 'Main', 'Park', 'First', 'Second', 'Third', 'Cedar', 'Pine'];
  const street = rng.nextChoice(streets);
  const cities = ['Springfield', 'Chicago', 'Peoria', 'Rockford', 'Champaign', 'Bloomington', 'Aurora', 'Naperville'];
  const city = rng.nextChoice(cities);
  const state = 'IL';
  const postalCode = `${rng.nextInt(60, 62)}${rng.nextInt(100, 999)}`;

  return {
    line1: `${streetNum} ${street} Street`,
    city,
    state,
    postalCode,
  };
}

async function main() {
  console.log('🌱 Starting Affinity University 6-Year Seed...');
  console.log(`   Using seed: ${SEED} for determinism`);

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.studentRisk.deleteMany();
  await prisma.studentTranscriptGrade.deleteMany();
  await prisma.sectionRegistration.deleteMany();
  await prisma.studentAcademicProgram.deleteMany();
  await prisma.academicCredential.deleteMany();
  await prisma.section.deleteMany();
  await prisma.course.deleteMany();
  await prisma.academicProgram.deleteMany();
  await prisma.academicPeriod.deleteMany();
  await prisma.student.deleteMany();
  await prisma.address.deleteMany();
  await prisma.phone.deleteMany();
  await prisma.emailAddress.deleteMany();
  await prisma.personName.deleteMany();
  await prisma.person.deleteMany();
  await prisma.simulationState.deleteMany();

  // Generate 6 years of academic periods (2019-2020 through 2024-2025)
  console.log('📅 Generating academic periods (6 years)...');
  const periods = await generateAcademicPeriods(prisma, rng, 2019, 2024);
  console.log(`   Created ${periods.length} academic periods`);

  // Generate academic programs
  console.log('🎓 Generating academic programs...');
  const programs = await generateAcademicPrograms(prisma, rng);
  const ugPrograms = programs.filter((p) => p.level === 'undergraduate');
  const grPrograms = programs.filter((p) => p.level === 'graduate');
  console.log(`   Created ${ugPrograms.length} undergraduate programs`);
  console.log(`   Created ${grPrograms.length} graduate programs`);

  // Generate courses
  console.log('📚 Generating courses...');
  const courses = await generateCourses(prisma, rng);
  const ugCourses = courses.filter((c) => c.courseLevel === 'undergraduate');
  const grCourses = courses.filter((c) => c.courseLevel === 'graduate');
  console.log(`   Created ${ugCourses.length} undergraduate courses`);
  console.log(`   Created ${grCourses.length} graduate courses`);

  // Generate sections for each term
  console.log('🏫 Generating sections for all terms...');
  const sectionsByTerm: Record<string, any[]> = {};
  let sectionCounter = 10000;

  for (const period of periods) {
    const termSections: any[] = [];
    const termCourses = period.code.includes('SU')
      ? [...ugCourses.slice(0, ugCourses.length * 0.6), ...grCourses.slice(0, grCourses.length * 0.6)]
      : [...ugCourses, ...grCourses];

    // Generate enough sections to support enrollment
    const numSections = Math.ceil((AFFINITY_CONFIG.totalEnrollment * 0.1) / termCourses.length);
    
    for (const course of termCourses) {
      const numCourseSections = rng.nextInt(1, numSections + 1);
      for (let i = 0; i < numCourseSections; i++) {
        const pattern = rng.nextChoice(MEETING_PATTERNS);
        const timeSlot = rng.nextChoice(TIME_SLOTS);
        const building = rng.nextChoice(BUILDINGS);
        const roomNum = rng.nextInt(100, 400);

        const capacity = course.courseLevel === 'graduate' 
          ? rng.nextInt(15, 25)
          : rng.nextInt(25, 40);

        const section = await prisma.section.create({
          data: {
            courseId: course.id,
            academicPeriodId: period.id,
            number: String(i + 1).padStart(3, '0'),
            title: course.title,
            crn: String(sectionCounter++),
            startOn: period.startOn,
            endOn: period.endOn,
            status: period.status === 'closed' ? 'closed' : 'open',
            capacity,
            enrolled: 0,
            available: capacity,
            waitlistCapacity: 5,
            waitlistEnrolled: 0,
            instructionalMethodCode: 'LEC',
            daysOfWeek: pattern.days,
            startTime: timeSlot.start,
            endTime: timeSlot.end,
            building,
            roomNumber: String(roomNum),
            creditType: 'institutional',
            creditsMinimum: Number(course.creditsMinimum),
            creditsMaximum: Number(course.creditsMaximum),
          },
        });

        termSections.push(section);
      }
    }

    sectionsByTerm[period.id] = termSections;
    console.log(`   Created ${termSections.length} sections for ${period.code}`);
  }

  // Generate students (~18,500 total across 6 years)
  console.log('👥 Generating students...');
  const totalStudents = AFFINITY_CONFIG.totalEnrollment;
  const students: any[] = [];
  const entryYearDistribution = [0.18, 0.17, 0.16, 0.15, 0.14, 0.12, 0.08]; // Distribution across entry years

  let studentCounter = 1;
  let personCounter = 1;

  for (let entryYearIdx = 0; entryYearIdx < 7; entryYearIdx++) {
    const entryYear = 2019 + entryYearIdx;
    const entryPeriod = periods.find((p) => p.code === `${entryYear}FA`);
    if (!entryPeriod) continue;

    const numStudents = Math.floor(totalStudents * entryYearDistribution[entryYearIdx]);
    const isUG = rng.nextBoolean(AFFINITY_CONFIG.ugPercent);
    const studentType = isUG ? 'undergraduate' : 'graduate';

    for (let i = 0; i < numStudents; i++) {
      const name = generateName(rng);
      const birthYear = isUG
        ? (rng.nextBoolean(AFFINITY_CONFIG.traditionalAgePercent)
            ? rng.nextInt(entryYear - 24, entryYear - 18)
            : rng.nextInt(entryYear - 40, entryYear - 25))
        : rng.nextInt(entryYear - 35, entryYear - 22);
      const birthDate = new Date(birthYear, rng.nextInt(0, 12), rng.nextInt(1, 28));

      const attributes = generateStudentAttributes(rng);
      const isFullTime = rng.nextBoolean(AFFINITY_CONFIG.fullTimePercent);
      const academicLevel = isUG
        ? rng.nextChoice(['freshman', 'sophomore', 'junior', 'senior'])
        : rng.nextChoice(['graduate', 'doctoral']);

      const person = await prisma.person.create({
        data: {
          birthDate,
          gender: rng.nextChoice(['male', 'female', 'other']),
          citizenshipStatus: 'citizen',
          names: {
            create: {
              given: name.given,
              middle: rng.nextBoolean(0.3) ? rng.nextChoice(FIRST_NAMES) : null,
              family: name.family,
              type: 'legal',
              preferred: true,
            },
          },
          emails: {
            create: [
              {
                address: generateEmail(name.given, name.family, rng),
                type: 'institutional',
                preferred: true,
              },
            ],
          },
          phones: {
            create: {
              number: generatePhone(rng),
              type: 'mobile',
              preferred: true,
            },
          },
          addresses: {
            create: {
              ...generateAddress(rng),
              type: 'home',
              country: 'USA',
            },
          },
          student: {
            create: {
              type: studentType,
              status: 'active',
              startOn: entryPeriod.startOn,
              entryAcademicPeriodId: entryPeriod.id,
              academicLevel,
              residency: attributes.isInState ? 'in-state' : 'out-of-state',
              studentClassification: isFullTime ? 'full-time' : 'part-time',
              studentLoad: isFullTime ? 'full-time' : 'part-time',
              academicStandingCode: 'GOOD',
              studentNumber: `STU${entryYear}${String(studentCounter++).padStart(5, '0')}`,
              ...attributes,
            },
          },
        },
      });

      const student = await prisma.student.findUnique({
        where: { personId: person.id },
      });

      if (student) {
        students.push(student);

        // Assign academic program
        const availablePrograms = studentType === 'undergraduate' ? ugPrograms : grPrograms;
        if (availablePrograms.length > 0) {
          const program = rng.nextChoice(availablePrograms);
          await prisma.studentAcademicProgram.create({
            data: {
              studentId: student.id,
              academicProgramId: program.id,
              startOn: entryPeriod.startOn,
              status: 'active',
              catalogYear: `${entryYear}-${entryYear + 1}`,
              primary: true,
            },
          });
        }
      }

      if (students.length % 1000 === 0) {
        console.log(`   Created ${students.length} students...`);
      }
    }
  }

  console.log(`   Created ${students.length} total students`);

  // Generate enrollment history and transcripts
  console.log('📝 Generating enrollment history and transcripts...');
  const currentDate = new Date();
  let totalRegistrations = 0;
  let totalGrades = 0;

  for (const student of students) {
    const entryPeriod = periods.find((p) => p.id === student.entryAcademicPeriodId);
    if (!entryPeriod) continue;

    const entryYear = parseInt(entryPeriod.code.substring(0, 4));
    const studentPeriods = periods.filter((p) => {
      const pYear = parseInt(p.code.substring(0, 4));
      return pYear >= entryYear && pYear <= entryYear + 6; // Up to 6 years
    });

    // Determine if student graduated
    const shouldGraduate = rng.nextBoolean(0.6); // 60% eventually graduate
    const graduationYear = shouldGraduate
      ? entryYear + (rng.nextBoolean(0.7) ? 4 : 6) // 4 or 6 year graduation
      : null;

    let cumulativeGPA = 0;
    let totalCredits = 0;
    let termsCompleted = 0;

    for (const period of studentPeriods) {
      // Skip if student graduated before this term
      if (graduationYear && parseInt(period.code.substring(0, 4)) > graduationYear) {
        break;
      }

      // Apply retention (78% retention from year 1 to year 2)
      if (parseInt(period.code.substring(0, 4)) === entryYear + 1 && period.code.includes('FA')) {
        if (!rng.nextBoolean(AFFINITY_CONFIG.retentionRate)) {
          // Student dropped out
          await prisma.student.update({
            where: { id: student.id },
            data: { status: 'inactive' },
          });
          break;
        }
      }

      const isActive = period.endOn <= currentDate || period.status === 'active';
      const termSections = sectionsByTerm[period.id] || [];
      if (termSections.length === 0) continue;

      // Determine credit load
      const isFullTime = student.studentLoad === 'full-time';
      const targetCredits = isFullTime
        ? (student.type === 'undergraduate' ? rng.nextInt(12, 19) : rng.nextInt(6, 10))
        : (student.type === 'undergraduate' ? rng.nextInt(3, 12) : rng.nextInt(3, 6));

      // Select sections to enroll in
      const selectedSections: any[] = [];
      let enrolledCredits = 0;

      // Shuffle sections for variety
      const shuffledSections = rng.shuffle([...termSections]);

      for (const section of shuffledSections) {
        if (enrolledCredits >= targetCredits) break;

        const course = courses.find((c) => c.id === section.courseId);
        if (!course) continue;

        const sectionCredits = Number(course.creditsMinimum);
        if (enrolledCredits + sectionCredits > targetCredits + 3) continue; // Don't exceed by too much

        selectedSections.push(section);
        enrolledCredits += sectionCredits;
      }

      // Create registrations
      for (const section of selectedSections) {
        const course = courses.find((c) => c.id === section.courseId);
        if (!course) continue;

        const registrationDate = new Date(period.registrationStartOn);
        registrationDate.setDate(registrationDate.getDate() + rng.nextInt(0, 30));

        const attendanceRate = rng.nextFloat(0.7, 1.0);
        // Lower attendance for at-risk students
        const adjustedAttendance = student.workHoursPerWeek >= 30
          ? attendanceRate * 0.85
          : student.commuteMinutes >= 30
          ? attendanceRate * 0.9
          : student.hasHousingInstability
          ? attendanceRate * 0.8
          : attendanceRate;

        const registration = await prisma.sectionRegistration.create({
          data: {
            studentId: student.id,
            sectionId: section.id,
            academicPeriodId: period.id,
            statusCode: 'REG',
            registrationDate,
            registeredOn: registrationDate,
            creditType: 'institutional',
            credits: Number(course.creditsMinimum),
            gradingOptionCode: 'GRAD',
            academicLoad: isFullTime ? 'full-time' : 'part-time',
            residencyStatus: student.isInState ? 'in-state' : 'out-of-state',
            attendanceRate: adjustedAttendance,
          },
        });

        totalRegistrations++;

        // Update section enrollment
        await prisma.section.update({
          where: { id: section.id },
          data: {
            enrolled: { increment: 1 },
            available: { decrement: 1 },
          },
        });

        // If term is completed, create transcript grade
        if (period.endOn <= currentDate) {
          // Calculate grade based on attendance and prior GPA
          const baseGPA = totalCredits > 0 ? cumulativeGPA : 2.9; // Start around 2.9
          const attendanceFactor = adjustedAttendance;
          const gradeVariance = rng.nextFloat(-0.2, 0.2);
          const targetGPA = Math.max(0, Math.min(4, baseGPA + (attendanceFactor - 0.85) * 0.5 + gradeVariance));

          const gradeValue = getGradeFromGPA(targetGPA, rng);
          const gradePoints = GRADE_POINTS[gradeValue] || 0;
          const creditsEarned = gradeValue === 'F' || gradeValue === 'W' ? 0 : Number(course.creditsMinimum);

          const grade = await prisma.studentTranscriptGrade.create({
            data: {
              studentId: student.id,
              sectionRegistrationId: registration.id,
              sectionId: section.id,
              academicPeriodId: period.id,
              courseId: course.id,
              gradeSchemeCode: 'STANDARD',
              gradeValue,
              gradePoints,
              qualityPoints: gradePoints * Number(course.creditsMinimum),
              creditsAttempted: Number(course.creditsMinimum),
              creditsEarned,
              finalGradeDate: period.endOn,
              status: 'final',
              incomplete: false,
              repeat: false,
            },
          });

          // Update cumulative GPA
          if (creditsEarned > 0) {
            cumulativeGPA = (cumulativeGPA * totalCredits + gradePoints * creditsEarned) / (totalCredits + creditsEarned);
            totalCredits += creditsEarned;
          }

          // Update registration with final grade
          await prisma.sectionRegistration.update({
            where: { id: registration.id },
            data: { finalGrade: gradeValue },
          });

          totalGrades++;
          termsCompleted++;
        }
      }
    }

    // Create graduation credential if applicable
    if (graduationYear && totalCredits >= 120) {
      const graduationPeriod = periods.find(
        (p) => p.code.includes('SP') && parseInt(p.code.substring(0, 4)) === graduationYear
      );
      if (graduationPeriod) {
        const program = await prisma.studentAcademicProgram.findFirst({
          where: { studentId: student.id, primary: true },
        });

        await prisma.academicCredential.create({
          data: {
            studentId: student.id,
            credentialCode: program ? 'BS' : 'BA',
            academicProgramId: program?.academicProgramId || null,
            awardedOn: graduationPeriod.endOn,
            status: 'awarded',
            academicPeriodId: graduationPeriod.id,
          },
        });

        await prisma.student.update({
          where: { id: student.id },
          data: { status: 'graduated' },
        });
      }
    }

    if (students.indexOf(student) % 500 === 0) {
      console.log(`   Processed ${students.indexOf(student) + 1} students...`);
    }
  }

  console.log(`   Created ${totalRegistrations} section registrations`);
  console.log(`   Created ${totalGrades} transcript grades`);

  // Generate risk scores for current term
  console.log('⚠️  Generating risk scores for current term...');
  const currentPeriod = periods.find((p) => p.status === 'active') || periods[periods.length - 1];
  if (currentPeriod) {
    const activeStudents = await prisma.student.findMany({
      where: { status: 'active' },
      include: {
        sectionRegistrations: {
          where: { academicPeriodId: currentPeriod.id },
        },
        transcriptGrades: true,
      },
    });

    for (const student of activeStudents) {
      // Calculate current GPA
      const completedGrades = student.transcriptGrades.filter((g) => g.status === 'final');
      let gpa: number | null = null;
      if (completedGrades.length > 0) {
        const totalPoints = completedGrades.reduce(
          (sum, g) => sum + Number(g.gradePoints || 0) * Number(g.creditsEarned),
          0
        );
        const totalCredits = completedGrades.reduce((sum, g) => sum + Number(g.creditsEarned), 0);
        gpa = totalCredits > 0 ? totalPoints / totalCredits : null;
      }

      // Average attendance across current registrations
      const avgAttendance =
        student.sectionRegistrations.length > 0
          ? student.sectionRegistrations.reduce((sum, r) => sum + (r.attendanceRate || 1), 0) /
            student.sectionRegistrations.length
          : 1.0;

      const riskScores = calculateRiskScores(student, avgAttendance, gpa);

      await prisma.studentRisk.create({
        data: {
          studentId: student.id,
          academicPeriodId: currentPeriod.id,
          attendanceRiskScore: riskScores.attendanceRisk,
          academicSupportRiskScore: riskScores.academicSupportRisk,
          overallRiskBucket: riskScores.overallBucket,
        },
      });
    }

    console.log(`   Created risk scores for ${activeStudents.length} active students`);
  }

  // Initialize simulation state
  console.log('🕐 Initializing simulation state...');
  const initialSimDate = currentPeriod ? currentPeriod.startOn : new Date();
  await prisma.simulationState.create({
    data: {
      currentSimDate: initialSimDate,
    },
  });

  console.log('✅ Affinity University 6-Year Seed completed successfully!');
  console.log(`   - ${periods.length} academic periods`);
  console.log(`   - ${programs.length} academic programs`);
  console.log(`   - ${courses.length} courses`);
  console.log(`   - ${Object.values(sectionsByTerm).flat().length} sections`);
  console.log(`   - ${students.length} students`);
  console.log(`   - ${totalRegistrations} section registrations`);
  console.log(`   - ${totalGrades} transcript grades`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });






