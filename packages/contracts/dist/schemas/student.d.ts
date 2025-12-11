import { z } from 'zod';
export declare const AcademicStandingSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    title: string;
}, {
    code: string;
    title: string;
}>;
export declare const EntryAcademicPeriodSchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    code: string;
}, {
    id: string;
    code: string;
}>;
export declare const PersonReferenceSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const StudentSchema: z.ZodObject<{
    id: z.ZodString;
    person: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    type: z.ZodString;
    status: z.ZodString;
    startOn: z.ZodString;
    entryAcademicPeriod: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        code: string;
    }, {
        id: string;
        code: string;
    }>>>;
    academicLevel: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    residency: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    studentClassification: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    studentLoad: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    academicStanding: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        title: string;
    }, {
        code: string;
        title: string;
    }>>>;
    studentNumber: z.ZodString;
    studentId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: string;
    status: string;
    person: {
        id: string;
    };
    startOn: string;
    studentNumber: string;
    entryAcademicPeriod?: {
        id: string;
        code: string;
    } | null | undefined;
    academicLevel?: string | null | undefined;
    residency?: string | null | undefined;
    studentClassification?: string | null | undefined;
    studentLoad?: string | null | undefined;
    academicStanding?: {
        code: string;
        title: string;
    } | null | undefined;
    studentId?: string | undefined;
}, {
    id: string;
    type: string;
    status: string;
    person: {
        id: string;
    };
    startOn: string;
    studentNumber: string;
    entryAcademicPeriod?: {
        id: string;
        code: string;
    } | null | undefined;
    academicLevel?: string | null | undefined;
    residency?: string | null | undefined;
    studentClassification?: string | null | undefined;
    studentLoad?: string | null | undefined;
    academicStanding?: {
        code: string;
        title: string;
    } | null | undefined;
    studentId?: string | undefined;
}>;
export type Student = z.infer<typeof StudentSchema>;
