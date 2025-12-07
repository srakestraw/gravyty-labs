import { z } from 'zod';

export const CourseReferenceSchema = z.object({
  id: z.string().uuid(),
});

export const AcademicPeriodReferenceSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
});

export const InstructionalMethodSchema = z.object({
  code: z.string(),
  title: z.string(),
});

export const RoomSchema = z.object({
  building: z.string(),
  number: z.string(),
});

export const ScheduleSchema = z.object({
  daysOfWeek: z.array(z.string()),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  room: RoomSchema.optional().nullable(),
});

export const InstructorSchema = z.object({
  person: z.object({
    id: z.string().uuid(),
  }),
  role: z.string(),
});

export const SectionCreditsSchema = z.object({
  creditType: z.string(),
  minimum: z.number(),
  maximum: z.number(),
});

export const SectionSchema = z.object({
  id: z.string().uuid(),
  course: CourseReferenceSchema,
  academicPeriod: AcademicPeriodReferenceSchema,
  number: z.string(),
  title: z.string().optional().nullable(),
  crn: z.string(),
  startOn: z.string(),
  endOn: z.string(),
  status: z.string(),
  capacity: z.number(),
  enrolled: z.number(),
  available: z.number(),
  waitlistCapacity: z.number().optional().nullable(),
  waitlistEnrolled: z.number().optional().nullable(),
  instructionalMethod: InstructionalMethodSchema.optional().nullable(),
  schedule: ScheduleSchema.optional().nullable(),
  instructors: z.array(InstructorSchema).optional(),
  credits: SectionCreditsSchema,
});

export type Section = z.infer<typeof SectionSchema>;






