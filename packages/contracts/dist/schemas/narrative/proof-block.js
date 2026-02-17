"use strict";
/**
 * Proof Block Schema
 *
 * Reusable evidence objects with claim classes and compliance rules.
 * @see docs/prd/narrative-platform-prd-and-plan.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProofBlockSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("./enums");
exports.ProofBlockSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    workspace: zod_1.z.string().min(1),
    proof_type: enums_1.ProofTypeSchema,
    claim_support_level: enums_1.ClaimSupportLevelSchema,
    claim_class: enums_1.ClaimClassSchema,
    freshness_window: enums_1.FreshnessWindowSchema,
    allowed_voice: zod_1.z.array(enums_1.VoiceSchema).min(1),
    content: zod_1.z.string().min(1),
    restricted_channels: zod_1.z.array(enums_1.ChannelFitSchema).optional(),
    createdAt: zod_1.z.string().datetime().optional(),
    updatedAt: zod_1.z.string().datetime().optional(),
});
