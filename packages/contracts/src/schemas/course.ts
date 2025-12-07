import { z } from 'zod';

export const SubjectSchema = z.object({
  code: z.string(),
  title: z.string(),
});

export const CreditsSchema = z.object({
  creditType: z.string(),
  minimum: z.number(),
  maximum: z.number(),
  increment: z.number().optional().nullable(),
});

export const PrerequisiteCourseSchema = z.object({
  course: z.object({
    id: z.string().uuid(),
  }),
});

export const CourseSchema = z.object({
  id: z.string().uuid(),
  subject: SubjectSchema,
  number: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  credits: CreditsSchema,
  courseLevel: z.string(),
  status: z.string(),
  effectiveStartDate: z.string().optional().nullable(),
  effectiveEndDate: z.string().optional().nullable(),
  catalogYear: z.string().optional().nullable(),
  prerequisites: z.array(PrerequisiteCourseSchema).optional(),
  corequisites: z.array(PrerequisiteCourseSchema).optional(),
});

export type Course = z.infer<typeof CourseSchema>;






