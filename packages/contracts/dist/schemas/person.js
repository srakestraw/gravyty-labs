"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonSchema = exports.CredentialSchema = exports.RaceSchema = exports.EthnicitySchema = exports.AddressSchema = exports.PhoneSchema = exports.EmailAddressSchema = exports.PersonNameSchema = void 0;
const zod_1 = require("zod");
exports.PersonNameSchema = zod_1.z.object({
    given: zod_1.z.string(),
    middle: zod_1.z.string().nullable().optional(),
    family: zod_1.z.string(),
    type: zod_1.z.string(),
    preferred: zod_1.z.boolean().optional(),
});
exports.EmailAddressSchema = zod_1.z.object({
    type: zod_1.z.string(),
    address: zod_1.z.string().email(),
    preferred: zod_1.z.boolean().optional(),
});
exports.PhoneSchema = zod_1.z.object({
    type: zod_1.z.string(),
    number: zod_1.z.string(),
    extension: zod_1.z.string().nullable().optional(),
    preferred: zod_1.z.boolean().optional(),
});
exports.AddressSchema = zod_1.z.object({
    type: zod_1.z.string(),
    lines: zod_1.z.array(zod_1.z.string()),
    city: zod_1.z.string(),
    state: zod_1.z.string(),
    postalCode: zod_1.z.string(),
    country: zod_1.z.string().optional(),
});
exports.EthnicitySchema = zod_1.z.object({
    code: zod_1.z.string(),
    title: zod_1.z.string(),
});
exports.RaceSchema = zod_1.z.object({
    code: zod_1.z.string(),
    title: zod_1.z.string(),
});
exports.CredentialSchema = zod_1.z.object({
    type: zod_1.z.string(),
    value: zod_1.z.string(),
});
exports.PersonSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    names: zod_1.z.array(exports.PersonNameSchema),
    birthDate: zod_1.z.string().optional().nullable(),
    gender: zod_1.z.string().optional().nullable(),
    citizenshipStatus: zod_1.z.string().optional().nullable(),
    ethnicities: zod_1.z.array(exports.EthnicitySchema).optional(),
    races: zod_1.z.array(exports.RaceSchema).optional(),
    addresses: zod_1.z.array(exports.AddressSchema).optional(),
    emails: zod_1.z.array(exports.EmailAddressSchema).optional(),
    phones: zod_1.z.array(exports.PhoneSchema).optional(),
    credentials: zod_1.z.array(exports.CredentialSchema).optional(),
});
