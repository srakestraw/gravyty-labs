import { prisma } from '../../../packages/db/src';
import {
  dbToBannerAcademicCredential,
  type AcademicCredential,
} from '../../../packages/contracts/src';

export class AcademicCredentialService {
  async findAll(filters?: {
    id?: string;
    studentId?: string;
    academicProgramId?: string;
    status?: string;
  }): Promise<AcademicCredential[]> {
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

    const credentials = await prisma.academicCredential.findMany({
      where,
      include: {
        academicProgram: true,
        academicPeriod: true,
      },
      orderBy: {
        awardedOn: 'desc',
      },
    });

    return credentials.map(dbToBannerAcademicCredential);
  }

  async findById(id: string): Promise<AcademicCredential | null> {
    const credential = await prisma.academicCredential.findUnique({
      where: { id },
      include: {
        academicProgram: true,
        academicPeriod: true,
      },
    });

    if (!credential) return null;
    return dbToBannerAcademicCredential(credential);
  }
}

