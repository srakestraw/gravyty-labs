/**
 * Communication configuration types
 * Defines Brand Voice, Personality, and Tone Rules for AI assistants
 */

export type VoiceProfileId = string;

export interface BrandSettings {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  typographyStyle?: 'system' | 'serif' | 'sans' | 'custom';
  signatureTemplate?: string; // optional email/footer signature
}

export interface VoiceCharacteristics {
  formality: number;   // 0-100
  warmth: number;
  directness: number;
  energy: number;
  detailLevel: number;
  riskPosture: number;
}

export interface StylePreferences {
  allowEmojis: boolean;
  allowContractions: boolean;
  useFirstPerson: boolean;
  allowLightHumor: boolean;
}

export interface VoiceProfile {
  id: VoiceProfileId;
  name: string;                 // e.g. "Institutional", "Admissions"
  description?: string;
  isDefault: boolean;
  brand: BrandSettings;
  missionValues: string[];
  communicationPillars: string[];
  characteristics: VoiceCharacteristics;
  stylePreferences: StylePreferences;
  // timestamps (optional)
  createdAt?: string;
  updatedAt?: string;
  // simple stub for future extension
  channelAdjustments?: {
    chat?: 'base' | 'more-formal' | 'more-concise';
    email?: 'base' | 'more-formal' | 'more-concise';
    sms?: 'base' | 'more-formal' | 'more-concise';
  };
}

// Legacy interface for backward compatibility during migration
export interface BrandVoiceConfig {
  missionValues: string[];           // e.g. ["student-centered", "equity-first"]
  communicationPillars: string[];    // e.g. ["clarity", "support", "transparency"]
  sliders: {
    formality: number;               // 0–100
    warmth: number;
    directness: number;
    energy: number;
    detailLevel: number;
    riskPosture: number;
  };
  style: {
    emojiAllowed: boolean;
    contractionsAllowed: boolean;
  };
}

export interface PersonalityConfig {
  archetype:
    | "mentor"
    | "peer"
    | "guide"
    | "administrator"
    | "professional"
    | "counselor";

  empathy: "low" | "medium" | "high";
  enthusiasm: "reserved" | "balanced" | "cheerful";
  humorAllowed: boolean;
  figurativeLanguage: boolean; // metaphors, analogies
}

// Assignment Rules (replaces ToneRule)
export type AssignmentScope = 'user' | 'group' | 'agent' | 'app';
export type AssignmentChannelScope = 'all' | 'chat' | 'email' | 'sms';

export interface AssignmentRule {
  id: string;
  profileId: VoiceProfileId;
  scope: AssignmentScope;
  targetId: string;        // internal id for user/group/agent/app
  targetLabel: string;     // display name for UI
  channelScope: AssignmentChannelScope;
  order: number;           // integer for top→bottom priority
}

// Legacy types for backward compatibility
export type ToneRuleScope = 'app' | 'group' | 'user';
export type ToneRuleChannelScope = 'all' | 'chat' | 'email' | 'sms';

// Legacy ToneRule interface - maps to AssignmentRule for migration
export interface ToneRule {
  id: string;
  scope: ToneRuleScope;
  targetId: string;
  targetLabel: string;
  profileId: VoiceProfileId;
  channelScope: ToneRuleChannelScope;
  order: number;
}

// Legacy ToneRule interface for backward compatibility (scenario-based rules)
export interface LegacyToneRule {
  id: string;
  label: string;              // "Bad news", "Escalation", "Deadline approaching"
  trigger: string[];          // intents, guardrail IDs, keywords, etc.
  rules: {
    openingStrategy:
      | "empathetic"
      | "direct"
      | "supportive"
      | "encouraging";

    requiredPhrases?: string[];
    forbiddenPhrases?: string[];

    maxSentenceCount?: number;
    CTAAllowed?: boolean;
    emojiAllowedOverride?: boolean;
  };
  enabled?: boolean;
}

export interface CommunicationConfig {
  // New structure: multiple voice profiles
  voiceProfiles: VoiceProfile[];
  // Legacy: single brand voice (for backward compatibility during migration)
  brand?: BrandVoiceConfig;
  personality: PersonalityConfig;
  // Assignment Rules (new name, replaces toneRules)
  assignmentRules: AssignmentRule[];
  // Legacy: toneRules kept for backward compatibility during migration
  toneRules?: ToneRule[];
  // Legacy: scenario-based tone rules (kept for backward compatibility)
  legacyToneRules?: LegacyToneRule[];
  updatedAt?: string;
  updatedBy?: string;
}

