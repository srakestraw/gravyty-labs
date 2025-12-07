import { z } from 'zod';

export const AcademicStandingSchema = z.object({
  code: z.string(),
  title: z.string(),
});

export const EntryAcademicPeriodSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
});

export const PersonReferenceSchema = z.object({
  id: z.string().uuid(),
});

export const StudentSchema = z.object({
  id: z.string().uuid(),
  person: PersonReferenceSchema,
  type: z.string(),
  status: z.string(),
  startOn: z.string(),
  entryAcademicPeriod: EntryAcademicPeriodSchema.optional().nullable(),
  academicLevel: z.string().optional().nullable(),
  residency: z.string().optional().nullable(),
  studentClassification: z.string().optional().nullable(),
  studentLoad: z.string().optional().nullable(),
  academicStanding: AcademicStandingSchema.optional().nullable(),
  studentNumber: z.string(),
  studentId: z.string().optional(),
});

export type Student = z.infer<typeof StudentSchema>;






