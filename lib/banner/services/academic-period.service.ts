import { prisma } from '../../../packages/db/src';
import {
  dbToBannerAcademicPeriod,
  type AcademicPeriod,
} from '../../../packages/contracts/src';

export class AcademicPeriodService {
  async findAll(filters?: { id?: string; code?: string; status?: string }): Promise<AcademicPeriod[]> {
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

    const periods = await prisma.academicPeriod.findMany({
      where,
      orderBy: {
        startOn: 'desc',
      },
    });

    return periods.map(dbToBannerAcademicPeriod);
  }

  async findById(id: string): Promise<AcademicPeriod | null> {
    const period = await prisma.academicPeriod.findUnique({
      where: { id },
    });

    if (!period) return null;
    return dbToBannerAcademicPeriod(period);
  }

  async findByCode(code: string): Promise<AcademicPeriod | null> {
    const period = await prisma.academicPeriod.findUnique({
      where: { code },
    });

    if (!period) return null;
    return dbToBannerAcademicPeriod(period);
  }
}

