/**
 * Delivery Play Schema
 *
 * Domain-specific bindings of narratives to triggers, cadence, and success events.
 * @see docs/prd/narrative-platform-prd-and-plan.md
 */
import { z } from 'zod';
export declare const DeliveryPlayEligibilitySchema: z.ZodObject<{
    narrativeIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    outcome: z.ZodOptional<z.ZodString>;
    moment: z.ZodOptional<z.ZodString>;
    segmentIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    outcome?: string | undefined;
    moment?: string | undefined;
    narrativeIds?: string[] | undefined;
    segmentIds?: string[] | undefined;
}, {
    outcome?: string | undefined;
    moment?: string | undefined;
    narrativeIds?: string[] | undefined;
    segmentIds?: string[] | undefined;
}>;
export declare const DeliveryPlaySuccessEventSchema: z.ZodObject<{
    type: z.ZodString;
    metric: z.ZodOptional<z.ZodString>;
    threshold: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: string;
    threshold?: number | undefined;
    metric?: string | undefined;
}, {
    type: string;
    threshold?: number | undefined;
    metric?: string | undefined;
}>;
export declare const DeliveryPlaySchema: z.ZodObject<{
    id: z.ZodString;
    workspace: z.ZodString;
    sub_workspace: z.ZodString;
    play_category: z.ZodEnum<["lifecycle_automation", "staff_assist", "portfolio_recommendation"]>;
    trigger_type: z.ZodEnum<["event", "threshold", "schedule", "model_signal"]>;
    cadence_policy: z.ZodEnum<["single", "sequence", "recurring"]>;
    eligibility: z.ZodObject<{
        narrativeIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        outcome: z.ZodOptional<z.ZodString>;
        moment: z.ZodOptional<z.ZodString>;
        segmentIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        outcome?: string | undefined;
        moment?: string | undefined;
        narrativeIds?: string[] | undefined;
        segmentIds?: string[] | undefined;
    }, {
        outcome?: string | undefined;
        moment?: string | undefined;
        narrativeIds?: string[] | undefined;
        segmentIds?: string[] | undefined;
    }>;
    success_events: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        metric: z.ZodOptional<z.ZodString>;
        threshold: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        threshold?: number | undefined;
        metric?: string | undefined;
    }, {
        type: string;
        threshold?: number | undefined;
        metric?: string | undefined;
    }>, "many">>;
    suppression_policy_id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    workspace: string;
    sub_workspace: string;
    play_category: "lifecycle_automation" | "staff_assist" | "portfolio_recommendation";
    trigger_type: "schedule" | "event" | "threshold" | "model_signal";
    cadence_policy: "single" | "sequence" | "recurring";
    eligibility: {
        outcome?: string | undefined;
        moment?: string | undefined;
        narrativeIds?: string[] | undefined;
        segmentIds?: string[] | undefined;
    };
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    success_events?: {
        type: string;
        threshold?: number | undefined;
        metric?: string | undefined;
    }[] | undefined;
    suppression_policy_id?: string | undefined;
}, {
    id: string;
    workspace: string;
    sub_workspace: string;
    play_category: "lifecycle_automation" | "staff_assist" | "portfolio_recommendation";
    trigger_type: "schedule" | "event" | "threshold" | "model_signal";
    cadence_policy: "single" | "sequence" | "recurring";
    eligibility: {
        outcome?: string | undefined;
        moment?: string | undefined;
        narrativeIds?: string[] | undefined;
        segmentIds?: string[] | undefined;
    };
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    success_events?: {
        type: string;
        threshold?: number | undefined;
        metric?: string | undefined;
    }[] | undefined;
    suppression_policy_id?: string | undefined;
}>;
export type DeliveryPlay = z.infer<typeof DeliveryPlaySchema>;
export type DeliveryPlayEligibility = z.infer<typeof DeliveryPlayEligibilitySchema>;
export type DeliveryPlaySuccessEvent = z.infer<typeof DeliveryPlaySuccessEventSchema>;
