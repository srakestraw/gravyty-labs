"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicCredentialSchema = exports.HonorSchema = exports.AcademicPeriodReferenceSchema = exports.AcademicProgramReferenceSchema = exports.CredentialSchema = exports.StudentReferenceSchema = void 0;
const zod_1 = require("zod");
exports.StudentReferenceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.CredentialSchema = zod_1.z.object({
    code: zod_1.z.string(),
    title: zod_1.z.string(),
});
exports.AcademicProgramReferenceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    code: zod_1.z.string(),
});
exports.AcademicPeriodReferenceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    code: zod_1.z.string(),
});
exports.HonorSchema = zod_1.z.object({
    code: zod_1.z.string(),
    title: zod_1.z.string(),
});
exports.AcademicCredentialSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    student: exports.StudentReferenceSchema,
    credential: exports.CredentialSchema,
    academicProgram: exports.AcademicProgramReferenceSchema.optional().nullable(),
    awardedOn: zod_1.z.string(),
    status: zod_1.z.string(),
    academicPeriod: exports.AcademicPeriodReferenceSchema.optional().nullable(),
    honors: zod_1.z.array(exports.HonorSchema).optional(),
});
