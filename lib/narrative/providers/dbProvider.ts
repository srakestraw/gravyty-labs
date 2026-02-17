/**
 * Narrative Library DB provider - Prisma-backed persistence for assets, proof blocks, links, delivery plays.
 * Events, performance stats, and learning signals are stubbed (Phase 6/7).
 *
 * Requires narrative models in Prisma schema and `npx prisma generate` in packages/db (and migration applied).
 */

import { prisma } from '@/packages/db';

// Type assertion so this compiles when Prisma client was generated without narrative models.
// After running `cd packages/db && npx prisma generate`, the runtime client will have these delegates.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;
import type {
  NarrativeContext,
  NarrativeAssetRecord,
  NarrativeAssetInput,
  ListNarrativeAssetsOptions,
  ProofBlockRecord,
  ProofBlockInput,
  ListProofBlocksOptions,
  DeliveryPlayRecord,
  DeliveryPlayInput,
  EntityNarrativeContextInput,
  EntityNarrativeContext,
  RecommendOptions,
  RecommendResult,
  ComposeOptions,
  ComposeResult,
  NarrativeDeliveryEvent,
  ListEventsOptions,
  NarrativePerformanceStats,
  GetPerformanceStatsOptions,
  LearningSignal,
  NarrativeLibraryProvider,
} from '../types';
import { buildEntityNarrativeContext, contextToEmbeddingText } from '../context-builder';
import { embedText } from '../embedding';
import { narrativeMockProvider } from './mockProvider';

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

function mapContextToDomainScope(ctx: NarrativeContext): 'student_lifecycle' | 'advancement_giving' {
  return ctx.workspace === 'student_lifecycle_ai' ? 'student_lifecycle' : 'advancement_giving';
}

function assetToRecord(row: {
  id: string;
  workspace: string;
  domainScope: string;
  subDomainScope: string;
  outcome: string;
  moment: string;
  messageIntent: string;
  channelFit: string[];
  voice: string;
  complianceRiskLevel: string;
  piiTier: string;
  approvalState: string;
  relationshipType: string | null;
  contentRef: string | null;
  embedding: number[];
  createdAt: Date;
  updatedAt: Date;
  createdById: string | null;
  approvedById: string | null;
  modules?: { id: string; type: string; contentRef: string | null }[];
}): NarrativeAssetRecord {
  return {
    id: row.id,
    workspace: row.domainScope,
    domain_scope: row.domainScope as NarrativeAssetRecord['domain_scope'],
    sub_domain_scope: row.subDomainScope,
    outcome: row.outcome,
    moment: row.moment,
    message_intent: row.messageIntent,
    channel_fit: row.channelFit,
    voice: row.voice,
    compliance_risk_level: row.complianceRiskLevel as NarrativeAssetRecord['compliance_risk_level'],
    pii_tier: row.piiTier as NarrativeAssetRecord['pii_tier'],
    approval_state: row.approvalState as NarrativeAssetRecord['approval_state'],
    relationship_type: row.relationshipType ?? undefined,
    contentRef: row.contentRef ?? undefined,
    embedding: row.embedding?.length ? row.embedding : undefined,
    modules: row.modules?.map((m) => ({ id: m.id, type: m.type, contentRef: m.contentRef ?? undefined })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdById: row.createdById ?? undefined,
    approvedById: row.approvedById ?? undefined,
  };
}

function proofToRecord(row: {
  id: string;
  workspace: string;
  proofType: string;
  claimSupportLevel: string;
  claimClass: string;
  freshnessWindow: string;
  allowedVoice: string[];
  content: string;
  restrictedChannels: string[];
  createdAt: Date;
  updatedAt: Date;
}): ProofBlockRecord {
  return {
    id: row.id,
    workspace: row.workspace,
    proof_type: row.proofType,
    claim_support_level: row.claimSupportLevel,
    claim_class: row.claimClass,
    freshness_window: row.freshnessWindow,
    allowed_voice: row.allowedVoice,
    content: row.content,
    restricted_channels: row.restrictedChannels,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function playToRecord(row: {
  id: string;
  workspace: string;
  subWorkspace: string;
  playCategory: string;
  triggerType: string;
  cadencePolicy: string;
  suppressionPolicyId: string | null;
  eligibilityJson: unknown;
  successEventsJson: unknown;
  createdAt: Date;
  updatedAt: Date;
}): DeliveryPlayRecord {
  return {
    id: row.id,
    workspace: row.workspace,
    sub_workspace: row.subWorkspace,
    play_category: row.playCategory,
    trigger_type: row.triggerType,
    cadence_policy: row.cadencePolicy,
    suppression_policy_id: row.suppressionPolicyId ?? undefined,
    eligibility: (row.eligibilityJson as DeliveryPlayRecord['eligibility']) ?? undefined,
    success_events: (row.successEventsJson as DeliveryPlayRecord['success_events']) ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function createNarrativeDbProvider(): NarrativeLibraryProvider {
  return {
    async listNarrativeAssets(ctx, options = {}) {
      const domainScope = mapContextToDomainScope(ctx);
      const where: Record<string, unknown> = {
        domainScope,
        subDomainScope: ctx.sub_workspace,
      };
      if (options.approval_state) where.approvalState = options.approval_state;
      if (options.outcome) where.outcome = options.outcome;
      if (options.moment) where.moment = options.moment;
      if (options.sub_domain_scope) where.subDomainScope = options.sub_domain_scope;

      const rows = await db.narrativeAsset.findMany({
        where,
        include: { modules: true },
        orderBy: { updatedAt: 'desc' },
      });
      return rows.map(assetToRecord);
    },

    async getNarrativeAsset(ctx, id) {
      const domainScope = mapContextToDomainScope(ctx);
      const row = await db.narrativeAsset.findFirst({
        where: { id, domainScope, subDomainScope: ctx.sub_workspace },
        include: { modules: true },
      });
      return row ? assetToRecord(row) : null;
    },

    async createNarrativeAsset(ctx, data) {
      const domainScope = mapContextToDomainScope(ctx);
      const row = await db.narrativeAsset.create({
        data: {
          workspace: domainScope,
          domainScope,
          subDomainScope: data.sub_domain_scope,
          outcome: data.outcome,
          moment: data.moment,
          messageIntent: data.message_intent,
          channelFit: data.channel_fit,
          voice: data.voice,
          complianceRiskLevel: data.compliance_risk_level,
          piiTier: data.pii_tier,
          approvalState: 'draft',
          relationshipType: data.relationship_type ?? null,
          contentRef: data.contentRef ?? null,
          embedding: [],
          createdById: ctx.userId ?? null,
        },
        include: { modules: true },
      });
      return assetToRecord(row);
    },

    async updateNarrativeAsset(ctx, id, data) {
      const domainScope = mapContextToDomainScope(ctx);
      const existing = await db.narrativeAsset.findFirst({
        where: { id, domainScope, subDomainScope: ctx.sub_workspace },
      });
      if (!existing) throw new Error('Narrative asset not found');

      const row = await db.narrativeAsset.update({
        where: { id },
        data: {
          ...(data.sub_domain_scope != null && { subDomainScope: data.sub_domain_scope }),
          ...(data.outcome != null && { outcome: data.outcome }),
          ...(data.moment != null && { moment: data.moment }),
          ...(data.message_intent != null && { messageIntent: data.message_intent }),
          ...(data.channel_fit != null && { channelFit: data.channel_fit }),
          ...(data.voice != null && { voice: data.voice }),
          ...(data.compliance_risk_level != null && { complianceRiskLevel: data.compliance_risk_level }),
          ...(data.pii_tier != null && { piiTier: data.pii_tier }),
          ...(data.relationship_type !== undefined && { relationshipType: data.relationship_type ?? null }),
          ...(data.contentRef !== undefined && { contentRef: data.contentRef ?? null }),
        },
        include: { modules: true },
      });
      return assetToRecord(row);
    },

    async deleteNarrativeAsset(ctx, id) {
      const domainScope = mapContextToDomainScope(ctx);
      const existing = await db.narrativeAsset.findFirst({
        where: { id, domainScope, subDomainScope: ctx.sub_workspace },
      });
      if (!existing) throw new Error('Narrative asset not found');
      await db.narrativeAsset.delete({ where: { id } });
    },

    async submitForReview(ctx, id) {
      const domainScope = mapContextToDomainScope(ctx);
      const existing = await db.narrativeAsset.findFirst({
        where: { id, domainScope, subDomainScope: ctx.sub_workspace },
        include: { modules: true },
      });
      if (!existing) throw new Error('Narrative asset not found');
      if (existing.approvalState !== 'draft') throw new Error('Only draft assets can be submitted for review');

      const row = await db.narrativeAsset.update({
        where: { id },
        data: { approvalState: 'in_review' },
        include: { modules: true },
      });
      return assetToRecord(row);
    },

    async approve(ctx, id) {
      const domainScope = mapContextToDomainScope(ctx);
      const existing = await db.narrativeAsset.findFirst({
        where: { id, domainScope, subDomainScope: ctx.sub_workspace },
        include: { modules: true },
      });
      if (!existing) throw new Error('Narrative asset not found');
      if (existing.approvalState !== 'in_review') throw new Error('Only in_review assets can be approved');

      const row = await db.narrativeAsset.update({
        where: { id },
        data: { approvalState: 'approved', approvedById: ctx.userId ?? null },
        include: { modules: true },
      });
      return assetToRecord(row);
    },

    async reject(ctx, id) {
      const domainScope = mapContextToDomainScope(ctx);
      const existing = await db.narrativeAsset.findFirst({
        where: { id, domainScope, subDomainScope: ctx.sub_workspace },
        include: { modules: true },
      });
      if (!existing) throw new Error('Narrative asset not found');
      if (existing.approvalState !== 'in_review') throw new Error('Only in_review assets can be rejected');

      const row = await db.narrativeAsset.update({
        where: { id },
        data: { approvalState: 'rejected' },
        include: { modules: true },
      });
      return assetToRecord(row);
    },

    // Proof Blocks
    async listProofBlocks(ctx, options = {}) {
      const workspace = mapContextToDomainScope(ctx);
      const where: Record<string, unknown> = { workspace };
      if (options.claim_class) where.claimClass = options.claim_class;
      if (options.proof_type) where.proofType = options.proof_type;

      const rows = await db.proofBlock.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
      });
      return rows.map(proofToRecord);
    },

    async getProofBlock(ctx, id) {
      const workspace = mapContextToDomainScope(ctx);
      const row = await db.proofBlock.findFirst({ where: { id, workspace } });
      return row ? proofToRecord(row) : null;
    },

    async createProofBlock(ctx, data) {
      const workspace = mapContextToDomainScope(ctx);
      const row = await db.proofBlock.create({
        data: {
          workspace,
          proofType: data.proof_type,
          claimSupportLevel: data.claim_support_level,
          claimClass: data.claim_class,
          freshnessWindow: data.freshness_window,
          allowedVoice: data.allowed_voice,
          content: data.content,
          restrictedChannels: data.restricted_channels ?? [],
        },
      });
      return proofToRecord(row);
    },

    async updateProofBlock(ctx, id, data) {
      const workspace = mapContextToDomainScope(ctx);
      const existing = await db.proofBlock.findFirst({ where: { id, workspace } });
      if (!existing) throw new Error('Proof block not found');

      const row = await db.proofBlock.update({
        where: { id },
        data: {
          ...(data.proof_type != null && { proofType: data.proof_type }),
          ...(data.claim_support_level != null && { claimSupportLevel: data.claim_support_level }),
          ...(data.claim_class != null && { claimClass: data.claim_class }),
          ...(data.freshness_window != null && { freshnessWindow: data.freshness_window }),
          ...(data.allowed_voice != null && { allowedVoice: data.allowed_voice }),
          ...(data.content != null && { content: data.content }),
          ...(data.restricted_channels !== undefined && { restrictedChannels: data.restricted_channels ?? [] }),
        },
      });
      return proofToRecord(row);
    },

    async deleteProofBlock(ctx, id) {
      const workspace = mapContextToDomainScope(ctx);
      const existing = await db.proofBlock.findFirst({ where: { id, workspace } });
      if (!existing) throw new Error('Proof block not found');
      await db.proofBlock.delete({ where: { id } });
    },

    async linkProofToNarrative(ctx, narrativeAssetId, proofBlockId) {
      const domainScope = mapContextToDomainScope(ctx);
      const [asset, proof] = await Promise.all([
        db.narrativeAsset.findFirst({
          where: { id: narrativeAssetId, domainScope, subDomainScope: ctx.sub_workspace },
        }),
        db.proofBlock.findFirst({
          where: { id: proofBlockId, workspace: domainScope },
        }),
      ]);
      if (!asset) throw new Error('Narrative asset not found');
      if (!proof) throw new Error('Proof block not found');
      if (!proof.allowedVoice.includes(asset.voice)) {
        throw new Error(
          `Proof block does not allow voice "${asset.voice}". Allowed: ${proof.allowedVoice.join(', ')}`
        );
      }
      await db.narrativeProofLink.upsert({
        where: {
          narrativeAssetId_proofBlockId: { narrativeAssetId, proofBlockId },
        },
        create: { narrativeAssetId, proofBlockId },
        update: {},
      });
    },

    async unlinkProofFromNarrative(ctx, narrativeAssetId, proofBlockId) {
      const domainScope = mapContextToDomainScope(ctx);
      const asset = await db.narrativeAsset.findFirst({
        where: { id: narrativeAssetId, domainScope, subDomainScope: ctx.sub_workspace },
      });
      if (!asset) throw new Error('Narrative asset not found');

      await db.narrativeProofLink.deleteMany({
        where: { narrativeAssetId, proofBlockId },
      });
    },

    async listProofForNarrative(ctx, narrativeAssetId) {
      const domainScope = mapContextToDomainScope(ctx);
      const asset = await db.narrativeAsset.findFirst({
        where: { id: narrativeAssetId, domainScope, subDomainScope: ctx.sub_workspace },
      });
      if (!asset) return [];

      const links = await db.narrativeProofLink.findMany({
        where: { narrativeAssetId },
        include: { proofBlock: true },
      });
      return links.map((l: { proofBlock: Parameters<typeof proofToRecord>[0] }) => proofToRecord(l.proofBlock));
    },

    // Delivery Plays
    async listDeliveryPlays(ctx) {
      const workspace = mapContextToDomainScope(ctx);
      const rows = await db.deliveryPlay.findMany({
        where: { workspace, subWorkspace: ctx.sub_workspace },
        orderBy: { updatedAt: 'desc' },
      });
      return rows.map(playToRecord);
    },

    async createDeliveryPlay(ctx, data) {
      const workspace = mapContextToDomainScope(ctx);
      const row = await db.deliveryPlay.create({
        data: {
          workspace,
          subWorkspace: ctx.sub_workspace,
          playCategory: data.play_category,
          triggerType: data.trigger_type,
          cadencePolicy: data.cadence_policy,
          suppressionPolicyId: data.suppression_policy_id ?? null,
          eligibilityJson: data.eligibility ?? null,
          successEventsJson: data.success_events ?? null,
        },
      });
      return playToRecord(row);
    },

    // Phase 3: context and embedding (stateless)
    async buildEntityNarrativeContext(ctx, input): Promise<EntityNarrativeContext> {
      const workspace = mapContextToDomainScope(ctx);
      return buildEntityNarrativeContext(workspace, ctx.sub_workspace, input);
    },
    async getContextEmbedding(ctx, input) {
      const built = await this.buildEntityNarrativeContext(ctx, input);
      const text = contextToEmbeddingText(built);
      return embedText(text);
    },

    // Phase 4–5: recommend and compose using DB data
    async recommend(ctx, options = {}): Promise<RecommendResult> {
      const limit = options.limit ?? 10;
      const recentSet = new Set(options.recent_narrative_ids ?? []);
      let candidates = await this.listNarrativeAssets(ctx, { approval_state: 'approved' });
      if (options.channel) candidates = candidates.filter((a) => a.channel_fit.includes(options.channel!));
      if (options.voice) candidates = candidates.filter((a) => a.voice === options.voice);
      if (options.entity_context_input?.outcome)
        candidates = candidates.filter((a) => a.outcome === options.entity_context_input!.outcome);
      if (options.entity_context_input?.moment)
        candidates = candidates.filter((a) => a.moment === options.entity_context_input!.moment);
      if (options.entity_context_input?.message_intent)
        candidates = candidates.filter((a) => a.message_intent === options.entity_context_input!.message_intent);

      let contextEmbedding: number[] | null = null;
      if (options.entity_context_input) contextEmbedding = await this.getContextEmbedding(ctx, options.entity_context_input);

      const scored = candidates.map((asset) => {
        let score = 0.5;
        if (contextEmbedding && asset.embedding?.length) score = 0.5 + 0.5 * cosineSimilarity(contextEmbedding, asset.embedding);
        if (recentSet.has(asset.id)) score -= 0.3;
        return { asset, score };
      });
      scored.sort((a, b) => b.score - a.score);
      return { narrative_assets: scored.slice(0, limit).map((s) => s.asset) };
    },

    async compose(ctx, options): Promise<ComposeResult> {
      const asset = await this.getNarrativeAsset(ctx, options.narrative_asset_id);
      if (!asset) throw new Error('Narrative asset not found');
      if (asset.approval_state !== 'approved') throw new Error('Only approved narratives can be composed');
      if (options.voice && asset.voice !== options.voice)
        throw new Error(`Voice "${options.voice}" does not match narrative voice "${asset.voice}"`);

      let proofList = await this.listProofForNarrative(ctx, options.narrative_asset_id);
      if (options.claim_class) proofList = proofList.filter((p) => p.claim_class === options.claim_class);
      if (options.channel) proofList = proofList.filter((p) => !p.restricted_channels?.includes(options.channel!));

      const narrativePart = asset.contentRef
        ? `[Content: ${asset.contentRef}]`
        : `[Narrative: ${asset.outcome} / ${asset.moment} – ${asset.message_intent}]`;
      const proofSnippets = proofList.map((p) => p.content.slice(0, 200) + (p.content.length > 200 ? '…' : ''));
      const body = [narrativePart, ...proofSnippets].filter(Boolean).join('\n\n');
      return {
        narrative_asset_id: asset.id,
        voice: asset.voice,
        body,
        proof_used: proofList.map((p) => ({
          proof_block_id: p.id,
          claim_class: p.claim_class,
          content: p.content.slice(0, 200) + (p.content.length > 200 ? '…' : ''),
        })),
        guardrails_ok: true,
        confidence: 1,
      };
    },

    // Phase 6–7: events, stats, signals – delegate to mock until we add DB tables
    async recordEvent(ctx, event): Promise<void> {
      return narrativeMockProvider.recordEvent(ctx, event);
    },
    async listEvents(ctx, options): Promise<NarrativeDeliveryEvent[]> {
      return narrativeMockProvider.listEvents(ctx, options);
    },
    async getPerformanceStats(ctx, options): Promise<NarrativePerformanceStats[]> {
      return narrativeMockProvider.getPerformanceStats(ctx, options);
    },
    async getLearningSignals(ctx, options): Promise<LearningSignal[]> {
      return narrativeMockProvider.getLearningSignals(ctx, options);
    },
  };
}
