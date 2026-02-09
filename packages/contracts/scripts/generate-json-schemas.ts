#!/usr/bin/env tsx
/**
 * Generate JSON Schema from Zod schemas for Narrative Platform.
 * Run: npm run generate-json-schemas
 * Output: packages/contracts/schemas/json/narrative_asset.json, etc.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  NarrativeAssetSchema,
  ProofBlockSchema,
  DeliveryPlaySchema,
} from '../src/schemas/narrative';

const outDir = join(__dirname, '../schemas/json');
mkdirSync(outDir, { recursive: true });

const narrativeAsset = zodToJsonSchema(NarrativeAssetSchema, {
  name: 'NarrativeAsset',
  $refStrategy: 'none',
});
writeFileSync(
  join(outDir, 'narrative_asset.json'),
  JSON.stringify(narrativeAsset, null, 2)
);

const proofBlock = zodToJsonSchema(ProofBlockSchema, {
  name: 'ProofBlock',
  $refStrategy: 'none',
});
writeFileSync(
  join(outDir, 'proof_block.json'),
  JSON.stringify(proofBlock, null, 2)
);

const deliveryPlay = zodToJsonSchema(DeliveryPlaySchema, {
  name: 'DeliveryPlay',
  $refStrategy: 'none',
});
writeFileSync(
  join(outDir, 'delivery_play.json'),
  JSON.stringify(deliveryPlay, null, 2)
);

console.log('Generated JSON schemas in schemas/json/');
console.log('  - narrative_asset.json');
console.log('  - proof_block.json');
console.log('  - delivery_play.json');
