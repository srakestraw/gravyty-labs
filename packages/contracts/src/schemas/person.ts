import { z } from 'zod';

export const PersonNameSchema = z.object({
  given: z.string(),
  middle: z.string().nullable().optional(),
  family: z.string(),
  type: z.string(),
  preferred: z.boolean().optional(),
});

export const EmailAddressSchema = z.object({
  type: z.string(),
  address: z.string().email(),
  preferred: z.boolean().optional(),
});

export const PhoneSchema = z.object({
  type: z.string(),
  number: z.string(),
  extension: z.string().nullable().optional(),
  preferred: z.boolean().optional(),
});

export const AddressSchema = z.object({
  type: z.string(),
  lines: z.array(z.string()),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string().optional(),
});

export const EthnicitySchema = z.object({
  code: z.string(),
  title: z.string(),
});

export const RaceSchema = z.object({
  code: z.string(),
  title: z.string(),
});

export const CredentialSchema = z.object({
  type: z.string(),
  value: z.string(),
});

export const PersonSchema = z.object({
  id: z.string().uuid(),
  names: z.array(PersonNameSchema),
  birthDate: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  citizenshipStatus: z.string().optional().nullable(),
  ethnicities: z.array(EthnicitySchema).optional(),
  races: z.array(RaceSchema).optional(),
  addresses: z.array(AddressSchema).optional(),
  emails: z.array(EmailAddressSchema).optional(),
  phones: z.array(PhoneSchema).optional(),
  credentials: z.array(CredentialSchema).optional(),
});

export type Person = z.infer<typeof PersonSchema>;
export type PersonName = z.infer<typeof PersonNameSchema>;
export type EmailAddress = z.infer<typeof EmailAddressSchema>;
export type Phone = z.infer<typeof PhoneSchema>;
export type Address = z.infer<typeof AddressSchema>;






