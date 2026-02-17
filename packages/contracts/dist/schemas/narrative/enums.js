"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreshnessWindowSchema = exports.CadencePolicySchema = exports.TriggerTypeSchema = exports.PlayCategorySchema = exports.ClaimSupportLevelSchema = exports.ProofTypeSchema = exports.ApprovalStateSchema = exports.ClaimClassSchema = exports.PiiTierSchema = exports.ComplianceRiskLevelSchema = exports.VoiceSchema = exports.ChannelFitSchema = exports.RelationshipTypeSchema = exports.MessageIntentSchema = exports.SubDomainScopeSchema = exports.DomainScopeSchema = exports.CADENCE_POLICY = exports.TRIGGER_TYPE = exports.PLAY_CATEGORY = exports.FRESHNESS_WINDOW_PATTERN = exports.CLAIM_SUPPORT_LEVEL = exports.PROOF_TYPE = exports.APPROVAL_STATE = exports.CLAIM_CLASS = exports.PII_TIER = exports.COMPLIANCE_RISK_LEVEL = exports.VOICE = exports.CHANNEL_FIT = exports.RELATIONSHIP_TYPE = exports.MESSAGE_INTENT = exports.SUB_DOMAIN_SCOPE = exports.SUB_DOMAIN_SCOPE_ADVANCEMENT = exports.SUB_DOMAIN_SCOPE_STUDENT = exports.DOMAIN_SCOPE = void 0;
const zod_1 = require("zod");
// -----------------------------------------------------------------------------
// Domain & Scope
// -----------------------------------------------------------------------------
exports.DOMAIN_SCOPE = [
    'student_lifecycle',
    'advancement_giving',
];
exports.SUB_DOMAIN_SCOPE_STUDENT = [
    'admissions',
    'registrar',
    'financial_aid',
    'bursar',
    'housing',
    'student_success',
];
exports.SUB_DOMAIN_SCOPE_ADVANCEMENT = [
    'pipeline_intelligence',
    'giving_intelligence',
    'stewardship',
];
exports.SUB_DOMAIN_SCOPE = [
    ...exports.SUB_DOMAIN_SCOPE_STUDENT,
    ...exports.SUB_DOMAIN_SCOPE_ADVANCEMENT,
];
// -----------------------------------------------------------------------------
// Message Intent & Relationship
// -----------------------------------------------------------------------------
exports.MESSAGE_INTENT = [
    'nudge',
    'reminder',
    'explain',
    'resolve',
    'ask',
    'thank',
    'update',
    'confirm',
];
exports.RELATIONSHIP_TYPE = [
    'institution_to_person',
    'staff_to_person',
    'peer_to_person',
];
// -----------------------------------------------------------------------------
// Channel & Voice
// -----------------------------------------------------------------------------
exports.CHANNEL_FIT = [
    'email',
    'sms',
    'in_app',
    'chat',
    'call_script',
    'portal_content',
];
exports.VOICE = [
    'institutional',
    'advisor',
    'bursar',
    'financial_aid_counselor',
    'gift_officer',
    'student_ambassador',
];
// -----------------------------------------------------------------------------
// Compliance & Risk
// -----------------------------------------------------------------------------
exports.COMPLIANCE_RISK_LEVEL = ['low', 'medium', 'high'];
exports.PII_TIER = ['none', 'standard', 'sensitive'];
exports.CLAIM_CLASS = [
    'financial',
    'academic',
    'operational',
    'testimonial',
    'policy',
    'impact',
    'other',
];
// -----------------------------------------------------------------------------
// Approval & Lifecycle
// -----------------------------------------------------------------------------
exports.APPROVAL_STATE = [
    'draft',
    'in_review',
    'approved',
    'rejected',
];
// -----------------------------------------------------------------------------
// Proof Block
// -----------------------------------------------------------------------------
exports.PROOF_TYPE = [
    'impact',
    'stat',
    'testimonial',
    'policy',
    'deadline',
    'benefit',
];
exports.CLAIM_SUPPORT_LEVEL = [
    'verified',
    'internally_reported',
    'anecdotal',
];
/** e.g. 90d, 365d, or evergreen */
exports.FRESHNESS_WINDOW_PATTERN = /^(\d+d|evergreen)$/;
// -----------------------------------------------------------------------------
// Delivery Play
// -----------------------------------------------------------------------------
exports.PLAY_CATEGORY = [
    'lifecycle_automation',
    'staff_assist',
    'portfolio_recommendation',
];
exports.TRIGGER_TYPE = [
    'event',
    'threshold',
    'schedule',
    'model_signal',
];
exports.CADENCE_POLICY = ['single', 'sequence', 'recurring'];
// -----------------------------------------------------------------------------
// Zod Schemas (for validation)
// -----------------------------------------------------------------------------
exports.DomainScopeSchema = zod_1.z.enum(exports.DOMAIN_SCOPE);
exports.SubDomainScopeSchema = zod_1.z.enum(exports.SUB_DOMAIN_SCOPE);
exports.MessageIntentSchema = zod_1.z.enum(exports.MESSAGE_INTENT);
exports.RelationshipTypeSchema = zod_1.z.enum(exports.RELATIONSHIP_TYPE);
exports.ChannelFitSchema = zod_1.z.enum(exports.CHANNEL_FIT);
exports.VoiceSchema = zod_1.z.enum(exports.VOICE);
exports.ComplianceRiskLevelSchema = zod_1.z.enum(exports.COMPLIANCE_RISK_LEVEL);
exports.PiiTierSchema = zod_1.z.enum(exports.PII_TIER);
exports.ClaimClassSchema = zod_1.z.enum(exports.CLAIM_CLASS);
exports.ApprovalStateSchema = zod_1.z.enum(exports.APPROVAL_STATE);
exports.ProofTypeSchema = zod_1.z.enum(exports.PROOF_TYPE);
exports.ClaimSupportLevelSchema = zod_1.z.enum(exports.CLAIM_SUPPORT_LEVEL);
exports.PlayCategorySchema = zod_1.z.enum(exports.PLAY_CATEGORY);
exports.TriggerTypeSchema = zod_1.z.enum(exports.TRIGGER_TYPE);
exports.CadencePolicySchema = zod_1.z.enum(exports.CADENCE_POLICY);
exports.FreshnessWindowSchema = zod_1.z
    .string()
    .regex(exports.FRESHNESS_WINDOW_PATTERN, {
    message: 'freshness_window must be e.g. 90d, 365d, or evergreen',
});
