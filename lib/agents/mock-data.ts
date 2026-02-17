/**
 * Mock data for Agents UX.
 * TODO: Replace with dataClient or API calls when backend is wired.
 */

import type {
  AgentType,
  NarrativeMessagingConfig,
  FlowBuilderDefinition,
  RoleKey,
  AgentRole,
  AgentStatus,
  AgentPriorityWeight,
} from "./types";

export interface MockAgent {
  id: string;
  name: string;
  purpose: string;
  role: AgentRole;
  roleKey: RoleKey;
  type: AgentType;
  status?: AgentStatus;
  lastRun: string | null;
  nextRun?: string | null;
  priorityWeight?: AgentPriorityWeight;
  narrativeConfig?: NarrativeMessagingConfig;
  flowDefinition?: FlowBuilderDefinition;
}

/** Mock narrative profile library (2-3 profiles for dropdown) */
export interface NarrativeProfile {
  id: string;
  name: string;
  description: string;
}

export const MOCK_NARRATIVE_PROFILES: NarrativeProfile[] = [
  {
    id: "profile-admissions-reminder",
    name: "Admissions Reminder",
    description: "Warm, deadline-aware tone for application and document reminders.",
  },
  {
    id: "profile-registrar-compliance",
    name: "Registrar Compliance",
    description: "Professional, clear tone for holds and registration requirements.",
  },
  {
    id: "profile-student-success-support",
    name: "Student Success Support",
    description: "Supportive, encouraging tone for at-risk and engagement outreach.",
  },
];

/** Default narrative config for new Autonomous agents */
export const DEFAULT_NARRATIVE_CONFIG: NarrativeMessagingConfig = {
  profileId: "",
  tone: "Professional",
  allowedTopics: [],
  blockedTopics: [],
  escalationMessage: "",
  personalizationBoundaries: [],
};

/** Tone options for Narrative Messaging */
export const NARRATIVE_TONE_OPTIONS = [
  "Professional",
  "Warm",
  "Supportive",
  "Urgent",
  "Informational",
] as const;

/** Topic options for allowed/blocked */
export const NARRATIVE_TOPIC_OPTIONS = [
  "Deadlines",
  "Documents",
  "Holds",
  "Financial aid",
  "Enrollment",
  "Academic progress",
  "Events",
  "General inquiry",
] as const;

/** Personalization boundary options */
export const PERSONALIZATION_BOUNDARY_OPTIONS = [
  "First name",
  "Program name",
  "Deadline date",
  "Document name",
  "Institution name",
] as const;

/** Mock agents: mix of AUTONOMOUS and FLOW across Admissions and Registrar */
export const MOCK_AGENTS: MockAgent[] = [
  {
    id: "agent-transcript-helper",
    name: "Transcript Helper Agent",
    role: "Admissions",
    roleKey: "admissions",
    type: "AUTONOMOUS",
    purpose: "Clears missing transcripts and sends nudges.",
    status: "active",
    lastRun: "12 min ago",
    priorityWeight: 4,
    narrativeConfig: {
      profileId: "profile-admissions-reminder",
      tone: "Warm",
      allowedTopics: ["Deadlines", "Documents"],
      blockedTopics: ["Financial aid"],
      escalationMessage: "Please contact your admissions counselor if you need assistance.",
      personalizationBoundaries: ["First name", "Deadline date", "Document name"],
    },
  },
  {
    id: "agent-registration-requirements",
    name: "Registration Requirements Agent",
    role: "Registrar",
    roleKey: "registrar",
    type: "AUTONOMOUS",
    purpose: "Flags holds and notifies students.",
    status: "active",
    lastRun: "47 min ago",
    priorityWeight: 4,
    narrativeConfig: {
      profileId: "profile-registrar-compliance",
      tone: "Professional",
      allowedTopics: ["Holds", "Documents", "Enrollment"],
      blockedTopics: [],
      escalationMessage: "For questions about your hold, visit the Registrar office.",
      personalizationBoundaries: ["First name", "Document name", "Institution name"],
    },
  },
  {
    id: "agent-high-intent-prospect",
    name: "High-Intent Prospect Agent",
    role: "Admissions",
    roleKey: "admissions",
    type: "AUTONOMOUS",
    purpose: "Surfaces high-intent prospects for outreach.",
    status: "paused",
    lastRun: null,
    priorityWeight: 3,
    narrativeConfig: {
      profileId: "profile-admissions-reminder",
      tone: "Warm",
      allowedTopics: ["General inquiry", "Events"],
      blockedTopics: ["Financial aid"],
      escalationMessage: "",
      personalizationBoundaries: ["First name", "Program name"],
    },
  },
  {
    id: "agent-donor-warmup",
    name: "Donor Warm-Up Agent",
    role: "Advancement",
    roleKey: "advancement",
    type: "AUTONOMOUS",
    purpose: "Sends warm-up emails and scores replies.",
    status: "active",
    lastRun: "3 hours ago",
    priorityWeight: 2,
  },
  {
    id: "agent-international-visa",
    name: "International Visa Docs Agent",
    role: "Admissions",
    roleKey: "admissions",
    type: "AUTONOMOUS",
    purpose: "Identifies missing I-20 / visa documents.",
    status: "error",
    lastRun: "1 hour ago",
    priorityWeight: 5,
  },
  {
    id: "agent-flow-missing-transcript",
    name: "Missing Transcript Flow",
    role: "Admissions",
    roleKey: "admissions",
    type: "FLOW",
    purpose: "Rule-based flow for missing transcript reminders.",
    status: "active",
    lastRun: "2 hours ago",
    priorityWeight: 4,
    flowDefinition: {
      nodes: [
        { id: "n1", type: "trigger", label: "Segment: Missing Transcript" },
        { id: "n2", type: "condition", label: "Inactive > 7 days" },
        { id: "n3", type: "action", label: "Send Email Reminder" },
      ],
      edges: [
        { id: "e1", sourceId: "n1", targetId: "n2" },
        { id: "e2", sourceId: "n2", targetId: "n3" },
      ],
    },
  },
  {
    id: "agent-flow-registration-hold",
    name: "Registration Hold Flow",
    role: "Registrar",
    roleKey: "registrar",
    type: "FLOW",
    purpose: "Automated flow for registration hold notifications.",
    status: "active",
    lastRun: "30 min ago",
    priorityWeight: 4,
    flowDefinition: {
      nodes: [
        { id: "n1", type: "trigger", label: "Hold Applied" },
        { id: "n2", type: "condition", label: "Hold type = Financial" },
        { id: "n3", type: "action", label: "Create Task for Advisor" },
        { id: "n4", type: "action", label: "Send SMS Notification" },
      ],
      edges: [
        { id: "e1", sourceId: "n1", targetId: "n2" },
        { id: "e2", sourceId: "n2", targetId: "n3" },
        { id: "e3", sourceId: "n2", targetId: "n4" },
      ],
    },
  },
];

export function getMockAgentById(id: string): MockAgent | undefined {
  return MOCK_AGENTS.find((a) => a.id === id);
}
