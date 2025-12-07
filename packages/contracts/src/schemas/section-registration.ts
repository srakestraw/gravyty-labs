import { z } from 'zod';

export const StudentReferenceSchema = z.object({
  id: z.string().uuid(),
});

export const SectionReferenceSchema = z.object({
  id: z.string().uuid(),
});

export const AcademicPeriodReferenceSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
});

export const RegistrationStatusSchema = z.object({
  code: z.string(),
  title: z.string(),
});

export const GradingOptionSchema = z.object({
  code: z.string(),
  title: z.string(),
});

export const SectionRegistrationSchema = z.object({
  id: z.string().uuid(),
  student: StudentReferenceSchema,
  section: SectionReferenceSchema,
  academicPeriod: AcademicPeriodReferenceSchema,
  status: RegistrationStatusSchema,
  registrationDate: z.string(),
  registeredOn: z.string(),
  creditType: z.string(),
  credits: z.number(),
  gradingOption: GradingOptionSchema.optional().nullable(),
  academicLoad: z.string().optional().nullable(),
  residencyStatus: z.string().optional().nullable(),
});

export type SectionRegistration = z.infer<typeof SectionRegistrationSchema>;






