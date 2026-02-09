/**
 * Narrative Library Service - Phase 1
 * CRUD, approvals, workspace-scoped filtering.
 */

import { narrativeMockProvider } from './providers/mockProvider';

export const narrativeClient = narrativeMockProvider;

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
export { embedTextStub, EMBEDDING_DIMENSION } from './embedding';
export { getOutcomes, getMoments } from './taxonomy';
export type { DomainScope } from './taxonomy';
