/**
 * Guardrails config store and persistence helpers
 * 
 * TODO: Replace with real persistence (Prisma/DB, JSON file, KV, etc.)
 * Currently uses in-memory storage for MVP
 */

import { GuardrailsConfig, ActionMode } from './types';
import { DEFAULT_GUARDRAILS } from './config';

// In-memory storage (replace with real persistence)
let cachedConfig: GuardrailsConfig | null = null;

/**
 * Convert existing DEFAULT_GUARDRAILS to new GuardrailsConfig format
 */
function convertLegacyConfig(): GuardrailsConfig {
  const legacy = DEFAULT_GUARDRAILS;
  
  return {
    fairness: {
      protectedAttributes: legacy.fairness.protectedAttributes,
      allowAttributeOverrides: legacy.fairness.allowProtectedUseForSupportPrograms,
      languageGuidelines: {
        avoidFraming: legacy.fairness.bannedPhrases,
        preferredFraming: [], // Not in legacy config
      },
      fairnessEvalsEnabled: legacy.fairness.requireFairnessEvalForAutoAgents,
    },
    privacy: {
      allowedDomains: legacy.dataScope.allowedDomains as any,
      sensitiveDomainsExcluded: [
        ...(legacy.dataScope.excludeConfidentialNotes ? ['counseling_notes'] : []),
        ...(legacy.dataScope.disallowMentalHealthData ? ['mental_health'] : []),
        ...(legacy.dataScope.disallowConductRecords ? ['conduct_records'] : []),
      ],
      emailPolicy: legacy.dataScope.channelContentRules.email === 'summary_ok' ? 'summary_only' : 'no_sensitive',
      smsPolicy: legacy.dataScope.channelContentRules.sms === 'reminders_only' ? 'reminders_only' : 'restricted',
      phonePolicy: legacy.dataScope.channelContentRules.phone === 'summary_ok' ? 'summary_only' : 'restricted',
    },
    engagement: {
      quietHours: {
        enabled: legacy.contactPolicy.quietHours.enabled,
        startLocal: legacy.contactPolicy.quietHours.startTime,
        endLocal: legacy.contactPolicy.quietHours.endTime,
        timezone: legacy.contactPolicy.quietHours.timezoneMode === 'recipient' ? 'recipient' : 'institution',
      },
      seasonalQuietPeriods: legacy.contactPolicy.quietPeriods.map(qp => ({
        id: qp.id,
        label: qp.name,
        startDate: qp.startDate,
        endDate: qp.endDate,
      })),
      holidayRules: legacy.contactPolicy.sensitiveDates.map(sd => ({
        id: sd.id,
        label: sd.name,
        date: sd.date,
        scope: sd.appliesTo === 'all' ? 'global' : sd.appliesTo as any,
      })),
      frequencyCaps: {
        globalMaxMessagesPerWeek: legacy.contactPolicy.globalFrequencyCaps.maxMessagesPerWeek,
        globalMaxMessagesPerDay: legacy.contactPolicy.globalFrequencyCaps.maxMessagesPerDay,
        perAgentDefaultMaxIn14Days: legacy.contactPolicy.perAgentFrequencyCapsDefault.maxMessagesPer14Days,
        maxUnansweredAttemptsBeforeEscalation: legacy.contactPolicy.perAgentFrequencyCapsDefault.escalationAfterUnansweredCount,
      },
    },
    actions: {
      rules: Object.entries(legacy.actions.defaults).map(([actionKey, mode]) => ({
        actionKey,
        mode: mode as ActionMode,
      })),
      loggingRequired: legacy.logging.requireActionLogging,
      requireEvalBeforeAuto: legacy.logging.requireEvalStatusBeforeAuto,
    },
    // Escalation rules will be loaded separately or from API
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Load guardrails config
 * TODO: Replace with real API call or DB query
 */
export async function loadGuardrailsConfig(): Promise<GuardrailsConfig> {
  // For now, return converted legacy config or cached
  if (cachedConfig) {
    return cachedConfig;
  }
  
  // Convert and cache
  cachedConfig = convertLegacyConfig();
  return cachedConfig;
}

/**
 * Save guardrails config
 * TODO: Replace with real API call or DB save
 */
export async function saveGuardrailsConfig(
  config: GuardrailsConfig,
  updatedBy?: string
): Promise<GuardrailsConfig> {
  // Validate config
  const validationErrors = validateGuardrailsConfig(config);
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
  }

  // Update metadata
  const updatedConfig: GuardrailsConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  // TODO: Save to database/API
  cachedConfig = updatedConfig;
  
  return updatedConfig;
}

/**
 * Validate guardrails config
 */
export function validateGuardrailsConfig(config: GuardrailsConfig): string[] {
  const errors: string[] = [];

  // Protected attributes validation
  if (config.fairness.protectedAttributes.some(attr => !attr || attr.trim() === '')) {
    errors.push('Protected attributes cannot contain empty strings');
  }

  // Seasonal quiet periods validation
  for (const period of config.engagement.seasonalQuietPeriods) {
    if (new Date(period.startDate) > new Date(period.endDate)) {
      errors.push(`Seasonal quiet period "${period.label}" has startDate after endDate`);
    }
  }

  // Frequency caps validation
  if (config.engagement.frequencyCaps.globalMaxMessagesPerWeek <= 0) {
    errors.push('Global max messages per week must be positive');
  }
  if (config.engagement.frequencyCaps.globalMaxMessagesPerDay <= 0) {
    errors.push('Global max messages per day must be positive');
  }
  if (config.engagement.frequencyCaps.perAgentDefaultMaxIn14Days <= 0) {
    errors.push('Per-agent default max in 14 days must be positive');
  }
  if (config.engagement.frequencyCaps.maxUnansweredAttemptsBeforeEscalation <= 0) {
    errors.push('Max unanswered attempts before escalation must be positive');
  }

  // Quiet hours validation
  if (config.engagement.quietHours.enabled) {
    if (config.engagement.quietHours.startLocal === config.engagement.quietHours.endLocal) {
      errors.push('Quiet hours start and end times cannot be equal when enabled');
    }
  }

  return errors;
}

