export type AgentRole =
  | "Admissions"
  | "Registrar"
  | "Student Success"
  | "Career Services"
  | "Alumni Engagement"
  | "Advancement";

export type AgentTemplateKey =
  | "blank"
  | "stalled-applicant-recovery"
  | "missing-document-followup"
  | "melt-prevention"
  | "registration-blocker-resolution"
  | "at-risk-early-warning"
  | "internship-application-coach"
  | "volunteer-activation"
  | "lybunt-recovery";

export type AgentTemplate = {
  key: AgentTemplateKey;
  role: AgentRole | "All";
  name: string;
  description: string;
};

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    key: "blank",
    role: "All",
    name: "Blank Agent",
    description: "Start from scratch with no pre-filled configuration.",
  },
  {
    key: "stalled-applicant-recovery",
    role: "Admissions",
    name: "Stalled Applicant Recovery",
    description: "Identify and re-engage applicants who have stopped progressing.",
  },
  {
    key: "missing-document-followup",
    role: "Admissions",
    name: "Missing Document Follow-up",
    description: "Track and nudge applicants who are missing required documents.",
  },
  {
    key: "melt-prevention",
    role: "Admissions",
    name: "Melt Prevention",
    description: "Monitor admitted-but-not-enrolled students and reduce melt risk.",
  },
  {
    key: "registration-blocker-resolution",
    role: "Registrar",
    name: "Registration Blocker Resolution",
    description: "Detect and resolve holds and blockers that prevent registration.",
  },
  {
    key: "at-risk-early-warning",
    role: "Student Success",
    name: "At-Risk Early Warning",
    description: "Surface students showing early signs of academic or engagement risk.",
  },
  {
    key: "internship-application-coach",
    role: "Career Services",
    name: "Internship Application Coach",
    description: "Help students move from interest to completed internship applications.",
  },
  {
    key: "volunteer-activation",
    role: "Alumni Engagement",
    name: "Volunteer Activation Agent",
    description: "Identify and activate alumni likely to volunteer.",
  },
  {
    key: "lybunt-recovery",
    role: "Advancement",
    name: "LYBUNT Recovery",
    description: "Re-engage donors who gave last year but not this year.",
  },
];




