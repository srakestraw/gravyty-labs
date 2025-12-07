import { prisma } from '../../../packages/db/src';
import {
  dbToBannerStudentTranscriptGrade,
  type StudentTranscriptGrade,
} from '../../../packages/contracts/src';

export class StudentTranscriptGradeService {
  async findAll(filters?: {
    id?: string;
    studentId?: string;
    sectionId?: string;
    sectionRegistrationId?: string;
    academicPeriodId?: string;
    academicPeriodCode?: string;
    courseId?: string;
    status?: string;
  }): Promise<StudentTranscriptGrade[]> {
    const where: any = {};
    if (filters?.id) {
      where.id = filters.id;
    }
    if (filters?.studentId) {
      where.studentId = filters.studentId;
    }
    if (filters?.sectionId) {
      where.sectionId = filters.sectionId;
    }
    if (filters?.sectionRegistrationId) {
      where.sectionRegistrationId = filters.sectionRegistrationId;
    }
    if (filters?.academicPeriodId) {
      where.academicPeriodId = filters.academicPeriodId;
    }
    if (filters?.academicPeriodCode) {
      where.academicPeriod = {
        code: filters.academicPeriodCode,
      };
    }
    if (filters?.courseId) {
      where.courseId = filters.courseId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    const grades = await prisma.studentTranscriptGrade.findMany({
      where,
      include: {
        academicPeriod: true,
      },
      orderBy: {
        finalGradeDate: 'desc',
      },
    });

    return grades.map(dbToBannerStudentTranscriptGrade);
  }

  async findById(id: string): Promise<StudentTranscriptGrade | null> {
    const grade = await prisma.studentTranscriptGrade.findUnique({
      where: { id },
      include: {
        academicPeriod: true,
      },
    });

    if (!grade) return null;
    return dbToBannerStudentTranscriptGrade(grade);
  }
}

