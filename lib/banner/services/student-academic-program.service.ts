import { prisma } from '../../../packages/db/src';
import {
  dbToBannerStudentAcademicProgram,
  type StudentAcademicProgram,
} from '../../../packages/contracts/src';

export class StudentAcademicProgramService {
  async findAll(filters?: {
    id?: string;
    studentId?: string;
    academicProgramId?: string;
    status?: string;
  }): Promise<StudentAcademicProgram[]> {
    const where: any = {};
    if (filters?.id) {
      where.id = filters.id;
    }
    if (filters?.studentId) {
      where.studentId = filters.studentId;
    }
    if (filters?.academicProgramId) {
      where.academicProgramId = filters.academicProgramId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    const studentPrograms = await prisma.studentAcademicProgram.findMany({
      where,
      include: {
        academicProgram: true,
      },
      orderBy: {
        startOn: 'desc',
      },
    });

    return studentPrograms.map(dbToBannerStudentAcademicProgram);
  }

  async findById(id: string): Promise<StudentAcademicProgram | null> {
    const studentProgram = await prisma.studentAcademicProgram.findUnique({
      where: { id },
      include: {
        academicProgram: true,
      },
    });

    if (!studentProgram) return null;
    return dbToBannerStudentAcademicProgram(studentProgram);
  }
}

