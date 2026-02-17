/**
 * Narrative Library Service - Phase 1
 * CRUD, approvals, workspace-scoped filtering.
 * Uses server actions; provider is mock or DB based on USE_NARRATIVE_DB.
 */

import * as actions from './actions';

export const narrativeClient = {
  listNarrativeAssets: actions.listNarrativeAssets,
  getNarrativeAsset: actions.getNarrativeAsset,
  createNarrativeAsset: actions.createNarrativeAsset,
  updateNarrativeAsset: actions.updateNarrativeAsset,
  deleteNarrativeAsset: actions.deleteNarrativeAsset,
  submitForReview: actions.submitForReview,
  approve: actions.approve,
  reject: actions.reject,
  listProofBlocks: actions.listProofBlocks,
  getProofBlock: actions.getProofBlock,
  createProofBlock: actions.createProofBlock,
  updateProofBlock: actions.updateProofBlock,
  deleteProofBlock: actions.deleteProofBlock,
  linkProofToNarrative: actions.linkProofToNarrative,
  unlinkProofFromNarrative: actions.unlinkProofFromNarrative,
  listProofForNarrative: actions.listProofForNarrative,
  listDeliveryPlays: actions.listDeliveryPlays,
  createDeliveryPlay: actions.createDeliveryPlay,
  getPerformanceStats: actions.getPerformanceStats,
  getLearningSignals: actions.getLearningSignals,
  recommend: actions.recommend,
  compose: actions.compose,
  recordEvent: actions.recordEvent,
  getPreviewScenarios: actions.getPreviewScenarios,
  getPerformanceSummary: actions.getPerformanceSummary,
  isNarrativeSeedEnabled: actions.isNarrativeSeedEnabled,
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
  NarrativeLibraryProvider,
} from './types';

export { buildEntityNarrativeContext, contextToEmbeddingText } from './context-builder';
export { embedText, embedTextStub, EMBEDDING_DIMENSION } from './embedding';
export { getOutcomes, getMoments } from './taxonomy';
export type { DomainScope } from './taxonomy';
export { getRequiredApprovers, requiresDesignatedApprover } from './rbac';