import { PrismaClient, RiskBucket } from '@prisma/client';
import { calculateRiskScores, getGradeFromGPA } from './seed-data/affinity/generators';
import { GRADE_POINTS } from './seed-data/affinity/constants';
import { SeededRandom } from './seed-data/affinity/random';

// Lazy initialization to avoid build-time errors
let prisma: PrismaClient | null = null;
function getPrisma() {
  // Skip during build
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'test') {
    throw new Error('Prisma not available during build');
  }
  if (!prisma) {
    try {
      prisma = new PrismaClient();
    } catch (e) {
      // Silently fail during build
      throw new Error('Prisma not available');
    }
  }
  return prisma;
}
const rng = new SeededRandom(Date.now()); // Use current time as seed for randomness

export async function simulateWeek() {
  console.log('🔄 Running weekly simulation tick...');

  // Get current simulation date
  let simState = await getPrisma().simulationState.findFirst();
  if (!simState) {
    // Initialize if doesn't exist
    const currentPeriod = await getPrisma().academicPeriod.findFirst({
      where: { status: 'active' },
      orderBy: { startOn: 'desc' },
    });
    const initialDate = currentPeriod?.startOn || new Date();
    simState = await getPrisma().simulationState.create({
      data: { currentSimDate: initialDate },
    });
  }

  const currentSimDate = new Date(simState.currentSimDate);
  const nextWeek = new Date(currentSimDate);
  nextWeek.setDate(nextWeek.getDate() + 7);

  console.log(`   Current simulation date: ${currentSimDate.toISOString().split('T')[0]}`);
  console.log(`   Advancing to: ${nextWeek.toISOString().split('T')[0]}`);

  // Find active terms (where currentSimDate is between start and end)
  const activePeriods = await getPrisma().academicPeriod.findMany({
    where: {
      startOn: { lte: nextWeek },
      endOn: { gte: currentSimDate },
    },
  });

  console.log(`   Found ${activePeriods.length} active term(s)`);

  for (const period of activePeriods) {
    const weeksIntoTerm = Math.floor(
      (currentSimDate.getTime() - period.startOn.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    const totalWeeks = Math.ceil(
      (period.endOn.getTime() - period.startOn.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    const isEarlyTerm = weeksIntoTerm < 3;
    const isMidterm = weeksIntoTerm >= totalWeeks * 0.4 && weeksIntoTerm < totalWeeks * 0.6;
    const isLateTerm = weeksIntoTerm >= totalWeeks * 0.8;

    console.log(`   Processing ${period.code}: Week ${weeksIntoTerm + 1} of ${totalWeeks}`);

    // 1. Enrollment churn (first few weeks only)
    if (isEarlyTerm) {
      const registrations = await getPrisma().sectionRegistration.findMany({
        where: {
          academicPeriodId: period.id,
          statusCode: 'REG',
        },
        include: { student: true, section: true },
      });

      // Random drops (2-5% of registrations)
      const dropRate = rng.nextFloat(0.02, 0.05);
      const numDrops = Math.floor(registrations.length * dropRate);
      const toDrop = rng.shuffle([...registrations]).slice(0, numDrops);

      for (const reg of toDrop) {
        await getPrisma().sectionRegistration.update({
          where: { id: reg.id },
          data: { statusCode: 'DROP' },
        });

        await getPrisma().section.update({
          where: { id: reg.sectionId },
          data: {
            enrolled: { decrement: 1 },
            available: { increment: 1 },
          },
        });
      }

      if (toDrop.length > 0) {
        console.log(`     Dropped ${toDrop.length} registrations`);
      }

      // Small number of new registrations to open sections
      const openSections = await getPrisma().section.findMany({
        where: {
          academicPeriodId: period.id,
          status: 'open',
          available: { gt: 0 },
        },
        include: { course: true },
      });

      const activeStudents = await getPrisma().student.findMany({
        where: { status: 'active' },
        include: {
          sectionRegistrations: {
            where: { academicPeriodId: period.id },
          },
        },
      });

      const studentsNeedingMoreCredits = activeStudents.filter((s) => {
        const currentCredits = s.sectionRegistrations.reduce(
          (sum, r) => sum + Number(r.credits),
          0
        );
        const targetCredits = s.studentLoad === 'full-time' ? 15 : 6;
        return currentCredits < targetCredits;
      });

      const numNewRegs = Math.min(
        Math.floor(openSections.length * 0.1),
        studentsNeedingMoreCredits.length
      );

      for (let i = 0; i < numNewRegs; i++) {
        const student = rng.nextChoice(studentsNeedingMoreCredits);
        const section = rng.nextChoice(openSections);

        // Check if already registered
        const existing = await getPrisma().sectionRegistration.findUnique({
          where: {
            studentId_sectionId: {
              studentId: student.id,
              sectionId: section.id,
            },
          },
        });

        if (!existing) {
          await getPrisma().sectionRegistration.create({
            data: {
              studentId: student.id,
              sectionId: section.id,
              academicPeriodId: period.id,
              statusCode: 'REG',
              registrationDate: currentSimDate,
              registeredOn: currentSimDate,
              creditType: 'institutional',
              credits: Number(section.creditsMinimum),
              gradingOptionCode: 'GRAD',
              academicLoad: student.studentLoad || 'full-time',
              residencyStatus: student.isInState ? 'in-state' : 'out-of-state',
              attendanceRate: rng.nextFloat(0.7, 1.0),
            },
          });

          await getPrisma().section.update({
            where: { id: section.id },
            data: {
              enrolled: { increment: 1 },
              available: { decrement: 1 },
            },
          });
        }
      }

      if (numNewRegs > 0) {
        console.log(`     Added ${numNewRegs} new registrations`);
      }
    }

    // 2. Attendance updates
    const activeRegistrations = await getPrisma().sectionRegistration.findMany({
      where: {
        academicPeriodId: period.id,
        statusCode: 'REG',
      },
      include: { student: true },
    });

    for (const reg of activeRegistrations) {
      let newAttendance = reg.attendanceRate || 1.0;

      // Adjust based on risk factors
      const attendanceChange = rng.nextFloat(-0.05, 0.05);
      newAttendance += attendanceChange;

      // Risk factor adjustments
      if (reg.student.workHoursPerWeek >= 30) newAttendance -= 0.02;
      if (reg.student.commuteMinutes >= 30) newAttendance -= 0.01;
      if (reg.student.hasHousingInstability) newAttendance -= 0.03;

      newAttendance = Math.max(0, Math.min(1, newAttendance));

      await getPrisma().sectionRegistration.update({
        where: { id: reg.id },
        data: { attendanceRate: newAttendance },
      });
    }

    // 3. Grade progression
    for (const reg of activeRegistrations) {
      if (isMidterm && !reg.midtermGrade) {
        // Assign midterm grade
        const student = await getPrisma().student.findUnique({
          where: { id: reg.studentId },
          include: { transcriptGrades: true },
        });

        if (student) {
          // Calculate current GPA
          const completedGrades = student.transcriptGrades.filter((g) => g.status === 'final');
          let gpa = 2.9; // Default
          if (completedGrades.length > 0) {
            const totalPoints = completedGrades.reduce(
              (sum, g) => sum + Number(g.gradePoints || 0) * Number(g.creditsEarned),
              0
            );
            const totalCredits = completedGrades.reduce((sum, g) => sum + Number(g.creditsEarned), 0);
            gpa = totalCredits > 0 ? totalPoints / totalCredits : 2.9;
          }

          // Adjust based on attendance
          const attendanceFactor = (reg.attendanceRate || 1.0) - 0.85;
          const midtermGPA = Math.max(0, Math.min(4, gpa + attendanceFactor * 0.3 + rng.nextFloat(-0.2, 0.2)));
          const midtermGrade = getGradeFromGPA(midtermGPA, rng);

          await getPrisma().sectionRegistration.update({
            where: { id: reg.id },
            data: { midtermGrade },
          });
        }
      }

      if (isLateTerm && !reg.finalGrade) {
        // Progress toward final grade
        const student = await getPrisma().student.findUnique({
          where: { id: reg.studentId },
          include: { transcriptGrades: true },
        });

        if (student) {
          const completedGrades = student.transcriptGrades.filter((g) => g.status === 'final');
          let gpa = 2.9;
          if (completedGrades.length > 0) {
            const totalPoints = completedGrades.reduce(
              (sum, g) => sum + Number(g.gradePoints || 0) * Number(g.creditsEarned),
              0
            );
            const totalCredits = completedGrades.reduce((sum, g) => sum + Number(g.creditsEarned), 0);
            gpa = totalCredits > 0 ? totalPoints / totalCredits : 2.9;
          }

          const attendanceFactor = (reg.attendanceRate || 1.0) - 0.85;
          const midtermAdjustment = reg.midtermGrade
            ? (GRADE_POINTS[reg.midtermGrade] || 2.5) - gpa
            : 0;
          const finalGPA = Math.max(
            0,
            Math.min(4, gpa + attendanceFactor * 0.4 + midtermAdjustment * 0.3 + rng.nextFloat(-0.15, 0.15))
          );
          const finalGrade = getGradeFromGPA(finalGPA, rng);

          await getPrisma().sectionRegistration.update({
            where: { id: reg.id },
            data: { finalGrade },
          });
        }
      }
    }

    // 4. Risk recomputation
    const activeStudents = await getPrisma().student.findMany({
      where: { status: 'active' },
      include: {
        sectionRegistrations: {
          where: { academicPeriodId: period.id },
        },
        transcriptGrades: true,
      },
    });

    for (const student of activeStudents) {
      // Calculate average attendance
      const avgAttendance =
        student.sectionRegistrations.length > 0
          ? student.sectionRegistrations.reduce((sum, r) => sum + (r.attendanceRate || 1), 0) /
            student.sectionRegistrations.length
          : 1.0;

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

      const riskScores = calculateRiskScores(student, avgAttendance, gpa);

      // Update or create risk record
      await getPrisma().studentRisk.upsert({
        where: {
          studentId_academicPeriodId: {
            studentId: student.id,
            academicPeriodId: period.id,
          },
        },
        update: {
          attendanceRiskScore: riskScores.attendanceRisk,
          academicSupportRiskScore: riskScores.academicSupportRisk,
          overallRiskBucket: riskScores.overallBucket,
        },
        create: {
          studentId: student.id,
          academicPeriodId: period.id,
          attendanceRiskScore: riskScores.attendanceRisk,
          academicSupportRiskScore: riskScores.academicSupportRisk,
          overallRiskBucket: riskScores.overallBucket,
        },
      });
    }

    // 5. End-of-term logic
    if (nextWeek >= period.endOn) {
      console.log(`     Term ${period.code} ending - finalizing grades...`);

      const finalRegistrations = await getPrisma().sectionRegistration.findMany({
        where: {
          academicPeriodId: period.id,
          statusCode: 'REG',
        },
        include: { student: true, section: { include: { course: true } } },
      });

      for (const reg of finalRegistrations) {
        if (!reg.finalGrade) {
          // Finalize grade if not set
          const student = await getPrisma().student.findUnique({
            where: { id: reg.studentId },
            include: { transcriptGrades: true },
          });

          if (student) {
            const completedGrades = student.transcriptGrades.filter((g) => g.status === 'final');
            let gpa = 2.9;
            if (completedGrades.length > 0) {
              const totalPoints = completedGrades.reduce(
                (sum, g) => sum + Number(g.gradePoints || 0) * Number(g.creditsEarned),
                0
              );
              const totalCredits = completedGrades.reduce((sum, g) => sum + Number(g.creditsEarned), 0);
              gpa = totalCredits > 0 ? totalPoints / totalCredits : 2.9;
            }

            const finalGPA = Math.max(
              0,
              Math.min(4, gpa + ((reg.attendanceRate || 1.0) - 0.85) * 0.5 + rng.nextFloat(-0.1, 0.1))
            );
            const finalGrade = getGradeFromGPA(finalGPA, rng);

            await getPrisma().sectionRegistration.update({
              where: { id: reg.id },
              data: { finalGrade },
            });
          }
        }

        // Create transcript grade if doesn't exist
        const existingGrade = await getPrisma().studentTranscriptGrade.findUnique({
          where: { sectionRegistrationId: reg.id },
        });

        if (!existingGrade && reg.finalGrade) {
          const gradePoints = GRADE_POINTS[reg.finalGrade] || 0;
          const creditsEarned = reg.finalGrade === 'F' || reg.finalGrade === 'W' ? 0 : Number(reg.credits);

          await getPrisma().studentTranscriptGrade.create({
            data: {
              studentId: reg.studentId,
              sectionRegistrationId: reg.id,
              sectionId: reg.sectionId,
              academicPeriodId: period.id,
              courseId: reg.section.courseId,
              gradeSchemeCode: 'STANDARD',
              gradeValue: reg.finalGrade,
              gradePoints,
              qualityPoints: gradePoints * Number(reg.credits),
              creditsAttempted: Number(reg.credits),
              creditsEarned,
              finalGradeDate: period.endOn,
              status: 'final',
              incomplete: false,
              repeat: false,
            },
          });
        }
      }

      // Update period status
      await getPrisma().academicPeriod.update({
        where: { id: period.id },
        data: { status: 'closed' },
      });
    }
  }

  // Update simulation date
  await getPrisma().simulationState.update({
    where: { id: simState.id },
    data: {
      currentSimDate: nextWeek,
      lastTickDate: new Date(),
    },
  });

  console.log('✅ Weekly simulation tick completed');
  return { success: true, newDate: nextWeek };
}

// Allow running as script
if (require.main === module) {
  simulateWeek()
    .catch((e) => {
      console.error('❌ Simulation failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await getPrisma().$disconnect();
    });
}
