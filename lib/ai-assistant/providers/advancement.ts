/**
 * Advancement Data Provider Implementation
 *
 * Combines general advancement methods with pipeline-specific methods.
 * Pipeline methods delegate to AdvancementPipelineProvider.
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
  PriorityBucket,
  StalledSummary,
  PriorityProspectRow,
  ProspectDetail,
  LikelyToGiveProspect,
} from './types';
import { notImplementedResponse } from './types';
import { AdvancementPipelineProvider } from './advancementPipeline';

const pipelineProvider = new AdvancementPipelineProvider();

export class AdvancementDataProviderImpl implements AdvancementDataProvider {
  async getDonorSummary(
    userContext: UserContext,
    donorId: string
  ): Promise<ProviderResponse<DonorSummary>> {
    return notImplementedResponse<DonorSummary>('Donor summary retrieval');
  }

  async searchProspects(
    userContext: UserContext,
    query: string,
    filters?: ProspectSearchFilters,
    pagination?: { page: number; pageSize: number }
  ): Promise<ProviderResponse<ProspectSearchResult>> {
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
    return notImplementedResponse<PipelineSnapshot>('Pipeline snapshot retrieval');
  }

  async getStalledThisWeek(
    userContext: UserContext
  ): Promise<ProviderResponse<StalledSummary>> {
    return pipelineProvider.getStalledThisWeek(userContext);
  }

  async getPriorityBucket(
    userContext: UserContext,
    bucket: PriorityBucket
  ): Promise<ProviderResponse<PriorityProspectRow[]>> {
    return pipelineProvider.getPriorityBucket(userContext, bucket);
  }

  async getProspectDetail(
    userContext: UserContext,
    prospectId: string
  ): Promise<ProviderResponse<ProspectDetail>> {
    return pipelineProvider.getProspectDetail(userContext, prospectId);
  }

  async getLikelyToGive(
    userContext: UserContext,
    windowDays?: number
  ): Promise<ProviderResponse<LikelyToGiveProspect[]>> {
    return pipelineProvider.getLikelyToGive(userContext, windowDays);
  }

  async getPriorityListToday(
    userContext: UserContext
  ): Promise<ProviderResponse<PriorityProspectRow[]>> {
    return pipelineProvider.getPriorityListToday(userContext);
  }
}

