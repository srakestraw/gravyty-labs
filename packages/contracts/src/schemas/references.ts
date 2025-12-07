import { z } from 'zod';

// Shared reference schemas used across multiple entities
export const StudentReferenceSchema = z.object({
  id: z.string(),
});

export const AcademicPeriodReferenceSchema = z.object({
  id: z.string(),
  code: z.string(),
});

export const CourseReferenceSchema = z.object({
  id: z.string(),
  number: z.string(),
  title: z.string(),
});

export const SectionReferenceSchema = z.object({
  id: z.string(),
  crn: z.string(),
});

export const AcademicProgramReferenceSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
});

