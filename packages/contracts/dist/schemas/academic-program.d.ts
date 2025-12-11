import { z } from 'zod';
export declare const DegreeSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    title: string;
}, {
    code: string;
    title: string;
}>;
export declare const AccreditationSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    title: string;
}, {
    code: string;
    title: string;
}>;
export declare const AcademicProgramSchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
    title: z.ZodString;
    type: z.ZodString;
    level: z.ZodString;
    degree: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        title: string;
    }, {
        code: string;
        title: string;
    }>>>;
    status: z.ZodString;
    startOn: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    endOn: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    accreditation: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        title: string;
    }, {
        code: string;
        title: string;
    }>>>;
    creditsRequired: z.ZodNumber;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    code: string;
    type: string;
    status: string;
    title: string;
    level: string;
    creditsRequired: number;
    startOn?: string | null | undefined;
    endOn?: string | null | undefined;
    description?: string | null | undefined;
    degree?: {
        code: string;
        title: string;
    } | null | undefined;
    accreditation?: {
        code: string;
        title: string;
    } | null | undefined;
}, {
    id: string;
    code: string;
    type: string;
    status: string;
    title: string;
    level: string;
    creditsRequired: number;
    startOn?: string | null | undefined;
    endOn?: string | null | undefined;
    description?: string | null | undefined;
    degree?: {
        code: string;
        title: string;
    } | null | undefined;
    accreditation?: {
        code: string;
        title: string;
    } | null | undefined;
}>;
export type AcademicProgram = z.infer<typeof AcademicProgramSchema>;
