"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionRegistrationSchema = exports.GradingOptionSchema = exports.RegistrationStatusSchema = exports.AcademicPeriodReferenceSchema = exports.SectionReferenceSchema = exports.StudentReferenceSchema = void 0;
const zod_1 = require("zod");
exports.StudentReferenceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.SectionReferenceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.AcademicPeriodReferenceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    code: zod_1.z.string(),
});
exports.RegistrationStatusSchema = zod_1.z.object({
    code: zod_1.z.string(),
    title: zod_1.z.string(),
});
exports.GradingOptionSchema = zod_1.z.object({
    code: zod_1.z.string(),
    title: zod_1.z.string(),
});
exports.SectionRegistrationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    student: exports.StudentReferenceSchema,
    section: exports.SectionReferenceSchema,
    academicPeriod: exports.AcademicPeriodReferenceSchema,
    status: exports.RegistrationStatusSchema,
    registrationDate: zod_1.z.string(),
    registeredOn: zod_1.z.string(),
    creditType: zod_1.z.string(),
    credits: zod_1.z.number(),
    gradingOption: exports.GradingOptionSchema.optional().nullable(),
    academicLoad: zod_1.z.string().optional().nullable(),
    residencyStatus: zod_1.z.string().optional().nullable(),
});
