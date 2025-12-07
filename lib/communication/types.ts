/**
 * Communication configuration types
 * Defines Brand Voice, Personality, and Tone Rules for AI assistants
 */

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

export interface ToneRule {
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
  brand: BrandVoiceConfig;
  personality: PersonalityConfig;
  toneRules: ToneRule[];
  updatedAt?: string;
  updatedBy?: string;
}

