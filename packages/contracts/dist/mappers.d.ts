import type { Person, Student, AcademicPeriod, Course, Section, SectionRegistration, AcademicProgram, StudentAcademicProgram, AcademicCredential, StudentTranscriptGrade } from './index';
type PrismaPerson = any;
type PersonName = any;
type EmailAddress = any;
type Phone = any;
type Address = any;
type PrismaStudent = any;
type PrismaAcademicPeriod = any;
type PrismaCourse = any;
type PrismaSection = any;
type PrismaSectionRegistration = any;
type PrismaAcademicProgram = any;
type PrismaStudentAcademicProgram = any;
type PrismaAcademicCredential = any;
type PrismaStudentTranscriptGrade = any;
export declare function dbToBannerPerson(person: PrismaPerson & {
    names: PersonName[];
    emails: EmailAddress[];
    phones: Phone[];
    addresses: Address[];
}): Person;
export declare function dbToBannerStudent(student: PrismaStudent & {
    entryAcademicPeriod: PrismaAcademicPeriod | null;
}): Student;
export declare function dbToBannerAcademicPeriod(period: PrismaAcademicPeriod): AcademicPeriod;
export declare function dbToBannerCourse(course: PrismaCourse): Course;
export declare function dbToBannerSection(section: PrismaSection & {
    course: PrismaCourse;
    academicPeriod: PrismaAcademicPeriod;
    instructor?: PrismaPerson | null;
}): Section;
export declare function dbToBannerSectionRegistration(registration: PrismaSectionRegistration & {
    academicPeriod: PrismaAcademicPeriod;
}): SectionRegistration;
export declare function dbToBannerAcademicProgram(program: PrismaAcademicProgram): AcademicProgram;
export declare function dbToBannerStudentAcademicProgram(studentProgram: PrismaStudentAcademicProgram & {
    academicProgram: PrismaAcademicProgram;
}): StudentAcademicProgram;
export declare function dbToBannerAcademicCredential(credential: PrismaAcademicCredential & {
    academicProgram: PrismaAcademicProgram | null;
    academicPeriod: PrismaAcademicPeriod | null;
}): AcademicCredential;
export declare function dbToBannerStudentTranscriptGrade(grade: PrismaStudentTranscriptGrade & {
    academicPeriod: PrismaAcademicPeriod;
}): StudentTranscriptGrade;
export {};
