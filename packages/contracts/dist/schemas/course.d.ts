import { z } from 'zod';
export declare const SubjectSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    title: string;
}, {
    code: string;
    title: string;
}>;
export declare const CreditsSchema: z.ZodObject<{
    creditType: z.ZodString;
    minimum: z.ZodNumber;
    maximum: z.ZodNumber;
    increment: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    minimum: number;
    maximum: number;
    creditType: string;
    increment?: number | null | undefined;
}, {
    minimum: number;
    maximum: number;
    creditType: string;
    increment?: number | null | undefined;
}>;
export declare const PrerequisiteCourseSchema: z.ZodObject<{
    course: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    course: {
        id: string;
    };
}, {
    course: {
        id: string;
    };
}>;
export declare const CourseSchema: z.ZodObject<{
    id: z.ZodString;
    subject: z.ZodObject<{
        code: z.ZodString;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        title: string;
    }, {
        code: string;
        title: string;
    }>;
    number: z.ZodString;
    title: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    credits: z.ZodObject<{
        creditType: z.ZodString;
        minimum: z.ZodNumber;
        maximum: z.ZodNumber;
        increment: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        minimum: number;
        maximum: number;
        creditType: string;
        increment?: number | null | undefined;
    }, {
        minimum: number;
        maximum: number;
        creditType: string;
        increment?: number | null | undefined;
    }>;
    courseLevel: z.ZodString;
    status: z.ZodString;
    effectiveStartDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    effectiveEndDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    catalogYear: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    prerequisites: z.ZodOptional<z.ZodArray<z.ZodObject<{
        course: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        course: {
            id: string;
        };
    }, {
        course: {
            id: string;
        };
    }>, "many">>;
    corequisites: z.ZodOptional<z.ZodArray<z.ZodObject<{
        course: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        course: {
            id: string;
        };
    }, {
        course: {
            id: string;
        };
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    number: string;
    id: string;
    status: string;
    title: string;
    subject: {
        code: string;
        title: string;
    };
    credits: {
        minimum: number;
        maximum: number;
        creditType: string;
        increment?: number | null | undefined;
    };
    courseLevel: string;
    description?: string | null | undefined;
    effectiveStartDate?: string | null | undefined;
    effectiveEndDate?: string | null | undefined;
    catalogYear?: string | null | undefined;
    prerequisites?: {
        course: {
            id: string;
        };
    }[] | undefined;
    corequisites?: {
        course: {
            id: string;
        };
    }[] | undefined;
}, {
    number: string;
    id: string;
    status: string;
    title: string;
    subject: {
        code: string;
        title: string;
    };
    credits: {
        minimum: number;
        maximum: number;
        creditType: string;
        increment?: number | null | undefined;
    };
    courseLevel: string;
    description?: string | null | undefined;
    effectiveStartDate?: string | null | undefined;
    effectiveEndDate?: string | null | undefined;
    catalogYear?: string | null | undefined;
    prerequisites?: {
        course: {
            id: string;
        };
    }[] | undefined;
    corequisites?: {
        course: {
            id: string;
        };
    }[] | undefined;
}>;
export type Course = z.infer<typeof CourseSchema>;
