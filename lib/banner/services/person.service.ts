import { prisma } from '../../../packages/db/src';
import {
  dbToBannerPerson,
  type Person,
} from '../../../packages/contracts/src';

export class PersonService {
  async findAll(filters?: { id?: string }): Promise<Person[]> {
    const where: any = {};
    if (filters?.id) {
      where.id = filters.id;
    }

    const persons = await prisma.person.findMany({
      where,
      include: {
        names: true,
        emails: true,
        phones: true,
        addresses: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return persons.map(dbToBannerPerson);
  }

  async findById(id: string): Promise<Person | null> {
    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        names: true,
        emails: true,
        phones: true,
        addresses: true,
      },
    });

    if (!person) return null;
    return dbToBannerPerson(person);
  }
}

