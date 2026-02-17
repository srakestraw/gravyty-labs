/**
 * Proof Block Schema
 *
 * Reusable evidence objects with claim classes and compliance rules.
 * @see docs/prd/narrative-platform-prd-and-plan.md
 */
import { z } from 'zod';
export declare const ProofBlockSchema: z.ZodObject<{
    id: z.ZodString;
    workspace: z.ZodString;
    proof_type: z.ZodEnum<["impact", "stat", "testimonial", "policy", "deadline", "benefit"]>;
    claim_support_level: z.ZodEnum<["verified", "internally_reported", "anecdotal"]>;
    claim_class: z.ZodEnum<["financial", "academic", "operational", "testimonial", "policy", "impact", "other"]>;
    freshness_window: z.ZodString;
    allowed_voice: z.ZodArray<z.ZodEnum<["institutional", "advisor", "bursar", "financial_aid_counselor", "gift_officer", "student_ambassador"]>, "many">;
    content: z.ZodString;
    restricted_channels: z.ZodOptional<z.ZodArray<z.ZodEnum<["email", "sms", "in_app", "chat", "call_script", "portal_content"]>, "many">>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    workspace: string;
    proof_type: "testimonial" | "policy" | "impact" | "stat" | "deadline" | "benefit";
    claim_support_level: "verified" | "internally_reported" | "anecdotal";
    claim_class: "financial" | "academic" | "operational" | "testimonial" | "policy" | "impact" | "other";
    freshness_window: string;
    allowed_voice: ("bursar" | "institutional" | "advisor" | "financial_aid_counselor" | "gift_officer" | "student_ambassador")[];
    content: string;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    restricted_channels?: ("email" | "sms" | "in_app" | "chat" | "call_script" | "portal_content")[] | undefined;
}, {
    id: string;
    workspace: string;
    proof_type: "testimonial" | "policy" | "impact" | "stat" | "deadline" | "benefit";
    claim_support_level: "verified" | "internally_reported" | "anecdotal";
    claim_class: "financial" | "academic" | "operational" | "testimonial" | "policy" | "impact" | "other";
    freshness_window: string;
    allowed_voice: ("bursar" | "institutional" | "advisor" | "financial_aid_counselor" | "gift_officer" | "student_ambassador")[];
    content: string;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    restricted_channels?: ("email" | "sms" | "in_app" | "chat" | "call_script" | "portal_content")[] | undefined;
}>;
export type ProofBlock = z.infer<typeof ProofBlockSchema>;
