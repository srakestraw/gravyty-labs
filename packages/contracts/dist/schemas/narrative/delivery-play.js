"use strict";
/**
 * Delivery Play Schema
 *
 * Domain-specific bindings of narratives to triggers, cadence, and success events.
 * @see docs/prd/narrative-platform-prd-and-plan.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryPlaySchema = exports.DeliveryPlaySuccessEventSchema = exports.DeliveryPlayEligibilitySchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("./enums");
exports.DeliveryPlayEligibilitySchema = zod_1.z.object({
    narrativeIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    outcome: zod_1.z.string().optional(),
    moment: zod_1.z.string().optional(),
    segmentIds: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.DeliveryPlaySuccessEventSchema = zod_1.z.object({
    type: zod_1.z.string(),
    metric: zod_1.z.string().optional(),
    threshold: zod_1.z.number().optional(),
});
exports.DeliveryPlaySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    workspace: zod_1.z.string().min(1),
    sub_workspace: zod_1.z.string().min(1),
    play_category: enums_1.PlayCategorySchema,
    trigger_type: enums_1.TriggerTypeSchema,
    cadence_policy: enums_1.CadencePolicySchema,
    eligibility: exports.DeliveryPlayEligibilitySchema,
    success_events: zod_1.z.array(exports.DeliveryPlaySuccessEventSchema).optional(),
    suppression_policy_id: zod_1.z.string().uuid().optional(),
    createdAt: zod_1.z.string().datetime().optional(),
    updatedAt: zod_1.z.string().datetime().optional(),
});
