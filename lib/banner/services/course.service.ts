import { prisma } from '../../../packages/db/src';
import {
  dbToBannerCourse,
  type Course,
} from '../../../packages/contracts/src';

export class CourseService {
  async findAll(filters?: {
    id?: string;
    subjectCode?: string;
    number?: string;
    status?: string;
  }): Promise<Course[]> {
    const where: any = {};
    if (filters?.id) {
      where.id = filters.id;
    }
    if (filters?.subjectCode) {
      where.subjectCode = filters.subjectCode;
    }
    if (filters?.number) {
      where.number = filters.number;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: [
        { subjectCode: 'asc' },
        { number: 'asc' },
      ],
    });

    return courses.map(dbToBannerCourse);
  }

  async findById(id: string): Promise<Course | null> {
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) return null;
    return dbToBannerCourse(course);
  }
}

