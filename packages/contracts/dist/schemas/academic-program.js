"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicProgramSchema = exports.AccreditationSchema = exports.DegreeSchema = void 0;
const zod_1 = require("zod");
exports.DegreeSchema = zod_1.z.object({
    code: zod_1.z.string(),
    title: zod_1.z.string(),
});
exports.AccreditationSchema = zod_1.z.object({
    code: zod_1.z.string(),
    title: zod_1.z.string(),
});
exports.AcademicProgramSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    code: zod_1.z.string(),
    title: zod_1.z.string(),
    type: zod_1.z.string(),
    level: zod_1.z.string(),
    degree: exports.DegreeSchema.optional().nullable(),
    status: zod_1.z.string(),
    startOn: zod_1.z.string().optional().nullable(),
    endOn: zod_1.z.string().optional().nullable(),
    accreditation: exports.AccreditationSchema.optional().nullable(),
    creditsRequired: zod_1.z.number(),
    description: zod_1.z.string().optional().nullable(),
});
