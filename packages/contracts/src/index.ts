// Export shared reference schemas first (to avoid conflicts)
export * from './schemas/references';

// Export all schemas (using explicit exports to avoid duplicate reference schema conflicts)
export * from './schemas/person';
export * from './schemas/student';
export * from './schemas/academic-period';
export * from './schemas/course';
export {
  InstructionalMethodSchema,
  RoomSchema,
  ScheduleSchema,
  InstructorSchema,
  SectionCreditsSchema,
  SectionSchema,
  type Section,
} from './schemas/section';
export {
  RegistrationStatusSchema,
  GradingOptionSchema,
  SectionRegistrationSchema,
  SectionReferenceSchema,
  type SectionRegistration,
} from './schemas/section-registration';
export * from './schemas/academic-program';
export {
  StudentAcademicProgramSchema,
  type StudentAcademicProgram,
} from './schemas/student-academic-program';
export {
  HonorSchema,
  AcademicCredentialSchema,
  type AcademicCredential,
} from './schemas/academic-credential';
export {
  SectionRegistrationReferenceSchema,
  GradeSchemeSchema,
  GradeSchema,
  StudentTranscriptGradeSchema,
  type StudentTranscriptGrade,
} from './schemas/student-transcript-grade';

// Narrative Platform schemas (Phase 0)
export * from './schemas/narrative';

// Export mappers
export * from './mappers';

// Export config
export * from './config';

