'use server';

import { getNarrativeProvider } from './providers/getProvider';
import {
  getPreviewScenarios as getPreviewScenariosFromSeed,
  getPerformanceSummary as getPerformanceSummaryFromSeed,
  isNarrativeSeedEnabled as isNarrativeSeedEnabledFromSeed,
} from './seed/loadNarrativeSeed';
import type {
  NarrativeContext,
  NarrativeAssetInput,
  ListNarrativeAssetsOptions,
  ProofBlockInput,
  ListProofBlocksOptions,
  DeliveryPlayInput,
  GetPerformanceStatsOptions,
  RecommendOptions,
  ComposeOptions,
  NarrativeDeliveryEvent,
} from './types';

export async function listNarrativeAssets(ctx: NarrativeContext, options?: ListNarrativeAssetsOptions) {
  const provider = getNarrativeProvider();
  return provider.listNarrativeAssets(ctx, options);
}

export async function getNarrativeAsset(ctx: NarrativeContext, id: string) {
  const provider = getNarrativeProvider();
  return provider.getNarrativeAsset(ctx, id);
}

export async function createNarrativeAsset(ctx: NarrativeContext, data: NarrativeAssetInput) {
  const provider = getNarrativeProvider();
  return provider.createNarrativeAsset(ctx, data);
}

export async function updateNarrativeAsset(
  ctx: NarrativeContext,
  id: string,
  data: Partial<NarrativeAssetInput>
) {
  const provider = getNarrativeProvider();
  return provider.updateNarrativeAsset(ctx, id, data);
}

export async function deleteNarrativeAsset(ctx: NarrativeContext, id: string) {
  const provider = getNarrativeProvider();
  return provider.deleteNarrativeAsset(ctx, id);
}

export async function submitForReview(ctx: NarrativeContext, id: string) {
  const provider = getNarrativeProvider();
  return provider.submitForReview(ctx, id);
}

export async function approve(ctx: NarrativeContext, id: string) {
  const provider = getNarrativeProvider();
  return provider.approve(ctx, id);
}

export async function reject(ctx: NarrativeContext, id: string) {
  const provider = getNarrativeProvider();
  return provider.reject(ctx, id);
}

export async function listProofBlocks(ctx: NarrativeContext, options?: ListProofBlocksOptions) {
  const provider = getNarrativeProvider();
  return provider.listProofBlocks(ctx, options);
}

export async function getProofBlock(ctx: NarrativeContext, id: string) {
  const provider = getNarrativeProvider();
  return provider.getProofBlock(ctx, id);
}

export async function createProofBlock(ctx: NarrativeContext, data: ProofBlockInput) {
  const provider = getNarrativeProvider();
  return provider.createProofBlock(ctx, data);
}

export async function updateProofBlock(
  ctx: NarrativeContext,
  id: string,
  data: Partial<ProofBlockInput>
) {
  const provider = getNarrativeProvider();
  return provider.updateProofBlock(ctx, id, data);
}

export async function deleteProofBlock(ctx: NarrativeContext, id: string) {
  const provider = getNarrativeProvider();
  return provider.deleteProofBlock(ctx, id);
}

export async function linkProofToNarrative(
  ctx: NarrativeContext,
  narrativeAssetId: string,
  proofBlockId: string
) {
  const provider = getNarrativeProvider();
  return provider.linkProofToNarrative(ctx, narrativeAssetId, proofBlockId);
}

export async function unlinkProofFromNarrative(
  ctx: NarrativeContext,
  narrativeAssetId: string,
  proofBlockId: string
) {
  const provider = getNarrativeProvider();
  return provider.unlinkProofFromNarrative(ctx, narrativeAssetId, proofBlockId);
}

export async function listProofForNarrative(ctx: NarrativeContext, narrativeAssetId: string) {
  const provider = getNarrativeProvider();
  return provider.listProofForNarrative(ctx, narrativeAssetId);
}

export async function listDeliveryPlays(ctx: NarrativeContext) {
  const provider = getNarrativeProvider();
  return provider.listDeliveryPlays(ctx);
}

export async function createDeliveryPlay(ctx: NarrativeContext, data: DeliveryPlayInput) {
  const provider = getNarrativeProvider();
  return provider.createDeliveryPlay(ctx, data);
}

export async function getPerformanceStats(ctx: NarrativeContext, options?: GetPerformanceStatsOptions) {
  const provider = getNarrativeProvider();
  return provider.getPerformanceStats(ctx, options);
}

export async function getLearningSignals(ctx: NarrativeContext, options?: GetPerformanceStatsOptions) {
  const provider = getNarrativeProvider();
  return provider.getLearningSignals(ctx, options);
}

export async function recommend(ctx: NarrativeContext, options?: RecommendOptions) {
  const provider = getNarrativeProvider();
  return provider.recommend(ctx, options);
}

export async function compose(ctx: NarrativeContext, options: ComposeOptions) {
  const provider = getNarrativeProvider();
  return provider.compose(ctx, options);
}

export async function recordEvent(
  ctx: NarrativeContext,
  event: Omit<NarrativeDeliveryEvent, 'workspace' | 'sub_workspace'>
) {
  const provider = getNarrativeProvider();
  return provider.recordEvent(ctx, event);
}

/** When SEED_NARRATIVE_UNC=true, returns 4 preview scenarios for the Preview tab. */
export async function getPreviewScenarios() {
  return getPreviewScenariosFromSeed();
}

/** When SEED_NARRATIVE_UNC=true, returns top narratives, top proof blocks, and demo note for Performance tab. */
export async function getPerformanceSummary() {
  return getPerformanceSummaryFromSeed();
}

/** True when SEED_NARRATIVE_UNC=true (for demo banners). */
export async function isNarrativeSeedEnabled() {
  return isNarrativeSeedEnabledFromSeed();
}
