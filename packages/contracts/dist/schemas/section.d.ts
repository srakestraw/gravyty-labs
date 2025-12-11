import { z } from 'zod';
export declare const CourseReferenceSchema: z.ZodObject<{
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
export declare const InstructionalMethodSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    title: string;
}, {
    code: string;
    title: string;
}>;
export declare const RoomSchema: z.ZodObject<{
    building: z.ZodString;
    number: z.ZodString;
}, "strip", z.ZodTypeAny, {
    number: string;
    building: string;
}, {
    number: string;
    building: string;
}>;
export declare const ScheduleSchema: z.ZodObject<{
    daysOfWeek: z.ZodArray<z.ZodString, "many">;
    startTime: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    endTime: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    room: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        building: z.ZodString;
        number: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        number: string;
        building: string;
    }, {
        number: string;
        building: string;
    }>>>;
}, "strip", z.ZodTypeAny, {
    daysOfWeek: string[];
    startTime?: string | null | undefined;
    endTime?: string | null | undefined;
    room?: {
        number: string;
        building: string;
    } | null | undefined;
}, {
    daysOfWeek: string[];
    startTime?: string | null | undefined;
    endTime?: string | null | undefined;
    room?: {
        number: string;
        building: string;
    } | null | undefined;
}>;
export declare const InstructorSchema: z.ZodObject<{
    person: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    role: z.ZodString;
}, "strip", z.ZodTypeAny, {
    person: {
        id: string;
    };
    role: string;
}, {
    person: {
        id: string;
    };
    role: string;
}>;
export declare const SectionCreditsSchema: z.ZodObject<{
    creditType: z.ZodString;
    minimum: z.ZodNumber;
    maximum: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    minimum: number;
    maximum: number;
    creditType: string;
}, {
    minimum: number;
    maximum: number;
    creditType: string;
}>;
export declare const SectionSchema: z.ZodObject<{
    id: z.ZodString;
    course: z.ZodObject<{
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
    number: z.ZodString;
    title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    crn: z.ZodString;
    startOn: z.ZodString;
    endOn: z.ZodString;
    status: z.ZodString;
    capacity: z.ZodNumber;
    enrolled: z.ZodNumber;
    available: z.ZodNumber;
    waitlistCapacity: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    waitlistEnrolled: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    instructionalMethod: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        title: string;
    }, {
        code: string;
        title: string;
    }>>>;
    schedule: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        daysOfWeek: z.ZodArray<z.ZodString, "many">;
        startTime: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        endTime: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        room: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            building: z.ZodString;
            number: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            number: string;
            building: string;
        }, {
            number: string;
            building: string;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        daysOfWeek: string[];
        startTime?: string | null | undefined;
        endTime?: string | null | undefined;
        room?: {
            number: string;
            building: string;
        } | null | undefined;
    }, {
        daysOfWeek: string[];
        startTime?: string | null | undefined;
        endTime?: string | null | undefined;
        room?: {
            number: string;
            building: string;
        } | null | undefined;
    }>>>;
    instructors: z.ZodOptional<z.ZodArray<z.ZodObject<{
        person: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        role: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        person: {
            id: string;
        };
        role: string;
    }, {
        person: {
            id: string;
        };
        role: string;
    }>, "many">>;
    credits: z.ZodObject<{
        creditType: z.ZodString;
        minimum: z.ZodNumber;
        maximum: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        minimum: number;
        maximum: number;
        creditType: string;
    }, {
        minimum: number;
        maximum: number;
        creditType: string;
    }>;
}, "strip", z.ZodTypeAny, {
    number: string;
    id: string;
    status: string;
    crn: string;
    startOn: string;
    endOn: string;
    course: {
        id: string;
    };
    credits: {
        minimum: number;
        maximum: number;
        creditType: string;
    };
    academicPeriod: {
        id: string;
        code: string;
    };
    capacity: number;
    enrolled: number;
    available: number;
    title?: string | null | undefined;
    waitlistCapacity?: number | null | undefined;
    waitlistEnrolled?: number | null | undefined;
    instructionalMethod?: {
        code: string;
        title: string;
    } | null | undefined;
    schedule?: {
        daysOfWeek: string[];
        startTime?: string | null | undefined;
        endTime?: string | null | undefined;
        room?: {
            number: string;
            building: string;
        } | null | undefined;
    } | null | undefined;
    instructors?: {
        person: {
            id: string;
        };
        role: string;
    }[] | undefined;
}, {
    number: string;
    id: string;
    status: string;
    crn: string;
    startOn: string;
    endOn: string;
    course: {
        id: string;
    };
    credits: {
        minimum: number;
        maximum: number;
        creditType: string;
    };
    academicPeriod: {
        id: string;
        code: string;
    };
    capacity: number;
    enrolled: number;
    available: number;
    title?: string | null | undefined;
    waitlistCapacity?: number | null | undefined;
    waitlistEnrolled?: number | null | undefined;
    instructionalMethod?: {
        code: string;
        title: string;
    } | null | undefined;
    schedule?: {
        daysOfWeek: string[];
        startTime?: string | null | undefined;
        endTime?: string | null | undefined;
        room?: {
            number: string;
            building: string;
        } | null | undefined;
    } | null | undefined;
    instructors?: {
        person: {
            id: string;
        };
        role: string;
    }[] | undefined;
}>;
export type Section = z.infer<typeof SectionSchema>;
