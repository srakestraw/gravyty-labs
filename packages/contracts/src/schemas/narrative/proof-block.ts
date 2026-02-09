/**
 * Proof Block Schema
 *
 * Reusable evidence objects with claim classes and compliance rules.
 * @see docs/prd/narrative-platform-prd-and-plan.md
 */

import { z } from 'zod';
import {
  ProofTypeSchema,
  ClaimSupportLevelSchema,
  ClaimClassSchema,
  VoiceSchema,
  ChannelFitSchema,
  FreshnessWindowSchema,
} from './enums';

export const ProofBlockSchema = z.object({
  id: z.string().uuid(),
  workspace: z.string().min(1),
  proof_type: ProofTypeSchema,
  claim_support_level: ClaimSupportLevelSchema,
  claim_class: ClaimClassSchema,
  freshness_window: FreshnessWindowSchema,
  allowed_voice: z.array(VoiceSchema).min(1),
  content: z.string().min(1),
  restricted_channels: z.array(ChannelFitSchema).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type ProofBlock = z.infer<typeof ProofBlockSchema>;
