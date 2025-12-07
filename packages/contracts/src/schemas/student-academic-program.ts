import { z } from 'zod';

export const StudentReferenceSchema = z.object({
  id: z.string().uuid(),
});

export const AcademicProgramReferenceSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
});

export const StudentAcademicProgramSchema = z.object({
  id: z.string().uuid(),
  student: StudentReferenceSchema,
  academicProgram: AcademicProgramReferenceSchema,
  startOn: z.string(),
  endOn: z.string().optional().nullable(),
  status: z.string(),
  catalogYear: z.string().optional().nullable(),
  primary: z.boolean(),
});

export type StudentAcademicProgram = z.infer<typeof StudentAcademicProgramSchema>;






