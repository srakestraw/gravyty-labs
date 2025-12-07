import { z } from 'zod';

export const StudentReferenceSchema = z.object({
  id: z.string().uuid(),
});

export const SectionRegistrationReferenceSchema = z.object({
  id: z.string().uuid(),
});

export const SectionReferenceSchema = z.object({
  id: z.string().uuid(),
});

export const AcademicPeriodReferenceSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
});

export const CourseReferenceSchema = z.object({
  id: z.string().uuid(),
});

export const GradeSchemeSchema = z.object({
  code: z.string(),
  title: z.string(),
});

export const GradeSchema = z.object({
  scheme: GradeSchemeSchema.optional().nullable(),
  value: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
});

export const StudentTranscriptGradeSchema = z.object({
  id: z.string().uuid(),
  student: StudentReferenceSchema,
  sectionRegistration: SectionRegistrationReferenceSchema,
  section: SectionReferenceSchema,
  academicPeriod: AcademicPeriodReferenceSchema,
  course: CourseReferenceSchema,
  grade: GradeSchema,
  gradePoints: z.number().optional().nullable(),
  qualityPoints: z.number().optional().nullable(),
  creditsAttempted: z.number(),
  creditsEarned: z.number(),
  finalGradeDate: z.string().optional().nullable(),
  status: z.string(),
  incomplete: z.boolean(),
  repeat: z.boolean(),
});

export type StudentTranscriptGrade = z.infer<typeof StudentTranscriptGradeSchema>;






