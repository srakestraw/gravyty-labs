import { prisma } from '../../../packages/db/src';
import {
  dbToBannerSection,
  type Section,
} from '../../../packages/contracts/src';

export class SectionService {
  async findAll(filters?: {
    id?: string;
    courseId?: string;
    academicPeriodId?: string;
    academicPeriodCode?: string;
    crn?: string;
    status?: string;
  }): Promise<Section[]> {
    const where: any = {};
    if (filters?.id) {
      where.id = filters.id;
    }
    if (filters?.courseId) {
      where.courseId = filters.courseId;
    }
    if (filters?.academicPeriodId) {
      where.academicPeriodId = filters.academicPeriodId;
    }
    if (filters?.academicPeriodCode) {
      where.academicPeriod = {
        code: filters.academicPeriodCode,
      };
    }
    if (filters?.crn) {
      where.crn = filters.crn;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    const sections = await prisma.section.findMany({
      where,
      include: {
        course: true,
        academicPeriod: true,
        instructor: true,
      },
      orderBy: {
        crn: 'asc',
      },
    });

    return sections.map(dbToBannerSection);
  }

  async findById(id: string): Promise<Section | null> {
    const section = await prisma.section.findUnique({
      where: { id },
      include: {
        course: true,
        academicPeriod: true,
        instructor: true,
      },
    });

    if (!section) return null;
    return dbToBannerSection(section);
  }
}

