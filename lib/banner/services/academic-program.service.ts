import { prisma } from '../../../packages/db/src';
import {
  dbToBannerAcademicProgram,
  type AcademicProgram,
} from '../../../packages/contracts/src';

export class AcademicProgramService {
  async findAll(filters?: {
    id?: string;
    code?: string;
    status?: string;
    type?: string;
    level?: string;
  }): Promise<AcademicProgram[]> {
    const where: any = {};
    if (filters?.id) {
      where.id = filters.id;
    }
    if (filters?.code) {
      where.code = filters.code;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.level) {
      where.level = filters.level;
    }

    const programs = await prisma.academicProgram.findMany({
      where,
      orderBy: {
        code: 'asc',
      },
    });

    return programs.map(dbToBannerAcademicProgram);
  }

  async findById(id: string): Promise<AcademicProgram | null> {
    const program = await prisma.academicProgram.findUnique({
      where: { id },
    });

    if (!program) return null;
    return dbToBannerAcademicProgram(program);
  }
}

