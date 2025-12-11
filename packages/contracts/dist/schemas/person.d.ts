import { z } from 'zod';
export declare const PersonNameSchema: z.ZodObject<{
    given: z.ZodString;
    middle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    family: z.ZodString;
    type: z.ZodString;
    preferred: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: string;
    given: string;
    family: string;
    middle?: string | null | undefined;
    preferred?: boolean | undefined;
}, {
    type: string;
    given: string;
    family: string;
    middle?: string | null | undefined;
    preferred?: boolean | undefined;
}>;
export declare const EmailAddressSchema: z.ZodObject<{
    type: z.ZodString;
    address: z.ZodString;
    preferred: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: string;
    address: string;
    preferred?: boolean | undefined;
}, {
    type: string;
    address: string;
    preferred?: boolean | undefined;
}>;
export declare const PhoneSchema: z.ZodObject<{
    type: z.ZodString;
    number: z.ZodString;
    extension: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    preferred: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    number: string;
    type: string;
    preferred?: boolean | undefined;
    extension?: string | null | undefined;
}, {
    number: string;
    type: string;
    preferred?: boolean | undefined;
    extension?: string | null | undefined;
}>;
export declare const AddressSchema: z.ZodObject<{
    type: z.ZodString;
    lines: z.ZodArray<z.ZodString, "many">;
    city: z.ZodString;
    state: z.ZodString;
    postalCode: z.ZodString;
    country: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: string;
    lines: string[];
    city: string;
    state: string;
    postalCode: string;
    country?: string | undefined;
}, {
    type: string;
    lines: string[];
    city: string;
    state: string;
    postalCode: string;
    country?: string | undefined;
}>;
export declare const EthnicitySchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    title: string;
}, {
    code: string;
    title: string;
}>;
export declare const RaceSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    title: string;
}, {
    code: string;
    title: string;
}>;
export declare const CredentialSchema: z.ZodObject<{
    type: z.ZodString;
    value: z.ZodString;
}, "strip", z.ZodTypeAny, {
    value: string;
    type: string;
}, {
    value: string;
    type: string;
}>;
export declare const PersonSchema: z.ZodObject<{
    id: z.ZodString;
    names: z.ZodArray<z.ZodObject<{
        given: z.ZodString;
        middle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        family: z.ZodString;
        type: z.ZodString;
        preferred: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        given: string;
        family: string;
        middle?: string | null | undefined;
        preferred?: boolean | undefined;
    }, {
        type: string;
        given: string;
        family: string;
        middle?: string | null | undefined;
        preferred?: boolean | undefined;
    }>, "many">;
    birthDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    gender: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    citizenshipStatus: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    ethnicities: z.ZodOptional<z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        title: string;
    }, {
        code: string;
        title: string;
    }>, "many">>;
    races: z.ZodOptional<z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        title: string;
    }, {
        code: string;
        title: string;
    }>, "many">>;
    addresses: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        lines: z.ZodArray<z.ZodString, "many">;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        lines: string[];
        city: string;
        state: string;
        postalCode: string;
        country?: string | undefined;
    }, {
        type: string;
        lines: string[];
        city: string;
        state: string;
        postalCode: string;
        country?: string | undefined;
    }>, "many">>;
    emails: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        address: z.ZodString;
        preferred: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        address: string;
        preferred?: boolean | undefined;
    }, {
        type: string;
        address: string;
        preferred?: boolean | undefined;
    }>, "many">>;
    phones: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        number: z.ZodString;
        extension: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        preferred: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        number: string;
        type: string;
        preferred?: boolean | undefined;
        extension?: string | null | undefined;
    }, {
        number: string;
        type: string;
        preferred?: boolean | undefined;
        extension?: string | null | undefined;
    }>, "many">>;
    credentials: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        type: string;
    }, {
        value: string;
        type: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    names: {
        type: string;
        given: string;
        family: string;
        middle?: string | null | undefined;
        preferred?: boolean | undefined;
    }[];
    birthDate?: string | null | undefined;
    gender?: string | null | undefined;
    citizenshipStatus?: string | null | undefined;
    ethnicities?: {
        code: string;
        title: string;
    }[] | undefined;
    races?: {
        code: string;
        title: string;
    }[] | undefined;
    addresses?: {
        type: string;
        lines: string[];
        city: string;
        state: string;
        postalCode: string;
        country?: string | undefined;
    }[] | undefined;
    emails?: {
        type: string;
        address: string;
        preferred?: boolean | undefined;
    }[] | undefined;
    phones?: {
        number: string;
        type: string;
        preferred?: boolean | undefined;
        extension?: string | null | undefined;
    }[] | undefined;
    credentials?: {
        value: string;
        type: string;
    }[] | undefined;
}, {
    id: string;
    names: {
        type: string;
        given: string;
        family: string;
        middle?: string | null | undefined;
        preferred?: boolean | undefined;
    }[];
    birthDate?: string | null | undefined;
    gender?: string | null | undefined;
    citizenshipStatus?: string | null | undefined;
    ethnicities?: {
        code: string;
        title: string;
    }[] | undefined;
    races?: {
        code: string;
        title: string;
    }[] | undefined;
    addresses?: {
        type: string;
        lines: string[];
        city: string;
        state: string;
        postalCode: string;
        country?: string | undefined;
    }[] | undefined;
    emails?: {
        type: string;
        address: string;
        preferred?: boolean | undefined;
    }[] | undefined;
    phones?: {
        number: string;
        type: string;
        preferred?: boolean | undefined;
        extension?: string | null | undefined;
    }[] | undefined;
    credentials?: {
        value: string;
        type: string;
    }[] | undefined;
}>;
export type Person = z.infer<typeof PersonSchema>;
export type PersonName = z.infer<typeof PersonNameSchema>;
export type EmailAddress = z.infer<typeof EmailAddressSchema>;
export type Phone = z.infer<typeof PhoneSchema>;
export type Address = z.infer<typeof AddressSchema>;
