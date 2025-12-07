import { z } from 'zod';

export const DegreeSchema = z.object({
  code: z.string(),
  title: z.string(),
});

export const AccreditationSchema = z.object({
  code: z.string(),
  title: z.string(),
});

export const AcademicProgramSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  title: z.string(),
  type: z.string(),
  level: z.string(),
  degree: DegreeSchema.optional().nullable(),
  status: z.string(),
  startOn: z.string().optional().nullable(),
  endOn: z.string().optional().nullable(),
  accreditation: AccreditationSchema.optional().nullable(),
  creditsRequired: z.number(),
  description: z.string().optional().nullable(),
});

export type AcademicProgram = z.infer<typeof AcademicProgramSchema>;






