/**
 * Communication config store and persistence helpers
 * 
 * TODO: Replace with real persistence (Prisma/DB, JSON file, KV, etc.)
 * Currently uses in-memory storage for MVP
 */

import { CommunicationConfig, BrandVoiceConfig, PersonalityConfig, ToneRule, AssignmentRule, VoiceProfile } from './types';
import { convertToneRuleToAssignmentRule } from './resolveVoiceProfile';

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

const DEFAULT_VOICE_PROFILES: VoiceProfile[] = [
  {
    id: 'profile_institutional',
    name: 'Institutional',
    description: 'Default institutional voice profile',
    isDefault: true,
    brand: {
      typographyStyle: 'system',
    },
    missionValues: ["student-centered", "equity-first"],
    communicationPillars: ["clarity", "support", "transparency"],
    characteristics: {
      formality: 60,
      warmth: 70,
      directness: 65,
      energy: 60,
      detailLevel: 70,
      riskPosture: 50,
    },
    stylePreferences: {
      allowEmojis: true,
      allowContractions: true,
      useFirstPerson: false,
      allowLightHumor: false,
    },
  },
];

const DEFAULT_PERSONALITY: PersonalityConfig = {
  archetype: "guide",
  empathy: "high",
  enthusiasm: "balanced",
  humorAllowed: false,
  figurativeLanguage: true,
};

const DEFAULT_TONE_RULES: ToneRule[] = [];
const DEFAULT_ASSIGNMENT_RULES: AssignmentRule[] = [];

const DEFAULT_CONFIG: CommunicationConfig = {
  voiceProfiles: DEFAULT_VOICE_PROFILES,
  brand: DEFAULT_BRAND_VOICE, // Keep for backward compatibility
  personality: DEFAULT_PERSONALITY,
  assignmentRules: DEFAULT_ASSIGNMENT_RULES,
  toneRules: DEFAULT_TONE_RULES, // Legacy support
  updatedAt: new Date().toISOString(),
};

/**
 * Load communication config
 * TODO: Replace with real API call or DB query
 */
// Migrate config from toneRules to assignmentRules
function migrateConfig(config: CommunicationConfig): CommunicationConfig {
  // If already has assignmentRules, return as-is
  if (config.assignmentRules && config.assignmentRules.length > 0) {
    return config;
  }

  // Migrate toneRules to assignmentRules
  if (config.toneRules && config.toneRules.length > 0) {
    const assignmentRules = config.toneRules.map(convertToneRuleToAssignmentRule);
    return {
      ...config,
      assignmentRules,
      // Keep toneRules for backward compatibility during migration
    };
  }

  // Initialize empty assignmentRules if neither exists
  return {
    ...config,
    assignmentRules: [],
  };
}

export async function loadCommunicationConfig(): Promise<CommunicationConfig> {
  // For now, return cached config or defaults
  let config: CommunicationConfig;
  if (cachedConfig) {
    config = cachedConfig;
  } else {
    config = { ...DEFAULT_CONFIG };
  }
  
  // Migrate and return
  const migrated = migrateConfig(config);
  cachedConfig = migrated;
  return migrated;
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

  // Voice profiles validation
  if (!config.voiceProfiles || config.voiceProfiles.length === 0) {
    errors.push('At least one voice profile is required');
  } else {
    const defaultCount = config.voiceProfiles.filter(p => p.isDefault).length;
    if (defaultCount === 0) {
      errors.push('Exactly one voice profile must be marked as default');
    } else if (defaultCount > 1) {
      errors.push('Only one voice profile can be marked as default');
    }

    config.voiceProfiles.forEach((profile, index) => {
      if (!profile.id || !profile.name) {
        errors.push(`Voice profile ${index + 1} must have id and name`);
      }
      if (profile.characteristics.formality < 0 || profile.characteristics.formality > 100) {
        errors.push(`Profile "${profile.name}": Formality must be between 0 and 100`);
      }
      if (profile.characteristics.warmth < 0 || profile.characteristics.warmth > 100) {
        errors.push(`Profile "${profile.name}": Warmth must be between 0 and 100`);
      }
      if (profile.characteristics.directness < 0 || profile.characteristics.directness > 100) {
        errors.push(`Profile "${profile.name}": Directness must be between 0 and 100`);
      }
      if (profile.characteristics.energy < 0 || profile.characteristics.energy > 100) {
        errors.push(`Profile "${profile.name}": Energy must be between 0 and 100`);
      }
      if (profile.characteristics.detailLevel < 0 || profile.characteristics.detailLevel > 100) {
        errors.push(`Profile "${profile.name}": Detail level must be between 0 and 100`);
      }
      if (profile.characteristics.riskPosture < 0 || profile.characteristics.riskPosture > 100) {
        errors.push(`Profile "${profile.name}": Risk posture must be between 0 and 100`);
      }
    });
  }

  // Legacy brand voice validation (for backward compatibility during migration)
  if (config.brand && config.brand.sliders) {
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

  // Assignment rules validation
  const assignmentRules = config.assignmentRules || [];
  for (const rule of assignmentRules) {
    if (!rule.id) {
      errors.push('Assignment rules must have id');
    }
    if (!rule.scope || !['user', 'group', 'agent', 'app'].includes(rule.scope)) {
      errors.push(`Assignment rule "${rule.id}" must have a valid scope (user, group, agent, or app)`);
    }
    if (!rule.targetId || !rule.targetLabel) {
      errors.push(`Assignment rule "${rule.id}" must have targetId and targetLabel`);
    }
    if (!rule.profileId) {
      errors.push(`Assignment rule "${rule.id}" must have a profileId`);
    }
    if (!config.voiceProfiles?.find(p => p.id === rule.profileId)) {
      errors.push(`Assignment rule "${rule.id}" references a non-existent voice profile`);
    }
    if (typeof rule.order !== 'number') {
      errors.push(`Assignment rule "${rule.id}" must have an order number`);
    }
  }

  // Legacy tone rules validation (for backward compatibility)
  const toneRules = config.toneRules || [];
  for (const rule of toneRules) {
    if (!rule.id) {
      errors.push('Tone rules must have id');
    }
    if (!rule.scope || !['app', 'group', 'user'].includes(rule.scope)) {
      errors.push(`Tone rule "${rule.id}" must have a valid scope (app, group, or user)`);
    }
    if (!rule.targetId || !rule.targetLabel) {
      errors.push(`Tone rule "${rule.id}" must have targetId and targetLabel`);
    }
    if (!rule.profileId) {
      errors.push(`Tone rule "${rule.id}" must have a profileId`);
    }
    if (!config.voiceProfiles?.find(p => p.id === rule.profileId)) {
      errors.push(`Tone rule "${rule.id}" references a non-existent voice profile`);
    }
    if (typeof rule.order !== 'number') {
      errors.push(`Tone rule "${rule.id}" must have an order number`);
    }
  }

  return errors;
}

