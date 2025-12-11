import { z } from 'zod';
export declare const StudentReferenceSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const CredentialSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    title: string;
}, {
    code: string;
    title: string;
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
export declare const HonorSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    title: string;
}, {
    code: string;
    title: string;
}>;
export declare const AcademicCredentialSchema: z.ZodObject<{
    id: z.ZodString;
    student: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    credential: z.ZodObject<{
        code: z.ZodString;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        title: string;
    }, {
        code: string;
        title: string;
    }>;
    academicProgram: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        code: string;
    }, {
        id: string;
        code: string;
    }>>>;
    awardedOn: z.ZodString;
    status: z.ZodString;
    academicPeriod: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        code: string;
    }, {
        id: string;
        code: string;
    }>>>;
    honors: z.ZodOptional<z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        title: string;
    }, {
        code: string;
        title: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: string;
    student: {
        id: string;
    };
    credential: {
        code: string;
        title: string;
    };
    awardedOn: string;
    academicPeriod?: {
        id: string;
        code: string;
    } | null | undefined;
    academicProgram?: {
        id: string;
        code: string;
    } | null | undefined;
    honors?: {
        code: string;
        title: string;
    }[] | undefined;
}, {
    id: string;
    status: string;
    student: {
        id: string;
    };
    credential: {
        code: string;
        title: string;
    };
    awardedOn: string;
    academicPeriod?: {
        id: string;
        code: string;
    } | null | undefined;
    academicProgram?: {
        id: string;
        code: string;
    } | null | undefined;
    honors?: {
        code: string;
        title: string;
    }[] | undefined;
}>;
export type AcademicCredential = z.infer<typeof AcademicCredentialSchema>;
