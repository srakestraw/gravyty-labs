/**
 * Narrative Messaging seed loader – UNC fixture.
 * Used when SEED_NARRATIVE_UNC=true to expose preview scenarios and performance summary
 * for the Preview and Performance tabs without re-seeding the mock store.
 */

import type {
  NarrativeSeedFixture,
  PreviewScenarioSeed,
  PerformanceTopNarrativeSeed,
  PerformanceTopProofSeed,
} from './types';

let fixtureCache: NarrativeSeedFixture | null = null;

function getFixture(): NarrativeSeedFixture | null {
  if (process.env.SEED_NARRATIVE_UNC !== 'true') return null;
  if (fixtureCache) return fixtureCache;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    fixtureCache = require('@/data/seed/narrative_messaging_unc.json') as NarrativeSeedFixture;
    return fixtureCache;
  } catch {
    return null;
  }
}

/**
 * Returns the 4 preview scenarios (persona + context + assembled message + why chosen)
 * for the Preview tab when SEED_NARRATIVE_UNC=true. Otherwise null.
 */
export function getPreviewScenarios(): PreviewScenarioSeed[] | null {
  const fixture = getFixture();
  return fixture?.preview_scenarios ?? null;
}

/**
 * Returns performance summary for the Performance tab: top narratives this month,
 * top proof blocks, and a note that metrics are sample/demo data.
 * When SEED_NARRATIVE_UNC=true only.
 */
export function getPerformanceSummary(): {
  note: string;
  top_narratives_this_month: PerformanceTopNarrativeSeed[];
  top_proof_blocks: PerformanceTopProofSeed[];
} | null {
  const fixture = getFixture();
  const perf = fixture?.performance;
  if (!perf) return null;
  return {
    note: perf._note ?? 'Sample/demo data. Metrics are placeholders for display only.',
    top_narratives_this_month: perf.top_narratives_this_month ?? [],
    top_proof_blocks: perf.top_proof_blocks ?? [],
  };
}

/**
 * Whether the UNC narrative seed is enabled (for showing "Demo data" banners in UI).
 */
export function isNarrativeSeedEnabled(): boolean {
  return process.env.SEED_NARRATIVE_UNC === 'true';
}
