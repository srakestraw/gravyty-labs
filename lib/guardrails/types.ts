/**
 * Guardrails configuration types
 * Matches the structure required for the editable guardrails UI
 */

export type RoleKey =
  | "admissions"
  | "registrar"
  | "student_success"
  | "career_services"
  | "alumni_engagement"
  | "advancement";

export interface FairnessDEIConfig {
  protectedAttributes: string[];      // e.g. ["race", "ethnicity", "gender", ...]
  allowAttributeOverrides: boolean;   // if true, some agents can opt-in to use attributes explicitly
  languageGuidelines: {
    avoidFraming: string[];          // list of discouraged phrases
    preferredFraming: string[];      // list of preferred framing hints
  };
  fairnessEvalsEnabled: boolean;
}

export interface PrivacyDataConfig {
  allowedDomains: RoleKey[];         // which domains agents may read from
  sensitiveDomainsExcluded: string[];// e.g. ["counseling_notes", "disability_services"]
  emailPolicy: string;               // short description or enum
  smsPolicy: string;
  phonePolicy: string;
}

export interface QuietHours {
  enabled: boolean;
  startLocal: string;                // "21:00"
  endLocal: string;                  // "08:00"
  timezone?: string;
}

export interface SeasonalQuietPeriod {
  id: string;
  label: string;
  startDate: string;                 // ISO yyyy-mm-dd
  endDate: string;                   // ISO yyyy-mm-dd
}

export interface HolidayRule {
  id: string;
  label: string;
  date: string;                      // ISO yyyy-mm-dd
  scope: "global" | RoleKey;
}

export interface FrequencyCapsConfig {
  globalMaxMessagesPerWeek: number;
  globalMaxMessagesPerDay: number;
  perAgentDefaultMaxIn14Days: number;
  maxUnansweredAttemptsBeforeEscalation: number;
}

export type ActionMode = "auto" | "human_review" | "blocked";

export interface ActionAutonomyRule {
  actionKey: string;                 // e.g. "send_email", "send_sms", "create_task"
  mode: ActionMode;
}

export interface EngagementConfig {
  quietHours: QuietHours;
  seasonalQuietPeriods: SeasonalQuietPeriod[];
  holidayRules: HolidayRule[];
  frequencyCaps: FrequencyCapsConfig;
}

export interface ActionsConfig {
  rules: ActionAutonomyRule[];
  loggingRequired: boolean;
  requireEvalBeforeAuto: boolean;
}

export interface GuardrailsConfig {
  fairness: FairnessDEIConfig;
  privacy: PrivacyDataConfig;
  engagement: EngagementConfig;
  actions: ActionsConfig;
  updatedAt: string;
  updatedBy?: string;
}

