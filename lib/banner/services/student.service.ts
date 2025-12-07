import { prisma } from '../../../packages/db/src';
import {
  dbToBannerStudent,
  type Student,
} from '../../../packages/contracts/src';

export class StudentService {
  async findAll(filters?: { 
    id?: string; 
    personId?: string; 
    studentNumber?: string;
    search?: string; // Search by name or email
  }): Promise<Student[]> {
    const where: any = {};
    
    if (filters?.id) {
      where.id = filters.id;
    }
    if (filters?.personId) {
      where.personId = filters.personId;
    }
    if (filters?.studentNumber) {
      where.studentNumber = filters.studentNumber;
    }

    // If search query is provided, search by name or email
    if (filters?.search) {
      const searchTerm = filters.search.trim();
      where.person = {
        OR: [
          {
            names: {
              some: {
                OR: [
                  { given: { contains: searchTerm, mode: 'insensitive' } },
                  { family: { contains: searchTerm, mode: 'insensitive' } },
                  { middle: { contains: searchTerm, mode: 'insensitive' } },
                ],
              },
            },
          },
          {
            emails: {
              some: {
                address: { contains: searchTerm, mode: 'insensitive' },
              },
            },
          },
        ],
      };
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        entryAcademicPeriod: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return students.map(dbToBannerStudent);
  }

  async findById(id: string): Promise<Student | null> {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        entryAcademicPeriod: true,
      },
    });

    if (!student) return null;
    return dbToBannerStudent(student);
  }
}

