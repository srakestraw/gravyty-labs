import { prisma } from '../../../packages/db/src';
import {
  dbToBannerSectionRegistration,
  type SectionRegistration,
} from '../../../packages/contracts/src';

export class SectionRegistrationService {
  async findAll(filters?: {
    id?: string;
    studentId?: string;
    sectionId?: string;
    academicPeriodId?: string;
    academicPeriodCode?: string;
    statusCode?: string;
  }): Promise<SectionRegistration[]> {
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
    if (filters?.academicPeriodId) {
      where.academicPeriodId = filters.academicPeriodId;
    }
    if (filters?.academicPeriodCode) {
      where.academicPeriod = {
        code: filters.academicPeriodCode,
      };
    }
    if (filters?.statusCode) {
      where.statusCode = filters.statusCode;
    }

    const registrations = await prisma.sectionRegistration.findMany({
      where,
      include: {
        academicPeriod: true,
      },
      orderBy: {
        registeredOn: 'desc',
      },
    });

    return registrations.map(dbToBannerSectionRegistration);
  }

  async findById(id: string): Promise<SectionRegistration | null> {
    const registration = await prisma.sectionRegistration.findUnique({
      where: { id },
      include: {
        academicPeriod: true,
      },
    });

    if (!registration) return null;
    return dbToBannerSectionRegistration(registration);
  }
}

