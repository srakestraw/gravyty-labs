import { Contact } from "./types";

export const MOCK_CONTACTS: Contact[] = [
  {
    id: "c_anderson_applicant",
    externalId: "APP-2026-00123",
    firstName: "Chloe",
    lastName: "Anderson",
    email: "chloe.anderson@example.edu",
    role: "applicant",
    primaryProgram: "MBA Fall 2026",
    primaryCampus: "Main Campus",
    sourceSystem: "SIS",
    channels: ["email", "sms"],
  },
  {
    id: "m_liu_student",
    externalId: "STU-102948",
    firstName: "Marcus",
    lastName: "Liu",
    email: "marcus.liu@example.edu",
    role: "student",
    primaryProgram: "Computer Science BS",
    primaryCampus: "North Campus",
    sourceSystem: "SIS",
    channels: ["email", "push"],
  },
  {
    id: "a_ramirez_donor",
    externalId: "ALUM-8402",
    firstName: "Ana",
    lastName: "Ramirez",
    email: "ana.ramirez@example.edu",
    role: "donor",
    primaryProgram: "Class of 2010",
    primaryCampus: "Main Campus",
    sourceSystem: "Advancement",
    channels: ["email", "phone"],
  },
  {
    id: "d_martin_alumni",
    externalId: "ALUM-9320",
    firstName: "Derrick",
    lastName: "Martin",
    email: "derrick.martin@example.edu",
    role: "alumni",
    primaryProgram: "BA History",
    primaryCampus: "Online",
    sourceSystem: "Alumni",
    channels: ["email"],
  },
  {
    id: "s_cohen_staff",
    externalId: "STAFF-2201",
    firstName: "Sara",
    lastName: "Cohen",
    email: "sara.cohen@example.edu",
    role: "staff",
    primaryProgram: "Financial Aid Office",
    primaryCampus: "Main Campus",
    sourceSystem: "CRM",
    channels: ["email"],
  },
];

/**
 * Find a contact by ID
 */
export function findContactById(id: string): Contact | undefined {
  return MOCK_CONTACTS.find(c => c.id === id);
}




