import { Contact } from "@/lib/contacts/types";

export type DoNotEngageScopeType =
  | "global"
  | "role"     // Admissions, Registrar, etc.
  | "agent";   // specific agent id

export type DoNotEngageRoleScope =
  | "admissions"
  | "registrar"
  | "student_success"
  | "career_services"
  | "alumni_engagement"
  | "advancement";

export type DoNotEngageReason =
  | "user_opt_out"
  | "admin_block"
  | "compliance"
  | "high_risk"
  | "unknown";

export interface DoNotEngageEntry {
  id: string;
  contactId: string;
  contactName: string;
  contactRole: string; // string for display (e.g. "Applicant", "Donor")
  contactSource: string; // SIS, CRM, Advancement, Manual
  scopeType: DoNotEngageScopeType;
  roleScope?: DoNotEngageRoleScope;
  agentName?: string;
  agentId?: string; // optional agent identifier
  channels: ("email" | "sms" | "phone" | "push" | "in_app")[];
  reason: DoNotEngageReason;
  reasonDetail?: string;
  addedBy: string;
  addedAt: string; // ISO string
}

export const MOCK_DO_NOT_ENGAGE: DoNotEngageEntry[] = [
  {
    id: "dne_1",
    contactId: "c_anderson_applicant",
    contactName: "Chloe Anderson",
    contactRole: "Applicant — MBA Fall 2026",
    contactSource: "SIS",
    scopeType: "role",
    roleScope: "admissions",
    channels: ["email", "sms"],
    reason: "user_opt_out",
    reasonDetail: "Unsubscribed from all recruitment email and SMS.",
    addedBy: "Admissions Ops (demo)",
    addedAt: "2025-10-01T14:32:00Z",
  },
  {
    id: "dne_2",
    contactId: "m_liu_student",
    contactName: "Marcus Liu",
    contactRole: "Student — CS BS",
    contactSource: "SIS",
    scopeType: "global",
    channels: ["email", "sms", "push"],
    reason: "high_risk",
    reasonDetail:
      "Flagged for mental-health related outreach only; all automated nudges disabled.",
    addedBy: "Dean of Students (demo)",
    addedAt: "2025-11-09T09:15:00Z",
  },
  {
    id: "dne_3",
    contactId: "a_ramirez_donor",
    contactName: "Ana Ramirez",
    contactRole: "Alumni donor",
    contactSource: "Advancement",
    scopeType: "role",
    roleScope: "advancement",
    channels: ["phone"],
    reason: "user_opt_out",
    reasonDetail: "Requested no phone calls; email still allowed.",
    addedBy: "Advancement Services (demo)",
    addedAt: "2025-08-21T18:45:00Z",
  },
  {
    id: "dne_4",
    contactId: "d_martin_alumni",
    contactName: "Derrick Martin",
    contactRole: "Alumni",
    contactSource: "Alumni",
    scopeType: "agent",
    agentName: "LYBUNT Recovery Agent",
    agentId: "agent-lybunt-recovery",
    channels: ["email"],
    reason: "admin_block",
    reasonDetail:
      "Temporarily excluded from LYBUNT recovery campaign during active dispute.",
    addedBy: "Annual Giving (demo)",
    addedAt: "2025-09-10T12:00:00Z",
  },
  {
    id: "dne_5",
    contactId: "s_cohen_staff",
    contactName: "Sara Cohen",
    contactRole: "Staff — Financial Aid",
    contactSource: "CRM",
    scopeType: "global",
    channels: ["email"],
    reason: "compliance",
    reasonDetail:
      "Internal staff profile; should never receive student-facing campaigns.",
    addedBy: "CRM Admin (demo)",
    addedAt: "2025-07-03T16:20:00Z",
  },
];

