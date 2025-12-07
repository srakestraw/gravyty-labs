export type GuardrailRole =
  | "Admissions"
  | "Registrar"
  | "Student Success"
  | "Career Services"
  | "Alumni Engagement"
  | "Advancement";

export type ProtectedAttribute =
  | "race_ethnicity"
  | "gender_identity"
  | "sexual_orientation"
  | "religion"
  | "national_origin"
  | "disability_status"
  | "age"
  | "veteran_status"
  | "first_gen"
  | "low_income";

export type FairnessGuardrails = {
  protectedAttributes: ProtectedAttribute[];
  allowProtectedUseForSupportPrograms: boolean; // e.g., first-gen support
  requireFairnessEvalForAutoAgents: boolean;
  bannedPhrases: string[];
};

export type DataScopeDomain =
  | "admissions"
  | "student_success"
  | "registrar"
  | "career_services"
  | "alumni_engagement"
  | "advancement";

export type DataScopeGuardrails = {
  allowedDomains: DataScopeDomain[];
  excludeConfidentialNotes: boolean;
  disallowMentalHealthData: boolean;
  disallowConductRecords: boolean;
  channelContentRules: {
    email: "summary_ok" | "detailed_ok" | "limited";
    sms: "reminders_only" | "limited";
    phone: "summary_ok" | "detailed_ok";
  };
};

export type QuietHoursConfig = {
  enabled: boolean;
  startTime: string; // "21:00"
  endTime: string;   // "08:00"
  timezoneMode: "recipient" | "institution";
};

export type QuietPeriod = {
  id: string;
  name: string;
  startDate: string; // "2025-12-20"
  endDate: string;   // "2026-01-05"
  appliesToRoles: GuardrailRole[] | "all";
  description?: string;
};

export type SensitiveDate = {
  id: string;
  name: string;
  date: string; // "2025-12-25"
  appliesTo: "all" | "advancement" | "student_success" | "admissions";
  blockSolicitations: boolean;
  allowSupportOnly: boolean;
};

export type ContactPolicyGuardrails = {
  quietHours: QuietHoursConfig;
  quietPeriods: QuietPeriod[];
  sensitiveDates: SensitiveDate[];
  globalFrequencyCaps: {
    maxMessagesPerDay: number;
    maxMessagesPerWeek: number;
  };
  perAgentFrequencyCapsDefault: {
    maxMessagesPer14Days: number;
    escalationAfterUnansweredCount: number;
  };
};

export type ActionMode = "blocked" | "human_review" | "auto";

export type ActionKey =
  | "send_email"
  | "send_sms"
  | "send_phone_call"
  | "create_task"
  | "create_internal_flag"
  | "change_status"
  | "change_owner";

export type ActionGuardrails = {
  defaults: Record<ActionKey, ActionMode>;
  perRoleOverrides: Partial<Record<GuardrailRole, Partial<Record<ActionKey, ActionMode>>>>;
};

export type LoggingGuardrails = {
  requireActionLogging: boolean;
  requireDneCheckLogging: boolean;
  requireGuardrailCheckLogging: boolean;
  requireEvalStatusBeforeAuto: boolean;
};

export type GlobalGuardrailsConfig = {
  fairness: FairnessGuardrails;
  dataScope: DataScopeGuardrails;
  contactPolicy: ContactPolicyGuardrails;
  actions: ActionGuardrails;
  logging: LoggingGuardrails;
};

export const DEFAULT_GUARDRAILS: GlobalGuardrailsConfig = {
  fairness: {
    protectedAttributes: [
      "race_ethnicity",
      "gender_identity",
      "sexual_orientation",
      "religion",
      "national_origin",
      "disability_status",
      "age",
      "veteran_status",
      "first_gen",
      "low_income"
    ],
    allowProtectedUseForSupportPrograms: true,
    requireFairnessEvalForAutoAgents: true,
    bannedPhrases: [
      "low-quality student",
      "bad donor",
      "hopeless case"
    ]
  },
  dataScope: {
    allowedDomains: [
      "admissions",
      "student_success",
      "registrar",
      "career_services",
      "alumni_engagement",
      "advancement"
    ],
    excludeConfidentialNotes: true,
    disallowMentalHealthData: true,
    disallowConductRecords: true,
    channelContentRules: {
      email: "summary_ok",
      sms: "reminders_only",
      phone: "summary_ok"
    }
  },
  contactPolicy: {
    quietHours: {
      enabled: true,
      startTime: "21:00",
      endTime: "08:00",
      timezoneMode: "recipient"
    },
    quietPeriods: [],
    sensitiveDates: [],
    globalFrequencyCaps: {
      maxMessagesPerDay: 3,
      maxMessagesPerWeek: 10
    },
    perAgentFrequencyCapsDefault: {
      maxMessagesPer14Days: 2,
      escalationAfterUnansweredCount: 3
    }
  },
  actions: {
    defaults: {
      send_email: "human_review",
      send_sms: "human_review",
      send_phone_call: "blocked",
      create_task: "auto",
      create_internal_flag: "auto",
      change_status: "human_review",
      change_owner: "human_review"
    },
    perRoleOverrides: {}
  },
  logging: {
    requireActionLogging: true,
    requireDneCheckLogging: true,
    requireGuardrailCheckLogging: true,
    requireEvalStatusBeforeAuto: true
  }
};

