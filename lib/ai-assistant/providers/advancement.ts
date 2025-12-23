/**
 * Advancement Data Provider Implementation (Stub for Phase 1)
 * 
 * Phase 1: Returns "not implemented" errors or empty results.
 * This provider is feature-flagged and will be implemented in later phases.
 */

import type {
  AdvancementDataProvider,
  UserContext,
  ProviderResponse,
  DonorSummary,
  ProspectSearchResult,
  ProspectSearchFilters,
  PipelineSnapshot,
  PipelineSnapshotFilters,
} from './types';
import { notImplementedResponse } from './types';

export class AdvancementDataProviderImpl implements AdvancementDataProvider {
  async getDonorSummary(
    userContext: UserContext,
    donorId: string
  ): Promise<ProviderResponse<DonorSummary>> {
    // Phase 1: Not implemented
    return notImplementedResponse<DonorSummary>('Donor summary retrieval');
  }

  async searchProspects(
    userContext: UserContext,
    query: string,
    filters?: ProspectSearchFilters,
    pagination?: { page: number; pageSize: number }
  ): Promise<ProviderResponse<ProspectSearchResult>> {
    // Phase 1: Return empty result with clear stub marker
    const result: ProspectSearchResult = {
      prospects: [],
      total: 0,
      page: pagination?.page ?? 1,
      pageSize: pagination?.pageSize ?? 20,
    };

    return {
      data: result,
      errors: [{
        code: 'NOT_IMPLEMENTED',
        message: 'Prospect search is planned for a later phase and is not yet available.',
      }],
    };
  }

  async getPipelineSnapshot(
    userContext: UserContext,
    filters?: PipelineSnapshotFilters
  ): Promise<ProviderResponse<PipelineSnapshot>> {
    // Phase 1: Not implemented
    return notImplementedResponse<PipelineSnapshot>('Pipeline snapshot retrieval');
  }
}

