"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentSchema = exports.PersonReferenceSchema = exports.EntryAcademicPeriodSchema = exports.AcademicStandingSchema = void 0;
const zod_1 = require("zod");
exports.AcademicStandingSchema = zod_1.z.object({
    code: zod_1.z.string(),
    title: zod_1.z.string(),
});
exports.EntryAcademicPeriodSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    code: zod_1.z.string(),
});
exports.PersonReferenceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.StudentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    person: exports.PersonReferenceSchema,
    type: zod_1.z.string(),
    status: zod_1.z.string(),
    startOn: zod_1.z.string(),
    entryAcademicPeriod: exports.EntryAcademicPeriodSchema.optional().nullable(),
    academicLevel: zod_1.z.string().optional().nullable(),
    residency: zod_1.z.string().optional().nullable(),
    studentClassification: zod_1.z.string().optional().nullable(),
    studentLoad: zod_1.z.string().optional().nullable(),
    academicStanding: exports.AcademicStandingSchema.optional().nullable(),
    studentNumber: zod_1.z.string(),
    studentId: zod_1.z.string().optional(),
});
