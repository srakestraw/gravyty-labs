import { ContactType } from "./contact-types";

export const CONTACT_TYPES: ContactType[] = [
  {
    id: "applicant",
    label: "Applicant",
    description: "Person who has started or submitted an application.",
    domain: "higher_ed",
    workspaces: ["student_lifecycle_ai", "ai_assistants", "career_services"],
  },
  {
    id: "enrolled_student",
    label: "Enrolled Student",
    description: "Currently enrolled student.",
    domain: "higher_ed",
    workspaces: ["student_lifecycle_ai", "ai_assistants", "career_services"],
  },
  {
    id: "alumni",
    label: "Alumni",
    description: "Former student who completed a program or degree.",
    domain: "higher_ed",
    workspaces: ["engagement_hub", "advancement", "career_services", "ai_assistants"],
  },
  {
    id: "donor",
    label: "Donor",
    description: "Contact who has made at least one gift.",
    domain: "nonprofit",
    workspaces: ["advancement", "engagement_hub", "ai_assistants"],
  },
  {
    id: "lapsed_donor",
    label: "Lapsed Donor",
    description: "Previously gave, but not in the current period.",
    domain: "nonprofit",
    workspaces: ["advancement"],
    isDerived: true,
  },
  {
    id: "parent_guardian",
    label: "Parent or Guardian",
    description: "Parent, guardian, or family contact associated with a student.",
    domain: "higher_ed",
    workspaces: ["student_lifecycle_ai", "engagement_hub", "advancement"],
  },
  {
    id: "volunteer",
    label: "Volunteer",
    description: "Contact who volunteers time or service.",
    domain: "nonprofit",
    workspaces: ["engagement_hub", "advancement"],
  },
  {
    id: "prospective_student",
    label: "Prospective Student",
    description: "Person who has expressed interest but hasn't applied yet.",
    domain: "higher_ed",
    workspaces: ["student_lifecycle_ai", "ai_assistants"],
  },
  {
    id: "admitted_student",
    label: "Admitted Student",
    description: "Student who has been admitted but not yet enrolled.",
    domain: "higher_ed",
    workspaces: ["student_lifecycle_ai", "ai_assistants"],
  },
  {
    id: "at_risk_student",
    label: "At-Risk Student",
    description: "Student who may need additional support or intervention.",
    domain: "higher_ed",
    workspaces: ["student_lifecycle_ai", "ai_assistants"],
    isDerived: true,
  },
  {
    id: "staff_faculty",
    label: "Staff or Faculty",
    description: "Institution staff member or faculty.",
    domain: "shared",
    workspaces: ["ai_assistants", "engagement_hub"],
  },
  {
    id: "prospect",
    label: "Prospect",
    description: "Potential donor or supporter who hasn't given yet.",
    domain: "nonprofit",
    workspaces: ["advancement", "engagement_hub"],
  },
  {
    id: "recurring_donor",
    label: "Recurring Donor",
    description: "Donor with active recurring gifts.",
    domain: "nonprofit",
    workspaces: ["advancement"],
    isDerived: true,
  },
  {
    id: "major_donor",
    label: "Major Donor",
    description: "Donor who has made significant contributions.",
    domain: "nonprofit",
    workspaces: ["advancement"],
    isDerived: true,
  },
  {
    id: "member_supporter",
    label: "Member or Supporter",
    description: "General member or supporter of the organization.",
    domain: "nonprofit",
    workspaces: ["engagement_hub", "advancement"],
  },
  {
    id: "board_member",
    label: "Board Member",
    description: "Member of the board of directors or trustees.",
    domain: "shared",
    workspaces: ["advancement", "engagement_hub"],
  },
  {
    id: "employer",
    label: "Employer",
    description: "Organization that employs or recruits from the institution.",
    domain: "shared",
    workspaces: ["career_services", "ai_assistants"],
  },
  {
    id: "career_coach",
    label: "Career Coach",
    description: "Professional providing career guidance or mentorship.",
    domain: "shared",
    workspaces: ["career_services", "ai_assistants"],
  },
];





