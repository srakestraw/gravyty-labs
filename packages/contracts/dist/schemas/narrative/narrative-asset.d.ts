/**
 * Narrative Asset Schema
 *
 * Required structure for governance, RBAC, approvals, and compliance.
 * @see docs/prd/narrative-platform-prd-and-plan.md
 */
import { z } from 'zod';
/** Outcome + Moment are taxonomy values (enums) - placeholder until taxonomy is defined */
export declare const OutcomeSchema: z.ZodString;
export declare const MomentSchema: z.ZodString;
/** Content/module reference - narrative body or module IDs */
export declare const NarrativeModuleSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["opening", "body", "proof_slot", "cta", "closing"]>;
    contentRef: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "opening" | "body" | "proof_slot" | "cta" | "closing";
    contentRef?: string | undefined;
}, {
    id: string;
    type: "opening" | "body" | "proof_slot" | "cta" | "closing";
    contentRef?: string | undefined;
}>;
export declare const NarrativeAssetSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    workspace: z.ZodString;
    domain_scope: z.ZodEnum<["student_lifecycle", "advancement_giving"]>;
    sub_domain_scope: z.ZodEnum<["admissions", "registrar", "financial_aid", "bursar", "housing", "student_success", "pipeline_intelligence", "giving_intelligence", "stewardship"]>;
    outcome: z.ZodString;
    moment: z.ZodString;
    message_intent: z.ZodEnum<["nudge", "reminder", "explain", "resolve", "ask", "thank", "update", "confirm"]>;
    channel_fit: z.ZodArray<z.ZodEnum<["email", "sms", "in_app", "chat", "call_script", "portal_content"]>, "many">;
    voice: z.ZodEnum<["institutional", "advisor", "bursar", "financial_aid_counselor", "gift_officer", "student_ambassador"]>;
    compliance_risk_level: z.ZodEnum<["low", "medium", "high"]>;
    pii_tier: z.ZodEnum<["none", "standard", "sensitive"]>;
    approval_state: z.ZodEnum<["draft", "in_review", "approved", "rejected"]>;
    relationship_type: z.ZodOptional<z.ZodEnum<["institution_to_person", "staff_to_person", "peer_to_person"]>>;
    modules: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["opening", "body", "proof_slot", "cta", "closing"]>;
        contentRef: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "opening" | "body" | "proof_slot" | "cta" | "closing";
        contentRef?: string | undefined;
    }, {
        id: string;
        type: "opening" | "body" | "proof_slot" | "cta" | "closing";
        contentRef?: string | undefined;
    }>, "many">>;
    contentRef: z.ZodOptional<z.ZodString>;
    embedding: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
    createdById: z.ZodOptional<z.ZodString>;
    approvedById: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    workspace: string;
    domain_scope: "student_lifecycle" | "advancement_giving";
    sub_domain_scope: "admissions" | "registrar" | "financial_aid" | "bursar" | "housing" | "student_success" | "pipeline_intelligence" | "giving_intelligence" | "stewardship";
    outcome: string;
    moment: string;
    message_intent: "nudge" | "reminder" | "explain" | "resolve" | "ask" | "thank" | "update" | "confirm";
    channel_fit: ("email" | "sms" | "in_app" | "chat" | "call_script" | "portal_content")[];
    voice: "bursar" | "institutional" | "advisor" | "financial_aid_counselor" | "gift_officer" | "student_ambassador";
    compliance_risk_level: "low" | "medium" | "high";
    pii_tier: "none" | "standard" | "sensitive";
    approval_state: "draft" | "in_review" | "approved" | "rejected";
    contentRef?: string | undefined;
    relationship_type?: "institution_to_person" | "staff_to_person" | "peer_to_person" | undefined;
    modules?: {
        id: string;
        type: "opening" | "body" | "proof_slot" | "cta" | "closing";
        contentRef?: string | undefined;
    }[] | undefined;
    embedding?: number[] | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    createdById?: string | undefined;
    approvedById?: string | undefined;
}, {
    id: string;
    workspace: string;
    domain_scope: "student_lifecycle" | "advancement_giving";
    sub_domain_scope: "admissions" | "registrar" | "financial_aid" | "bursar" | "housing" | "student_success" | "pipeline_intelligence" | "giving_intelligence" | "stewardship";
    outcome: string;
    moment: string;
    message_intent: "nudge" | "reminder" | "explain" | "resolve" | "ask" | "thank" | "update" | "confirm";
    channel_fit: ("email" | "sms" | "in_app" | "chat" | "call_script" | "portal_content")[];
    voice: "bursar" | "institutional" | "advisor" | "financial_aid_counselor" | "gift_officer" | "student_ambassador";
    compliance_risk_level: "low" | "medium" | "high";
    pii_tier: "none" | "standard" | "sensitive";
    approval_state: "draft" | "in_review" | "approved" | "rejected";
    contentRef?: string | undefined;
    relationship_type?: "institution_to_person" | "staff_to_person" | "peer_to_person" | undefined;
    modules?: {
        id: string;
        type: "opening" | "body" | "proof_slot" | "cta" | "closing";
        contentRef?: string | undefined;
    }[] | undefined;
    embedding?: number[] | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    createdById?: string | undefined;
    approvedById?: string | undefined;
}>, {
    id: string;
    workspace: string;
    domain_scope: "student_lifecycle" | "advancement_giving";
    sub_domain_scope: "admissions" | "registrar" | "financial_aid" | "bursar" | "housing" | "student_success" | "pipeline_intelligence" | "giving_intelligence" | "stewardship";
    outcome: string;
    moment: string;
    message_intent: "nudge" | "reminder" | "explain" | "resolve" | "ask" | "thank" | "update" | "confirm";
    channel_fit: ("email" | "sms" | "in_app" | "chat" | "call_script" | "portal_content")[];
    voice: "bursar" | "institutional" | "advisor" | "financial_aid_counselor" | "gift_officer" | "student_ambassador";
    compliance_risk_level: "low" | "medium" | "high";
    pii_tier: "none" | "standard" | "sensitive";
    approval_state: "draft" | "in_review" | "approved" | "rejected";
    contentRef?: string | undefined;
    relationship_type?: "institution_to_person" | "staff_to_person" | "peer_to_person" | undefined;
    modules?: {
        id: string;
        type: "opening" | "body" | "proof_slot" | "cta" | "closing";
        contentRef?: string | undefined;
    }[] | undefined;
    embedding?: number[] | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    createdById?: string | undefined;
    approvedById?: string | undefined;
}, {
    id: string;
    workspace: string;
    domain_scope: "student_lifecycle" | "advancement_giving";
    sub_domain_scope: "admissions" | "registrar" | "financial_aid" | "bursar" | "housing" | "student_success" | "pipeline_intelligence" | "giving_intelligence" | "stewardship";
    outcome: string;
    moment: string;
    message_intent: "nudge" | "reminder" | "explain" | "resolve" | "ask" | "thank" | "update" | "confirm";
    channel_fit: ("email" | "sms" | "in_app" | "chat" | "call_script" | "portal_content")[];
    voice: "bursar" | "institutional" | "advisor" | "financial_aid_counselor" | "gift_officer" | "student_ambassador";
    compliance_risk_level: "low" | "medium" | "high";
    pii_tier: "none" | "standard" | "sensitive";
    approval_state: "draft" | "in_review" | "approved" | "rejected";
    contentRef?: string | undefined;
    relationship_type?: "institution_to_person" | "staff_to_person" | "peer_to_person" | undefined;
    modules?: {
        id: string;
        type: "opening" | "body" | "proof_slot" | "cta" | "closing";
        contentRef?: string | undefined;
    }[] | undefined;
    embedding?: number[] | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    createdById?: string | undefined;
    approvedById?: string | undefined;
}>;
export type NarrativeAsset = z.infer<typeof NarrativeAssetSchema>;
export type NarrativeModule = z.infer<typeof NarrativeModuleSchema>;
