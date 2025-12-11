import { z } from 'zod';
export declare const AcademicPeriodSchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
    title: z.ZodString;
    type: z.ZodString;
    startOn: z.ZodString;
    endOn: z.ZodString;
    censusOn: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    registrationStartOn: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    registrationEndOn: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    academicYear: z.ZodString;
    status: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    code: string;
    type: string;
    status: string;
    title: string;
    startOn: string;
    endOn: string;
    academicYear: string;
    censusOn?: string | null | undefined;
    registrationStartOn?: string | null | undefined;
    registrationEndOn?: string | null | undefined;
}, {
    id: string;
    code: string;
    type: string;
    status: string;
    title: string;
    startOn: string;
    endOn: string;
    academicYear: string;
    censusOn?: string | null | undefined;
    registrationStartOn?: string | null | undefined;
    registrationEndOn?: string | null | undefined;
}>;
export type AcademicPeriod = z.infer<typeof AcademicPeriodSchema>;
