"use strict";
/**
 * Narrative Asset Schema
 *
 * Required structure for governance, RBAC, approvals, and compliance.
 * @see docs/prd/narrative-platform-prd-and-plan.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NarrativeAssetSchema = exports.NarrativeModuleSchema = exports.MomentSchema = exports.OutcomeSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("./enums");
/** Outcome + Moment are taxonomy values (enums) - placeholder until taxonomy is defined */
exports.OutcomeSchema = zod_1.z.string().min(1);
exports.MomentSchema = zod_1.z.string().min(1);
/** Content/module reference - narrative body or module IDs */
exports.NarrativeModuleSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['opening', 'body', 'proof_slot', 'cta', 'closing']),
    contentRef: zod_1.z.string().optional(),
});
exports.NarrativeAssetSchema = zod_1.z
    .object({
    id: zod_1.z.string().uuid(),
    workspace: zod_1.z.string().min(1),
    domain_scope: enums_1.DomainScopeSchema,
    sub_domain_scope: enums_1.SubDomainScopeSchema,
    outcome: exports.OutcomeSchema,
    moment: exports.MomentSchema,
    message_intent: enums_1.MessageIntentSchema,
    channel_fit: zod_1.z.array(enums_1.ChannelFitSchema).min(1),
    voice: enums_1.VoiceSchema,
    compliance_risk_level: enums_1.ComplianceRiskLevelSchema,
    pii_tier: enums_1.PiiTierSchema,
    approval_state: enums_1.ApprovalStateSchema,
    relationship_type: enums_1.RelationshipTypeSchema.optional(),
    modules: zod_1.z.array(exports.NarrativeModuleSchema).optional(),
    contentRef: zod_1.z.string().optional(),
    embedding: zod_1.z.array(zod_1.z.number()).optional(),
    createdAt: zod_1.z.string().datetime().optional(),
    updatedAt: zod_1.z.string().datetime().optional(),
    createdById: zod_1.z.string().uuid().optional(),
    approvedById: zod_1.z.string().uuid().optional(),
})
    .refine((data) => {
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
}, { message: 'domain_scope and sub_domain_scope must be consistent' });
