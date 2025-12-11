import { z } from 'zod';
export declare const StudentReferenceSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const SectionRegistrationReferenceSchema: z.ZodObject<{
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
export declare const CourseReferenceSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const GradeSchemeSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    title: string;
}, {
    code: string;
    title: string;
}>;
export declare const GradeSchema: z.ZodObject<{
    scheme: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        title: string;
    }, {
        code: string;
        title: string;
    }>>>;
    value: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    value?: string | null | undefined;
    title?: string | null | undefined;
    scheme?: {
        code: string;
        title: string;
    } | null | undefined;
}, {
    value?: string | null | undefined;
    title?: string | null | undefined;
    scheme?: {
        code: string;
        title: string;
    } | null | undefined;
}>;
export declare const StudentTranscriptGradeSchema: z.ZodObject<{
    id: z.ZodString;
    student: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    sectionRegistration: z.ZodObject<{
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
    course: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    grade: z.ZodObject<{
        scheme: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            title: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            code: string;
            title: string;
        }, {
            code: string;
            title: string;
        }>>>;
        value: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        value?: string | null | undefined;
        title?: string | null | undefined;
        scheme?: {
            code: string;
            title: string;
        } | null | undefined;
    }, {
        value?: string | null | undefined;
        title?: string | null | undefined;
        scheme?: {
            code: string;
            title: string;
        } | null | undefined;
    }>;
    gradePoints: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    qualityPoints: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    creditsAttempted: z.ZodNumber;
    creditsEarned: z.ZodNumber;
    finalGradeDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodString;
    incomplete: z.ZodBoolean;
    repeat: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: string;
    course: {
        id: string;
    };
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
    sectionRegistration: {
        id: string;
    };
    grade: {
        value?: string | null | undefined;
        title?: string | null | undefined;
        scheme?: {
            code: string;
            title: string;
        } | null | undefined;
    };
    creditsAttempted: number;
    creditsEarned: number;
    incomplete: boolean;
    repeat: boolean;
    gradePoints?: number | null | undefined;
    qualityPoints?: number | null | undefined;
    finalGradeDate?: string | null | undefined;
}, {
    id: string;
    status: string;
    course: {
        id: string;
    };
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
    sectionRegistration: {
        id: string;
    };
    grade: {
        value?: string | null | undefined;
        title?: string | null | undefined;
        scheme?: {
            code: string;
            title: string;
        } | null | undefined;
    };
    creditsAttempted: number;
    creditsEarned: number;
    incomplete: boolean;
    repeat: boolean;
    gradePoints?: number | null | undefined;
    qualityPoints?: number | null | undefined;
    finalGradeDate?: string | null | undefined;
}>;
export type StudentTranscriptGrade = z.infer<typeof StudentTranscriptGradeSchema>;
