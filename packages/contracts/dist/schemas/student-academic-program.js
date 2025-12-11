"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentAcademicProgramSchema = exports.AcademicProgramReferenceSchema = exports.StudentReferenceSchema = void 0;
const zod_1 = require("zod");
exports.StudentReferenceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.AcademicProgramReferenceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    code: zod_1.z.string(),
});
exports.StudentAcademicProgramSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    student: exports.StudentReferenceSchema,
    academicProgram: exports.AcademicProgramReferenceSchema,
    startOn: zod_1.z.string(),
    endOn: zod_1.z.string().optional().nullable(),
    status: zod_1.z.string(),
    catalogYear: zod_1.z.string().optional().nullable(),
    primary: zod_1.z.boolean(),
});
