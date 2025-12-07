/**
 * Reusable Contact model for higher-ed people
 * Represents applicants, students, alumni, donors, staff, etc.
 */

export type ContactRole =
  | "applicant"
  | "student"
  | "alumni"
  | "donor"
  | "faculty"
  | "staff"
  | "prospect";

export type ContactSourceSystem =
  | "SIS"
  | "CRM"
  | "LMS"
  | "Advancement"
  | "Alumni"
  | "FinancialAid"
  | "Manual";

export type ContactChannel =
  | "email"
  | "sms"
  | "phone"
  | "push"
  | "in_app";

export interface Contact {
  id: string;
  externalId?: string; // e.g. SIS/CRM ID
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: ContactRole;
  primaryCampus?: string;
  primaryProgram?: string; // e.g. "MBA", "BA Psychology", etc.
  sourceSystem: ContactSourceSystem;
  channels?: ContactChannel[];
}

/**
 * Get display name for a contact
 */
export function getContactDisplayName(contact: Contact): string {
  return `${contact.firstName} ${contact.lastName}`;
}

/**
 * Get full contact label with role and program
 */
export function getContactLabel(contact: Contact): string {
  const name = getContactDisplayName(contact);
  const roleLabel = contact.role.charAt(0).toUpperCase() + contact.role.slice(1);
  if (contact.primaryProgram) {
    return `${roleLabel} — ${contact.primaryProgram}`;
  }
  return roleLabel;
}

