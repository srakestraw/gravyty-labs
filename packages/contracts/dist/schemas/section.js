"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionSchema = exports.SectionCreditsSchema = exports.InstructorSchema = exports.ScheduleSchema = exports.RoomSchema = exports.InstructionalMethodSchema = exports.AcademicPeriodReferenceSchema = exports.CourseReferenceSchema = void 0;
const zod_1 = require("zod");
exports.CourseReferenceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.AcademicPeriodReferenceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    code: zod_1.z.string(),
});
exports.InstructionalMethodSchema = zod_1.z.object({
    code: zod_1.z.string(),
    title: zod_1.z.string(),
});
exports.RoomSchema = zod_1.z.object({
    building: zod_1.z.string(),
    number: zod_1.z.string(),
});
exports.ScheduleSchema = zod_1.z.object({
    daysOfWeek: zod_1.z.array(zod_1.z.string()),
    startTime: zod_1.z.string().optional().nullable(),
    endTime: zod_1.z.string().optional().nullable(),
    room: exports.RoomSchema.optional().nullable(),
});
exports.InstructorSchema = zod_1.z.object({
    person: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
    role: zod_1.z.string(),
});
exports.SectionCreditsSchema = zod_1.z.object({
    creditType: zod_1.z.string(),
    minimum: zod_1.z.number(),
    maximum: zod_1.z.number(),
});
exports.SectionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    course: exports.CourseReferenceSchema,
    academicPeriod: exports.AcademicPeriodReferenceSchema,
    number: zod_1.z.string(),
    title: zod_1.z.string().optional().nullable(),
    crn: zod_1.z.string(),
    startOn: zod_1.z.string(),
    endOn: zod_1.z.string(),
    status: zod_1.z.string(),
    capacity: zod_1.z.number(),
    enrolled: zod_1.z.number(),
    available: zod_1.z.number(),
    waitlistCapacity: zod_1.z.number().optional().nullable(),
    waitlistEnrolled: zod_1.z.number().optional().nullable(),
    instructionalMethod: exports.InstructionalMethodSchema.optional().nullable(),
    schedule: exports.ScheduleSchema.optional().nullable(),
    instructors: zod_1.z.array(exports.InstructorSchema).optional(),
    credits: exports.SectionCreditsSchema,
});
