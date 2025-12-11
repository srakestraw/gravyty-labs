import { z } from 'zod';
export declare const StudentReferenceSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const SectionReferenceSchema: z.ZodObject<{
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
export declare const RegistrationStatusSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    title: string;
}, {
    code: string;
    title: string;
}>;
export declare const GradingOptionSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    title: string;
}, {
    code: string;
    title: string;
}>;
export declare const SectionRegistrationSchema: z.ZodObject<{
    id: z.ZodString;
    student: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    section: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    academicPeriod: z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        code: string;
    }, {
        id: string;
        code: string;
    }>;
    status: z.ZodObject<{
        code: z.ZodString;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        title: string;
    }, {
        code: string;
        title: string;
    }>;
    registrationDate: z.ZodString;
    registeredOn: z.ZodString;
    creditType: z.ZodString;
    credits: z.ZodNumber;
    gradingOption: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        title: string;
    }, {
        code: string;
        title: string;
    }>>>;
    academicLoad: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    residencyStatus: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: {
        code: string;
        title: string;
    };
    creditType: string;
    credits: number;
    academicPeriod: {
        id: string;
        code: string;
    };
    student: {
        id: string;
    };
    section: {
        id: string;
    };
    registrationDate: string;
    registeredOn: string;
    gradingOption?: {
        code: string;
        title: string;
    } | null | undefined;
    academicLoad?: string | null | undefined;
    residencyStatus?: string | null | undefined;
}, {
    id: string;
    status: {
        code: string;
        title: string;
    };
    creditType: string;
    credits: number;
    academicPeriod: {
        id: string;
        code: string;
    };
    student: {
        id: string;
    };
    section: {
        id: string;
    };
    registrationDate: string;
    registeredOn: string;
    gradingOption?: {
        code: string;
        title: string;
    } | null | undefined;
    academicLoad?: string | null | undefined;
    residencyStatus?: string | null | undefined;
}>;
export type SectionRegistration = z.infer<typeof SectionRegistrationSchema>;
