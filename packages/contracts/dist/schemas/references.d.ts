import { z } from 'zod';
export declare const StudentReferenceSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const AcademicPeriodReferenceSchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    code: string;
}, {
    id: string;
    code: string;
}>;
export declare const CourseReferenceSchema: z.ZodObject<{
    id: z.ZodString;
    number: z.ZodString;
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    number: string;
    id: string;
    title: string;
}, {
    number: string;
    id: string;
    title: string;
}>;
export declare const SectionReferenceSchema: z.ZodObject<{
    id: z.ZodString;
    crn: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    crn: string;
}, {
    id: string;
    crn: string;
}>;
export declare const AcademicProgramReferenceSchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    code: string;
    title: string;
}, {
    id: string;
    code: string;
    title: string;
}>;
