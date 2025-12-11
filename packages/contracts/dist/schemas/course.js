"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseSchema = exports.PrerequisiteCourseSchema = exports.CreditsSchema = exports.SubjectSchema = void 0;
const zod_1 = require("zod");
exports.SubjectSchema = zod_1.z.object({
    code: zod_1.z.string(),
    title: zod_1.z.string(),
});
exports.CreditsSchema = zod_1.z.object({
    creditType: zod_1.z.string(),
    minimum: zod_1.z.number(),
    maximum: zod_1.z.number(),
    increment: zod_1.z.number().optional().nullable(),
});
exports.PrerequisiteCourseSchema = zod_1.z.object({
    course: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
});
exports.CourseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    subject: exports.SubjectSchema,
    number: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().optional().nullable(),
    credits: exports.CreditsSchema,
    courseLevel: zod_1.z.string(),
    status: zod_1.z.string(),
    effectiveStartDate: zod_1.z.string().optional().nullable(),
    effectiveEndDate: zod_1.z.string().optional().nullable(),
    catalogYear: zod_1.z.string().optional().nullable(),
    prerequisites: zod_1.z.array(exports.PrerequisiteCourseSchema).optional(),
    corequisites: zod_1.z.array(exports.PrerequisiteCourseSchema).optional(),
});
