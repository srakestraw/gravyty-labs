import type { Contact } from "./contact-types";

export const MOCK_CONTACTS: Contact[] = [
  {
    id: "c1",
    fullName: "Candice Wu",
    primaryEmail: "candice.wu@example.edu",
    contactTypeIds: ["applicant"],
    lastActivityAt: "2025-01-02T15:30:00Z",
  },
  {
    id: "c2",
    fullName: "Jacob Martinez",
    primaryEmail: "jacob.martinez@example.edu",
    contactTypeIds: ["enrolled_student", "volunteer"],
    lastActivityAt: "2025-01-03T10:00:00Z",
  },
  {
    id: "c3",
    fullName: "Priya Singh",
    primaryEmail: "priya.singh@example.org",
    contactTypeIds: ["alumni", "donor"],
    lastActivityAt: "2025-01-04T18:45:00Z",
  },
];

/**
 * Find a contact by ID
 */
export function findContactById(id: string): Contact | undefined {
  return MOCK_CONTACTS.find((c) => c.id === id);
}

