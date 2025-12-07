/**
 * Communication config store and persistence helpers
 * 
 * TODO: Replace with real persistence (Prisma/DB, JSON file, KV, etc.)
 * Currently uses in-memory storage for MVP
 */

import { CommunicationConfig, BrandVoiceConfig, PersonalityConfig, ToneRule } from './types';

// In-memory storage (replace with real persistence)
let cachedConfig: CommunicationConfig | null = null;

const DEFAULT_BRAND_VOICE: BrandVoiceConfig = {
  missionValues: ["student-centered", "equity-first"],
  communicationPillars: ["clarity", "support", "transparency"],
  sliders: {
    formality: 60,
    warmth: 70,
    directness: 65,
    energy: 60,
    detailLevel: 70,
    riskPosture: 50,
  },
  style: {
    emojiAllowed: true,
    contractionsAllowed: true,
  },
};

const DEFAULT_PERSONALITY: PersonalityConfig = {
  archetype: "guide",
  empathy: "high",
  enthusiasm: "balanced",
  humorAllowed: false,
  figurativeLanguage: true,
};

const DEFAULT_TONE_RULES: ToneRule[] = [
  {
    id: "bad_news",
    label: "Bad news",
    trigger: ["rejection", "denial", "failure"],
    enabled: true,
    rules: {
      openingStrategy: "empathetic",
      requiredPhrases: ["I understand", "I'm here to help"],
      maxSentenceCount: 5,
      CTAAllowed: true,
      emojiAllowedOverride: false,
    },
  },
  {
    id: "escalation",
    label: "Escalation",
    trigger: ["escalate", "urgent", "critical"],
    enabled: true,
    rules: {
      openingStrategy: "direct",
      maxSentenceCount: 3,
      CTAAllowed: true,
    },
  },
  {
    id: "deadline",
    label: "Deadline approaching",
    trigger: ["deadline", "due date", "overdue"],
    enabled: true,
    rules: {
      openingStrategy: "encouraging",
      requiredPhrases: ["You still have time"],
      CTAAllowed: true,
    },
  },
];

const DEFAULT_CONFIG: CommunicationConfig = {
  brand: DEFAULT_BRAND_VOICE,
  personality: DEFAULT_PERSONALITY,
  toneRules: DEFAULT_TONE_RULES,
  updatedAt: new Date().toISOString(),
};

/**
 * Load communication config
 * TODO: Replace with real API call or DB query
 */
export async function loadCommunicationConfig(): Promise<CommunicationConfig> {
  // For now, return cached config or defaults
  if (cachedConfig) {
    return cachedConfig;
  }
  
  // Return defaults
  cachedConfig = { ...DEFAULT_CONFIG };
  return cachedConfig;
}

/**
 * Save communication config
 * TODO: Replace with real API call or DB save
 */
export async function saveCommunicationConfig(
  config: CommunicationConfig,
  updatedBy?: string
): Promise<CommunicationConfig> {
  // Validate config
  const validationErrors = validateCommunicationConfig(config);
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
  }

  // Update metadata
  const updatedConfig: CommunicationConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  // TODO: Save to database/API
  cachedConfig = updatedConfig;
  
  return updatedConfig;
}

/**
 * Validate communication config
 */
export function validateCommunicationConfig(config: CommunicationConfig): string[] {
  const errors: string[] = [];

  // Brand voice validation
  if (config.brand.sliders.formality < 0 || config.brand.sliders.formality > 100) {
    errors.push('Formality slider must be between 0 and 100');
  }
  if (config.brand.sliders.warmth < 0 || config.brand.sliders.warmth > 100) {
    errors.push('Warmth slider must be between 0 and 100');
  }
  if (config.brand.sliders.directness < 0 || config.brand.sliders.directness > 100) {
    errors.push('Directness slider must be between 0 and 100');
  }
  if (config.brand.sliders.energy < 0 || config.brand.sliders.energy > 100) {
    errors.push('Energy slider must be between 0 and 100');
  }
  if (config.brand.sliders.detailLevel < 0 || config.brand.sliders.detailLevel > 100) {
    errors.push('Detail level slider must be between 0 and 100');
  }
  if (config.brand.sliders.riskPosture < 0 || config.brand.sliders.riskPosture > 100) {
    errors.push('Risk posture slider must be between 0 and 100');
  }

  // Personality validation
  const validArchetypes = ["mentor", "peer", "guide", "administrator", "professional", "counselor"];
  if (!validArchetypes.includes(config.personality.archetype)) {
    errors.push(`Personality archetype must be one of: ${validArchetypes.join(', ')}`);
  }

  const validEmpathy = ["low", "medium", "high"];
  if (!validEmpathy.includes(config.personality.empathy)) {
    errors.push(`Empathy must be one of: ${validEmpathy.join(', ')}`);
  }

  const validEnthusiasm = ["reserved", "balanced", "cheerful"];
  if (!validEnthusiasm.includes(config.personality.enthusiasm)) {
    errors.push(`Enthusiasm must be one of: ${validEnthusiasm.join(', ')}`);
  }

  // Tone rules validation
  for (const rule of config.toneRules) {
    if (!rule.id || !rule.label) {
      errors.push('Tone rules must have id and label');
    }
    if (!rule.trigger || rule.trigger.length === 0) {
      errors.push(`Tone rule "${rule.label}" must have at least one trigger`);
    }
    if (!rule.rules.openingStrategy) {
      errors.push(`Tone rule "${rule.label}" must have an opening strategy`);
    }
  }

  return errors;
}

