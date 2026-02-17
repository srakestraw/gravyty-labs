/**
 * Server-only: returns the narrative provider (DB when USE_NARRATIVE_DB=true, else mock).
 * Only import this from server code (e.g. server actions).
 * When SEED_NARRATIVE_UNC=true, the mock provider is seeded once with UNC fixture data.
 */

import 'server-only';
import type { NarrativeLibraryProvider } from '../types';
import { narrativeMockProvider, seedFromFixture } from './mockProvider';
import { createNarrativeDbProvider } from './dbProvider';

let dbProviderInstance: NarrativeLibraryProvider | null = null;
let narrativeSeedLoaded = false;

function getNarrativeProvider(): NarrativeLibraryProvider {
  if (process.env.USE_NARRATIVE_DB === 'true') {
    if (!dbProviderInstance) dbProviderInstance = createNarrativeDbProvider();
    return dbProviderInstance;
  }
  if (process.env.SEED_NARRATIVE_UNC === 'true' && !narrativeSeedLoaded) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fixture = require('@/data/seed/narrative_messaging_unc.json');
      seedFromFixture(fixture);
      narrativeSeedLoaded = true;
    } catch (e) {
      console.warn('[narrative] SEED_NARRATIVE_UNC: could not load fixture', e);
    }
  }
  return narrativeMockProvider;
}

export { getNarrativeProvider };
