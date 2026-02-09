/**
 * Narrative Asset Schema
 *
 * Required structure for governance, RBAC, approvals, and compliance.
 * @see docs/prd/narrative-platform-prd-and-plan.md
 */

import { z } from 'zod';
import {
  DomainScopeSchema,
  SubDomainScopeSchema,
  MessageIntentSchema,
  RelationshipTypeSchema,
  ChannelFitSchema,
  VoiceSchema,
  ComplianceRiskLevelSchema,
  PiiTierSchema,
  ApprovalStateSchema,
} from './enums';

/** Outcome + Moment are taxonomy values (enums) - placeholder until taxonomy is defined */
export const OutcomeSchema = z.string().min(1);
export const MomentSchema = z.string().min(1);

/** Content/module reference - narrative body or module IDs */
export const NarrativeModuleSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['opening', 'body', 'proof_slot', 'cta', 'closing']),
  contentRef: z.string().optional(),
});

export const NarrativeAssetSchema = z
  .object({
    id: z.string().uuid(),
    workspace: z.string().min(1),
    domain_scope: DomainScopeSchema,
    sub_domain_scope: SubDomainScopeSchema,
    outcome: OutcomeSchema,
    moment: MomentSchema,
    message_intent: MessageIntentSchema,
    channel_fit: z.array(ChannelFitSchema).min(1),
    voice: VoiceSchema,
    compliance_risk_level: ComplianceRiskLevelSchema,
    pii_tier: PiiTierSchema,
    approval_state: ApprovalStateSchema,
    relationship_type: RelationshipTypeSchema.optional(),
    modules: z.array(NarrativeModuleSchema).optional(),
    contentRef: z.string().optional(),
    embedding: z.array(z.number()).optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
    createdById: z.string().uuid().optional(),
    approvedById: z.string().uuid().optional(),
  })
  .refine(
    (data) => {
      if (data.domain_scope === 'student_lifecycle') {
        return [
          'admissions',
          'registrar',
          'financial_aid',
          'bursar',
          'housing',
          'student_success',
        ].includes(data.sub_domain_scope);
      }
      if (data.domain_scope === 'advancement_giving') {
        return [
          'pipeline_intelligence',
          'giving_intelligence',
          'stewardship',
        ].includes(data.sub_domain_scope);
      }
      return true;
    },
    { message: 'domain_scope and sub_domain_scope must be consistent' }
  );

export type NarrativeAsset = z.infer<typeof NarrativeAssetSchema>;
export type NarrativeModule = z.infer<typeof NarrativeModuleSchema>;
