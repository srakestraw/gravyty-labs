/**
 * Narrative Messaging seed – types and loader for UNC fixture.
 * Use with SEED_NARRATIVE_UNC=true to populate mock provider and expose preview/performance demo data.
 */

export type {
  NarrativeSeedFixture,
  NarrativeSeedAsset,
  NarrativeSeedModule,
  ProofBlockSeed,
  NarrativeProofLinkSeed,
  DeliveryPlaySeed,
  PreviewScenarioSeed,
  PerformancePerNarrativeSeed,
  PerformanceTopNarrativeSeed,
  PerformanceTopProofSeed,
} from './types';
export {
  getPreviewScenarios,
  getPerformanceSummary,
  isNarrativeSeedEnabled,
} from './loadNarrativeSeed';
