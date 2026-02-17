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
export declare const DOMAIN_SCOPE: readonly ["student_lifecycle", "advancement_giving"];
export declare const SUB_DOMAIN_SCOPE_STUDENT: readonly ["admissions", "registrar", "financial_aid", "bursar", "housing", "student_success"];
export declare const SUB_DOMAIN_SCOPE_ADVANCEMENT: readonly ["pipeline_intelligence", "giving_intelligence", "stewardship"];
export declare const SUB_DOMAIN_SCOPE: readonly ["admissions", "registrar", "financial_aid", "bursar", "housing", "student_success", "pipeline_intelligence", "giving_intelligence", "stewardship"];
export declare const MESSAGE_INTENT: readonly ["nudge", "reminder", "explain", "resolve", "ask", "thank", "update", "confirm"];
export declare const RELATIONSHIP_TYPE: readonly ["institution_to_person", "staff_to_person", "peer_to_person"];
export declare const CHANNEL_FIT: readonly ["email", "sms", "in_app", "chat", "call_script", "portal_content"];
export declare const VOICE: readonly ["institutional", "advisor", "bursar", "financial_aid_counselor", "gift_officer", "student_ambassador"];
export declare const COMPLIANCE_RISK_LEVEL: readonly ["low", "medium", "high"];
export declare const PII_TIER: readonly ["none", "standard", "sensitive"];
export declare const CLAIM_CLASS: readonly ["financial", "academic", "operational", "testimonial", "policy", "impact", "other"];
export declare const APPROVAL_STATE: readonly ["draft", "in_review", "approved", "rejected"];
export declare const PROOF_TYPE: readonly ["impact", "stat", "testimonial", "policy", "deadline", "benefit"];
export declare const CLAIM_SUPPORT_LEVEL: readonly ["verified", "internally_reported", "anecdotal"];
/** e.g. 90d, 365d, or evergreen */
export declare const FRESHNESS_WINDOW_PATTERN: RegExp;
export declare const PLAY_CATEGORY: readonly ["lifecycle_automation", "staff_assist", "portfolio_recommendation"];
export declare const TRIGGER_TYPE: readonly ["event", "threshold", "schedule", "model_signal"];
export declare const CADENCE_POLICY: readonly ["single", "sequence", "recurring"];
export declare const DomainScopeSchema: z.ZodEnum<["student_lifecycle", "advancement_giving"]>;
export declare const SubDomainScopeSchema: z.ZodEnum<["admissions", "registrar", "financial_aid", "bursar", "housing", "student_success", "pipeline_intelligence", "giving_intelligence", "stewardship"]>;
export declare const MessageIntentSchema: z.ZodEnum<["nudge", "reminder", "explain", "resolve", "ask", "thank", "update", "confirm"]>;
export declare const RelationshipTypeSchema: z.ZodEnum<["institution_to_person", "staff_to_person", "peer_to_person"]>;
export declare const ChannelFitSchema: z.ZodEnum<["email", "sms", "in_app", "chat", "call_script", "portal_content"]>;
export declare const VoiceSchema: z.ZodEnum<["institutional", "advisor", "bursar", "financial_aid_counselor", "gift_officer", "student_ambassador"]>;
export declare const ComplianceRiskLevelSchema: z.ZodEnum<["low", "medium", "high"]>;
export declare const PiiTierSchema: z.ZodEnum<["none", "standard", "sensitive"]>;
export declare const ClaimClassSchema: z.ZodEnum<["financial", "academic", "operational", "testimonial", "policy", "impact", "other"]>;
export declare const ApprovalStateSchema: z.ZodEnum<["draft", "in_review", "approved", "rejected"]>;
export declare const ProofTypeSchema: z.ZodEnum<["impact", "stat", "testimonial", "policy", "deadline", "benefit"]>;
export declare const ClaimSupportLevelSchema: z.ZodEnum<["verified", "internally_reported", "anecdotal"]>;
export declare const PlayCategorySchema: z.ZodEnum<["lifecycle_automation", "staff_assist", "portfolio_recommendation"]>;
export declare const TriggerTypeSchema: z.ZodEnum<["event", "threshold", "schedule", "model_signal"]>;
export declare const CadencePolicySchema: z.ZodEnum<["single", "sequence", "recurring"]>;
export declare const FreshnessWindowSchema: z.ZodString;
