import { dbProvider } from './providers/dbProvider';

export const crmClient = dbProvider;

// Re-export types for convenience
export type {
  CRMContext,
  Constituent,
  ConstituentInput,
  Organization,
  OrganizationInput,
  Opportunity,
  OpportunityInput,
  Interaction,
  InteractionInput,
  SeedOptions,
  SimulateOptions,
} from './types';

