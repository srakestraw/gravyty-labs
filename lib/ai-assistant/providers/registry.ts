/**
 * Provider Registry
 * 
 * Central registry for domain-scoped data providers used by the AI Assistant.
 * Providers are injected at composition time, not hard-coded deep in the assistant.
 */

import type { Domain, UserContext } from './types';
import type { AdmissionsDataProvider } from './types';
import type { AdvancementDataProvider } from './types';
import { AdmissionsDataProviderImpl } from './admissions';
import { AdvancementDataProviderImpl } from './advancement';
import { features } from '@/lib/features';

export interface DomainProvider {
  admissions: AdmissionsDataProvider;
  advancement: AdvancementDataProvider;
}

/**
 * Create a provider registry with domain-scoped providers
 */
export function createProviderRegistry(): DomainProvider {
  return {
    admissions: new AdmissionsDataProviderImpl(),
    advancement: new AdvancementDataProviderImpl(),
  };
}

/**
 * Get provider for a specific domain
 */
export function getProviderForDomain(
  registry: DomainProvider,
  domain: Domain,
  userContext: UserContext
): AdmissionsDataProvider | AdvancementDataProvider {
  // Feature flag check for Advancement
  if (domain === 'advancement') {
    const enabled = features.advancementPipelineAssistantEnabled ?? false;
    if (!enabled) {
      throw new Error(
        'Advancement Pipeline Assistant is not enabled. Set features.advancementPipelineAssistantEnabled to true.'
      );
    }
  }

  return registry[domain];
}

/**
 * Check if a domain is available
 */
export function isDomainAvailable(domain: Domain): boolean {
  if (domain === 'admissions') {
    return true; // Always available
  }
  if (domain === 'advancement') {
    return features.advancementPipelineAssistantEnabled ?? false;
  }
  return false;
}



