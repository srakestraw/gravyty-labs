import { z } from 'zod';

export const StudentReferenceSchema = z.object({
  id: z.string().uuid(),
});

export const CredentialSchema = z.object({
  code: z.string(),
  title: z.string(),
});

export const AcademicProgramReferenceSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
});

export const AcademicPeriodReferenceSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
});

export const HonorSchema = z.object({
  code: z.string(),
  title: z.string(),
});

export const AcademicCredentialSchema = z.object({
  id: z.string().uuid(),
  student: StudentReferenceSchema,
  credential: CredentialSchema,
  academicProgram: AcademicProgramReferenceSchema.optional().nullable(),
  awardedOn: z.string(),
  status: z.string(),
  academicPeriod: AcademicPeriodReferenceSchema.optional().nullable(),
  honors: z.array(HonorSchema).optional(),
});

export type AcademicCredential = z.infer<typeof AcademicCredentialSchema>;






