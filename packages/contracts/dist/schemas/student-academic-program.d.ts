import { z } from 'zod';
export declare const StudentReferenceSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const AcademicProgramReferenceSchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    code: string;
}, {
    id: string;
    code: string;
}>;
export declare const StudentAcademicProgramSchema: z.ZodObject<{
    id: z.ZodString;
    student: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    academicProgram: z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        code: string;
    }, {
        id: string;
        code: string;
    }>;
    startOn: z.ZodString;
    endOn: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodString;
    catalogYear: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    primary: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: string;
    startOn: string;
    student: {
        id: string;
    };
    academicProgram: {
        id: string;
        code: string;
    };
    primary: boolean;
    endOn?: string | null | undefined;
    catalogYear?: string | null | undefined;
}, {
    id: string;
    status: string;
    startOn: string;
    student: {
        id: string;
    };
    academicProgram: {
        id: string;
        code: string;
    };
    primary: boolean;
    endOn?: string | null | undefined;
    catalogYear?: string | null | undefined;
}>;
export type StudentAcademicProgram = z.infer<typeof StudentAcademicProgramSchema>;
