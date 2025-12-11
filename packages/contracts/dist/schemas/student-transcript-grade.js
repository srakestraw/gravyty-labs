"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentTranscriptGradeSchema = exports.GradeSchema = exports.GradeSchemeSchema = exports.CourseReferenceSchema = exports.AcademicPeriodReferenceSchema = exports.SectionReferenceSchema = exports.SectionRegistrationReferenceSchema = exports.StudentReferenceSchema = void 0;
const zod_1 = require("zod");
exports.StudentReferenceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.SectionRegistrationReferenceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.SectionReferenceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.AcademicPeriodReferenceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    code: zod_1.z.string(),
});
exports.CourseReferenceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.GradeSchemeSchema = zod_1.z.object({
    code: zod_1.z.string(),
    title: zod_1.z.string(),
});
exports.GradeSchema = zod_1.z.object({
    scheme: exports.GradeSchemeSchema.optional().nullable(),
    value: zod_1.z.string().optional().nullable(),
    title: zod_1.z.string().optional().nullable(),
});
exports.StudentTranscriptGradeSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    student: exports.StudentReferenceSchema,
    sectionRegistration: exports.SectionRegistrationReferenceSchema,
    section: exports.SectionReferenceSchema,
    academicPeriod: exports.AcademicPeriodReferenceSchema,
    course: exports.CourseReferenceSchema,
    grade: exports.GradeSchema,
    gradePoints: zod_1.z.number().optional().nullable(),
    qualityPoints: zod_1.z.number().optional().nullable(),
    creditsAttempted: zod_1.z.number(),
    creditsEarned: zod_1.z.number(),
    finalGradeDate: zod_1.z.string().optional().nullable(),
    status: zod_1.z.string(),
    incomplete: zod_1.z.boolean(),
    repeat: zod_1.z.boolean(),
});
