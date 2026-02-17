/**
 * Client-safe Narrative Library - uses mock provider directly.
 * Use this for static export / client components to avoid server-only imports.
 * Same interface as narrativeClient from index.ts.
 */

import { narrativeMockProvider } from './providers/mockProvider';
import {
  getPreviewScenarios as getPreviewScenariosFromSeed,
  getPerformanceSummary as getPerformanceSummaryFromSeed,
  isNarrativeSeedEnabled as isNarrativeSeedEnabledFromSeed,
} from './seed/loadNarrativeSeed';
import type { NarrativeContext } from './types';

const provider = narrativeMockProvider;

export const narrativeClient = {
  listNarrativeAssets: (ctx: NarrativeContext, options?: Parameters<typeof provider.listNarrativeAssets>[1]) =>
    provider.listNarrativeAssets(ctx, options),
  getNarrativeAsset: (ctx: NarrativeContext, id: string) => provider.getNarrativeAsset(ctx, id),
  createNarrativeAsset: (ctx: NarrativeContext, data: Parameters<typeof provider.createNarrativeAsset>[1]) =>
    provider.createNarrativeAsset(ctx, data),
  updateNarrativeAsset: (
    ctx: NarrativeContext,
    id: string,
    data: Parameters<typeof provider.updateNarrativeAsset>[2]
  ) => provider.updateNarrativeAsset(ctx, id, data),
  deleteNarrativeAsset: (ctx: NarrativeContext, id: string) => provider.deleteNarrativeAsset(ctx, id),
  submitForReview: (ctx: NarrativeContext, id: string) => provider.submitForReview(ctx, id),
  approve: (ctx: NarrativeContext, id: string) => provider.approve(ctx, id),
  reject: (ctx: NarrativeContext, id: string) => provider.reject(ctx, id),
  listProofBlocks: (ctx: NarrativeContext, options?: Parameters<typeof provider.listProofBlocks>[1]) =>
    provider.listProofBlocks(ctx, options),
  getProofBlock: (ctx: NarrativeContext, id: string) => provider.getProofBlock(ctx, id),
  createProofBlock: (ctx: NarrativeContext, data: Parameters<typeof provider.createProofBlock>[1]) =>
    provider.createProofBlock(ctx, data),
  updateProofBlock: (
    ctx: NarrativeContext,
    id: string,
    data: Parameters<typeof provider.updateProofBlock>[2]
  ) => provider.updateProofBlock(ctx, id, data),
  deleteProofBlock: (ctx: NarrativeContext, id: string) => provider.deleteProofBlock(ctx, id),
  linkProofToNarrative: (
    ctx: NarrativeContext,
    narrativeAssetId: string,
    proofBlockId: string
  ) => provider.linkProofToNarrative(ctx, narrativeAssetId, proofBlockId),
  unlinkProofFromNarrative: (
    ctx: NarrativeContext,
    narrativeAssetId: string,
    proofBlockId: string
  ) => provider.unlinkProofFromNarrative(ctx, narrativeAssetId, proofBlockId),
  listProofForNarrative: (ctx: NarrativeContext, narrativeAssetId: string) =>
    provider.listProofForNarrative(ctx, narrativeAssetId),
  listDeliveryPlays: (ctx: NarrativeContext) => provider.listDeliveryPlays(ctx),
  createDeliveryPlay: (ctx: NarrativeContext, data: Parameters<typeof provider.createDeliveryPlay>[1]) =>
    provider.createDeliveryPlay(ctx, data),
  getPerformanceStats: (ctx: NarrativeContext, options?: Parameters<typeof provider.getPerformanceStats>[1]) =>
    provider.getPerformanceStats(ctx, options),
  getLearningSignals: (ctx: NarrativeContext, options?: Parameters<typeof provider.getLearningSignals>[1]) =>
    provider.getLearningSignals(ctx, options),
  recommend: (ctx: NarrativeContext, options?: Parameters<typeof provider.recommend>[1]) =>
    provider.recommend(ctx, options),
  compose: (ctx: NarrativeContext, options: Parameters<typeof provider.compose>[1]) =>
    provider.compose(ctx, options),
  recordEvent: (
    ctx: NarrativeContext,
    event: Parameters<typeof provider.recordEvent>[1]
  ) => provider.recordEvent(ctx, event),
  getPreviewScenarios: () => Promise.resolve(getPreviewScenariosFromSeed()),
  getPerformanceSummary: () => Promise.resolve(getPerformanceSummaryFromSeed()),
  isNarrativeSeedEnabled: () => Promise.resolve(isNarrativeSeedEnabledFromSeed()),
};

export type {
  NarrativeContext,
  NarrativeWorkspace,
  NarrativeAssetRecord,
  NarrativeAssetInput,
  ListNarrativeAssetsOptions,
  ProofBlockRecord,
  ProofBlockInput,
  ListProofBlocksOptions,
  DeliveryPlayRecord,
  DeliveryPlayInput,
  EntityNarrativeContextInput,
  EntityNarrativeContext,
  RecommendOptions,
  RecommendResult,
  ComposeOptions,
  ComposeResult,
  NarrativeEventType,
  NarrativeDeliveryEvent,
  ListEventsOptions,
  NarrativePerformanceStats,
  GetPerformanceStatsOptions,
  LearningSignal,
} from './types';
export type { DomainScope } from './taxonomy';
