/**
 * Narrative Platform - Enum Dictionary
 *
 * Allowed values for schema validation. Single source of truth for:
 * - Zod schema validation
 * - JSON Schema generation
 * - UI dropdowns and filters
 *
 * @see docs/prd/narrative-platform-prd-and-plan.md
 */

import { z } from 'zod';

// -----------------------------------------------------------------------------
// Domain & Scope
// -----------------------------------------------------------------------------

export const DOMAIN_SCOPE = [
  'student_lifecycle',
  'advancement_giving',
] as const;

export const SUB_DOMAIN_SCOPE_STUDENT = [
  'admissions',
  'registrar',
  'financial_aid',
  'bursar',
  'housing',
  'student_success',
] as const;

export const SUB_DOMAIN_SCOPE_ADVANCEMENT = [
  'pipeline_intelligence',
  'giving_intelligence',
  'stewardship',
] as const;

export const SUB_DOMAIN_SCOPE = [
  ...SUB_DOMAIN_SCOPE_STUDENT,
  ...SUB_DOMAIN_SCOPE_ADVANCEMENT,
] as const;

// -----------------------------------------------------------------------------
// Message Intent & Relationship
// -----------------------------------------------------------------------------

export const MESSAGE_INTENT = [
  'nudge',
  'reminder',
  'explain',
  'resolve',
  'ask',
  'thank',
  'update',
  'confirm',
] as const;

export const RELATIONSHIP_TYPE = [
  'institution_to_person',
  'staff_to_person',
  'peer_to_person',
] as const;

// -----------------------------------------------------------------------------
// Channel & Voice
// -----------------------------------------------------------------------------

export const CHANNEL_FIT = [
  'email',
  'sms',
  'in_app',
  'chat',
  'call_script',
  'portal_content',
] as const;

export const VOICE = [
  'institutional',
  'advisor',
  'bursar',
  'financial_aid_counselor',
  'gift_officer',
  'student_ambassador',
] as const;

// -----------------------------------------------------------------------------
// Compliance & Risk
// -----------------------------------------------------------------------------

export const COMPLIANCE_RISK_LEVEL = ['low', 'medium', 'high'] as const;

export const PII_TIER = ['none', 'standard', 'sensitive'] as const;

export const CLAIM_CLASS = [
  'financial',
  'academic',
  'operational',
  'testimonial',
  'policy',
  'impact',
  'other',
] as const;

// -----------------------------------------------------------------------------
// Approval & Lifecycle
// -----------------------------------------------------------------------------

export const APPROVAL_STATE = [
  'draft',
  'in_review',
  'approved',
  'rejected',
] as const;

// -----------------------------------------------------------------------------
// Proof Block
// -----------------------------------------------------------------------------

export const PROOF_TYPE = [
  'impact',
  'stat',
  'testimonial',
  'policy',
  'deadline',
  'benefit',
] as const;

export const CLAIM_SUPPORT_LEVEL = [
  'verified',
  'internally_reported',
  'anecdotal',
] as const;

/** e.g. 90d, 365d, or evergreen */
export const FRESHNESS_WINDOW_PATTERN = /^(\d+d|evergreen)$/;

// -----------------------------------------------------------------------------
// Delivery Play
// -----------------------------------------------------------------------------

export const PLAY_CATEGORY = [
  'lifecycle_automation',
  'staff_assist',
  'portfolio_recommendation',
] as const;

export const TRIGGER_TYPE = [
  'event',
  'threshold',
  'schedule',
  'model_signal',
] as const;

export const CADENCE_POLICY = ['single', 'sequence', 'recurring'] as const;

// -----------------------------------------------------------------------------
// Zod Schemas (for validation)
// -----------------------------------------------------------------------------

export const DomainScopeSchema = z.enum(DOMAIN_SCOPE);
export const SubDomainScopeSchema = z.enum(SUB_DOMAIN_SCOPE);
export const MessageIntentSchema = z.enum(MESSAGE_INTENT);
export const RelationshipTypeSchema = z.enum(RELATIONSHIP_TYPE);
export const ChannelFitSchema = z.enum(CHANNEL_FIT);
export const VoiceSchema = z.enum(VOICE);
export const ComplianceRiskLevelSchema = z.enum(COMPLIANCE_RISK_LEVEL);
export const PiiTierSchema = z.enum(PII_TIER);
export const ClaimClassSchema = z.enum(CLAIM_CLASS);
export const ApprovalStateSchema = z.enum(APPROVAL_STATE);
export const ProofTypeSchema = z.enum(PROOF_TYPE);
export const ClaimSupportLevelSchema = z.enum(CLAIM_SUPPORT_LEVEL);
export const PlayCategorySchema = z.enum(PLAY_CATEGORY);
export const TriggerTypeSchema = z.enum(TRIGGER_TYPE);
export const CadencePolicySchema = z.enum(CADENCE_POLICY);

export const FreshnessWindowSchema = z
  .string()
  .regex(FRESHNESS_WINDOW_PATTERN, {
    message: 'freshness_window must be e.g. 90d, 365d, or evergreen',
  });
