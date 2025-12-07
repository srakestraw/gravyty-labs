import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (for development)
  console.log('🧹 Clearing existing data...');
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

  // Create Academic Periods
  console.log('📅 Creating academic periods...');
  const fall2024 = await prisma.academicPeriod.create({
    data: {
      code: '2024FA',
      title: 'Fall 2024',
      type: 'term',
      startOn: new Date('2024-08-26'),
      endOn: new Date('2024-12-13'),
      censusOn: new Date('2024-09-13'),
      registrationStartOn: new Date('2024-04-01'),
      registrationEndOn: new Date('2024-09-06'),
      academicYear: '2024-2025',
      status: 'active',
    },
  });

  const spring2025 = await prisma.academicPeriod.create({
    data: {
      code: '2025SP',
      title: 'Spring 2025',
      type: 'term',
      startOn: new Date('2025-01-13'),
      endOn: new Date('2025-05-02'),
      censusOn: new Date('2025-02-07'),
      registrationStartOn: new Date('2024-11-01'),
      registrationEndOn: new Date('2025-01-24'),
      academicYear: '2024-2025',
      status: 'active',
    },
  });

  // Create Courses
  console.log('📚 Creating courses...');
  const cs101 = await prisma.course.create({
    data: {
      subjectCode: 'CS',
      number: '101',
      title: 'Introduction to Computer Science',
      description: 'Fundamental concepts of computer science including programming, algorithms, and data structures.',
      creditType: 'institutional',
      creditsMinimum: 3,
      creditsMaximum: 3,
      creditsIncrement: 1,
      courseLevel: 'undergraduate',
      status: 'active',
      effectiveStartDate: new Date('2020-08-01'),
      catalogYear: '2024-2025',
    },
  });

  const math201 = await prisma.course.create({
    data: {
      subjectCode: 'MATH',
      number: '201',
      title: 'Calculus I',
      description: 'Limits, continuity, derivatives, and applications of derivatives.',
      creditType: 'institutional',
      creditsMinimum: 4,
      creditsMaximum: 4,
      creditsIncrement: 1,
      courseLevel: 'undergraduate',
      status: 'active',
      effectiveStartDate: new Date('2019-08-01'),
      catalogYear: '2024-2025',
    },
  });

  // Create Sections
  console.log('🏫 Creating sections...');
  const cs101Section1 = await prisma.section.create({
    data: {
      courseId: cs101.id,
      academicPeriodId: fall2024.id,
      number: '001',
      title: 'Introduction to Computer Science',
      crn: '12345',
      startOn: new Date('2024-08-26'),
      endOn: new Date('2024-12-13'),
      status: 'open',
      capacity: 30,
      enrolled: 0,
      available: 30,
      waitlistCapacity: 5,
      waitlistEnrolled: 0,
      instructionalMethodCode: 'LEC',
      daysOfWeek: ['monday', 'wednesday', 'friday'],
      startTime: '10:00',
      endTime: '10:50',
      building: 'SCI',
      roomNumber: '101',
      creditType: 'institutional',
      creditsMinimum: 3,
      creditsMaximum: 3,
    },
  });

  const math201Section1 = await prisma.section.create({
    data: {
      courseId: math201.id,
      academicPeriodId: fall2024.id,
      number: '001',
      title: 'Calculus I',
      crn: '12346',
      startOn: new Date('2024-08-26'),
      endOn: new Date('2024-12-13'),
      status: 'open',
      capacity: 35,
      enrolled: 0,
      available: 35,
      waitlistCapacity: 5,
      waitlistEnrolled: 0,
      instructionalMethodCode: 'LEC',
      daysOfWeek: ['tuesday', 'thursday'],
      startTime: '11:00',
      endTime: '12:15',
      building: 'MATH',
      roomNumber: '205',
      creditType: 'institutional',
      creditsMinimum: 4,
      creditsMaximum: 4,
    },
  });

  // Create Persons and Students
  console.log('👥 Creating persons and students...');
  const person1 = await prisma.person.create({
    data: {
      birthDate: new Date('2002-05-15'),
      gender: 'female',
      citizenshipStatus: 'citizen',
      names: {
        create: {
          given: 'Alexandra',
          middle: 'Marie',
          family: 'Rodriguez',
          type: 'legal',
          preferred: true,
        },
      },
      emails: {
        create: [
          {
            address: 'alexandra.rodriguez@email.com',
            type: 'personal',
            preferred: false,
          },
          {
            address: 'arodriguez@affinity.edu',
            type: 'institutional',
            preferred: true,
          },
        ],
      },
      phones: {
        create: {
          number: '217-555-0123',
          type: 'mobile',
          preferred: true,
        },
      },
      addresses: {
        create: {
          type: 'home',
          line1: '123 Oak Street',
          city: 'Springfield',
          state: 'IL',
          postalCode: '62701',
          country: 'USA',
        },
      },
      student: {
        create: {
          type: 'undergraduate',
          status: 'active',
          startOn: new Date('2022-08-15'),
          entryAcademicPeriodId: fall2024.id,
          academicLevel: 'sophomore',
          residency: 'in-state',
          studentClassification: 'full-time',
          studentLoad: 'full-time',
          academicStandingCode: 'GOOD',
          studentNumber: 'STU2022001',
        },
      },
    },
  });

  const person2 = await prisma.person.create({
    data: {
      birthDate: new Date('2001-11-22'),
      gender: 'male',
      citizenshipStatus: 'citizen',
      names: {
        create: {
          given: 'Marcus',
          middle: 'James',
          family: 'Thompson',
          type: 'legal',
          preferred: true,
        },
      },
      emails: {
        create: [
          {
            address: 'marcus.thompson@email.com',
            type: 'personal',
            preferred: false,
          },
          {
            address: 'mthompson@affinity.edu',
            type: 'institutional',
            preferred: true,
          },
        ],
      },
      phones: {
        create: {
          number: '312-555-0456',
          type: 'mobile',
          preferred: true,
        },
      },
      addresses: {
        create: {
          type: 'home',
          line1: '789 Elm Drive',
          city: 'Chicago',
          state: 'IL',
          postalCode: '60601',
          country: 'USA',
        },
      },
      student: {
        create: {
          type: 'undergraduate',
          status: 'active',
          startOn: new Date('2021-08-15'),
          entryAcademicPeriodId: fall2024.id,
          academicLevel: 'junior',
          residency: 'in-state',
          studentClassification: 'full-time',
          studentLoad: 'full-time',
          academicStandingCode: 'GOOD',
          studentNumber: 'STU2021002',
        },
      },
    },
  });

  // Get student records
  const student1 = await prisma.student.findUnique({
    where: { personId: person1.id },
  });
  const student2 = await prisma.student.findUnique({
    where: { personId: person2.id },
  });

  if (!student1 || !student2) {
    throw new Error('Failed to create students');
  }

  // Create Section Registrations
  console.log('📝 Creating section registrations...');
  const reg1 = await prisma.sectionRegistration.create({
    data: {
      studentId: student1.id,
      sectionId: cs101Section1.id,
      academicPeriodId: fall2024.id,
      statusCode: 'REG',
      registrationDate: new Date('2024-04-15T10:30:00Z'),
      registeredOn: new Date('2024-04-15'),
      creditType: 'institutional',
      credits: 3,
      gradingOptionCode: 'GRAD',
      academicLoad: 'full-time',
      residencyStatus: 'in-state',
    },
  });

  const reg2 = await prisma.sectionRegistration.create({
    data: {
      studentId: student2.id,
      sectionId: math201Section1.id,
      academicPeriodId: fall2024.id,
      statusCode: 'REG',
      registrationDate: new Date('2024-04-12T14:20:00Z'),
      registeredOn: new Date('2024-04-12'),
      creditType: 'institutional',
      credits: 4,
      gradingOptionCode: 'GRAD',
      academicLoad: 'full-time',
      residencyStatus: 'in-state',
    },
  });

  // Update section enrollment counts
  await prisma.section.update({
    where: { id: cs101Section1.id },
    data: { enrolled: 1, available: 29 },
  });

  await prisma.section.update({
    where: { id: math201Section1.id },
    data: { enrolled: 1, available: 34 },
  });

  // Create Academic Program
  console.log('🎓 Creating academic programs...');
  const csProgram = await prisma.academicProgram.create({
    data: {
      code: 'CS-BS',
      title: 'Bachelor of Science in Computer Science',
      type: 'major',
      level: 'undergraduate',
      degreeCode: 'BS',
      status: 'active',
      startOn: new Date('2020-08-01'),
      creditsRequired: 120,
      description: 'Comprehensive program covering computer science fundamentals, software engineering, and advanced topics.',
    },
  });

  // Create Student Academic Program
  await prisma.studentAcademicProgram.create({
    data: {
      studentId: student1.id,
      academicProgramId: csProgram.id,
      startOn: new Date('2022-08-15'),
      status: 'active',
      catalogYear: '2022-2023',
      primary: true,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log(`   - Created ${await prisma.person.count()} persons`);
  console.log(`   - Created ${await prisma.student.count()} students`);
  console.log(`   - Created ${await prisma.academicPeriod.count()} academic periods`);
  console.log(`   - Created ${await prisma.course.count()} courses`);
  console.log(`   - Created ${await prisma.section.count()} sections`);
  console.log(`   - Created ${await prisma.sectionRegistration.count()} registrations`);
  console.log(`   - Created ${await prisma.academicProgram.count()} academic programs`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });






