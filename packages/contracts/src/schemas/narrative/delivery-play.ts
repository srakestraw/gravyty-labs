/**
 * Delivery Play Schema
 *
 * Domain-specific bindings of narratives to triggers, cadence, and success events.
 * @see docs/prd/narrative-platform-prd-and-plan.md
 */

import { z } from 'zod';
import {
  PlayCategorySchema,
  TriggerTypeSchema,
  CadencePolicySchema,
} from './enums';

export const DeliveryPlayEligibilitySchema = z.object({
  narrativeIds: z.array(z.string().uuid()).optional(),
  outcome: z.string().optional(),
  moment: z.string().optional(),
  segmentIds: z.array(z.string()).optional(),
});

export const DeliveryPlaySuccessEventSchema = z.object({
  type: z.string(),
  metric: z.string().optional(),
  threshold: z.number().optional(),
});

export const DeliveryPlaySchema = z.object({
  id: z.string().uuid(),
  workspace: z.string().min(1),
  sub_workspace: z.string().min(1),
  play_category: PlayCategorySchema,
  trigger_type: TriggerTypeSchema,
  cadence_policy: CadencePolicySchema,
  eligibility: DeliveryPlayEligibilitySchema,
  success_events: z.array(DeliveryPlaySuccessEventSchema).optional(),
  suppression_policy_id: z.string().uuid().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type DeliveryPlay = z.infer<typeof DeliveryPlaySchema>;
export type DeliveryPlayEligibility = z.infer<typeof DeliveryPlayEligibilitySchema>;
export type DeliveryPlaySuccessEvent = z.infer<
  typeof DeliveryPlaySuccessEventSchema
>;
