"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicProgramReferenceSchema = exports.SectionReferenceSchema = exports.CourseReferenceSchema = exports.AcademicPeriodReferenceSchema = exports.StudentReferenceSchema = void 0;
const zod_1 = require("zod");
// Shared reference schemas used across multiple entities
exports.StudentReferenceSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
exports.AcademicPeriodReferenceSchema = zod_1.z.object({
    id: zod_1.z.string(),
    code: zod_1.z.string(),
});
exports.CourseReferenceSchema = zod_1.z.object({
    id: zod_1.z.string(),
    number: zod_1.z.string(),
    title: zod_1.z.string(),
});
exports.SectionReferenceSchema = zod_1.z.object({
    id: zod_1.z.string(),
    crn: zod_1.z.string(),
});
exports.AcademicProgramReferenceSchema = zod_1.z.object({
    id: zod_1.z.string(),
    code: zod_1.z.string(),
    title: zod_1.z.string(),
});
