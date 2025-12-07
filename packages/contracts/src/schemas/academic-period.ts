import { z } from 'zod';

export const AcademicPeriodSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  title: z.string(),
  type: z.string(),
  startOn: z.string(),
  endOn: z.string(),
  censusOn: z.string().optional().nullable(),
  registrationStartOn: z.string().optional().nullable(),
  registrationEndOn: z.string().optional().nullable(),
  academicYear: z.string(),
  status: z.string(),
});

export type AcademicPeriod = z.infer<typeof AcademicPeriodSchema>;






