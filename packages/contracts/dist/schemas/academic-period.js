"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicPeriodSchema = void 0;
const zod_1 = require("zod");
exports.AcademicPeriodSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    code: zod_1.z.string(),
    title: zod_1.z.string(),
    type: zod_1.z.string(),
    startOn: zod_1.z.string(),
    endOn: zod_1.z.string(),
    censusOn: zod_1.z.string().optional().nullable(),
    registrationStartOn: zod_1.z.string().optional().nullable(),
    registrationEndOn: zod_1.z.string().optional().nullable(),
    academicYear: zod_1.z.string(),
    status: zod_1.z.string(),
});
