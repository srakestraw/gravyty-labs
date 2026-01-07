export type ContactId = string;

export type ContactTypeId =
  | "prospective_student"
  | "applicant"
  | "admitted_student"
  | "enrolled_student"
  | "at_risk_student"
  | "alumni"
  | "parent_guardian"
  | "staff_faculty"
  | "prospect"
  | "donor"
  | "lapsed_donor"
  | "recurring_donor"
  | "major_donor"
  | "volunteer"
  | "member_supporter"
  | "board_member"
  | "employer"
  | "career_coach";

export type ContactDomain = "higher_ed" | "nonprofit" | "shared";

export type WorkspaceContext =
  | "student_lifecycle_ai"
  | "ai_assistants"
  | "engagement_hub"
  | "advancement"
  | "career_services";

export interface ContactType {
  id: ContactTypeId;
  label: string;
  description: string;
  domain: ContactDomain;
  workspaces: WorkspaceContext[];
  isDerived?: boolean;
}

export interface Contact {
  id: ContactId;
  fullName: string;
  primaryEmail?: string;
  primaryPhone?: string;
  institutionId?: string;
  homeLocation?: string;
  contactTypeIds: ContactTypeId[];
  lastActivityAt?: string;
  createdAt?: string;
}

export interface PersonContactTypes {
  personId: ContactId;
  contactTypeIds: ContactTypeId[];
}









