/**
 * Mock Narrative Library provider - in-memory CRUD, approvals, proof blocks, and linking.
 * Workspace- and sub_workspace-scoped filtering. Claim enforcement on link (voice in allowed_voice).
 */

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
import type { NarrativeSeedFixture } from '../seed/types';
import { buildEntityNarrativeContext, contextToEmbeddingText } from '../context-builder';
import { embedText } from '../embedding';

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

const store: NarrativeAssetRecord[] = [];
const proofStore: ProofBlockRecord[] = [];
const linkStore: { narrativeAssetId: string; proofBlockId: string }[] = [];
const eventStore: NarrativeDeliveryEvent[] = [];
const deliveryPlayStore: DeliveryPlayRecord[] = [];

/** Map fixture workspace label to record workspace (domain scope). */
function fixtureWorkspaceToRecord(fixtureWorkspace?: string): string {
  if (fixtureWorkspace === 'advancement_giving_intelligence') return 'advancement_giving';
  if (fixtureWorkspace === 'student_lifecycle_ai') return 'student_lifecycle';
  return fixtureWorkspace ?? 'advancement_giving';
}

/**
 * Seed the in-memory mock store from a fixture (e.g. UNC narrative_messaging_unc.json).
 * Clears existing narrative/proof/play/event data, then loads fixture.
 * Call when SEED_NARRATIVE_UNC=true (or similar) on app start.
 */
export function seedFromFixture(fixture: NarrativeSeedFixture): void {
  const meta = fixture._meta ?? {};
  const workspaceRecord = fixtureWorkspaceToRecord(meta.workspace);
  const subWorkspace = meta.sub_workspace ?? 'pipeline_intelligence';
  const nowIso = new Date().toISOString();

  store.length = 0;
  proofStore.length = 0;
  linkStore.length = 0;
  deliveryPlayStore.length = 0;
  eventStore.length = 0;

  for (const n of fixture.narratives) {
    const modules = (n.modules ?? []).map((m) => ({
      id: m.id,
      type: m.type,
      contentRef: m.contentRef ?? undefined,
    }));
    const asset: NarrativeAssetRecord = {
      id: n.id,
      workspace: workspaceRecord,
      domain_scope: n.domain_scope as NarrativeAssetRecord['domain_scope'],
      sub_domain_scope: n.sub_domain_scope,
      outcome: n.outcome,
      moment: n.moment,
      message_intent: n.message_intent,
      channel_fit: n.channel_fit,
      voice: n.voice,
      compliance_risk_level: n.compliance_risk_level as NarrativeAssetRecord['compliance_risk_level'],
      pii_tier: n.pii_tier as NarrativeAssetRecord['pii_tier'],
      approval_state: n.approval_state as NarrativeAssetRecord['approval_state'],
      relationship_type: n.relationship_type,
      contentRef: n.contentRef,
      modules: modules.length ? modules : undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    store.push(asset);
  }

  for (const p of fixture.proof_blocks) {
    const proof: ProofBlockRecord = {
      id: p.id,
      workspace: workspaceRecord,
      proof_type: p.proof_type,
      claim_support_level: p.claim_support_level,
      claim_class: p.claim_class,
      freshness_window: p.freshness_window,
      allowed_voice: p.allowed_voice,
      content: p.content,
      restricted_channels: p.restricted_channels ?? [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    proofStore.push(proof);
  }

  for (const link of fixture.narrative_proof_links) {
    linkStore.push({
      narrativeAssetId: link.narrative_asset_id,
      proofBlockId: link.proof_block_id,
    });
  }

  for (const dp of fixture.delivery_plays) {
    const play: DeliveryPlayRecord = {
      id: dp.id,
      workspace: workspaceRecord,
      sub_workspace: subWorkspace,
      play_category: dp.play_category,
      trigger_type: dp.trigger_type,
      cadence_policy: dp.cadence_policy,
      eligibility: dp.eligibility,
      success_events: dp.success_events,
      suppression_policy_id: undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    deliveryPlayStore.push(play);
  }

  if (fixture.performance?.per_narrative) {
    const playId = fixture.delivery_plays[0]?.id ?? 'seed-play';
    const baseTime = Date.now() - 30 * 24 * 60 * 60 * 1000;
    for (const row of fixture.performance.per_narrative) {
      for (let i = 0; i < row.delivered; i++) {
        eventStore.push({
          workspace: workspaceRecord,
          sub_workspace: subWorkspace,
          play_id: playId,
          event_type: 'narrative_delivered',
          narrative_asset_id: row.narrative_asset_id,
          timestamp: new Date(baseTime + i * 60000).toISOString(),
        });
      }
      for (let i = 0; i < row.converted; i++) {
        eventStore.push({
          workspace: workspaceRecord,
          sub_workspace: subWorkspace,
          play_id: playId,
          event_type: 'narrative_converted',
          narrative_asset_id: row.narrative_asset_id,
          timestamp: new Date(baseTime + 1000 * 60000 + i * 60000).toISOString(),
        });
      }
      for (let i = 0; i < row.assist; i++) {
        eventStore.push({
          workspace: workspaceRecord,
          sub_workspace: subWorkspace,
          play_id: playId,
          event_type: 'narrative_assist',
          narrative_asset_id: row.narrative_asset_id,
          timestamp: new Date(baseTime + 2000 * 60000 + i * 60000).toISOString(),
        });
      }
    }
  }
}

function nextId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function matchesContext(asset: NarrativeAssetRecord, ctx: NarrativeContext): boolean {
  const wsMatch =
    (ctx.workspace === 'student_lifecycle_ai' && asset.domain_scope === 'student_lifecycle') ||
    (ctx.workspace === 'advancement_giving_intelligence' && asset.domain_scope === 'advancement_giving');
  if (!wsMatch) return false;
  return asset.sub_domain_scope === ctx.sub_workspace;
}

function mapContextToWorkspace(ctx: NarrativeContext): string {
  return ctx.workspace === 'student_lifecycle_ai' ? 'student_lifecycle' : 'advancement_giving';
}

function matchesProofContext(proof: ProofBlockRecord, ctx: NarrativeContext): boolean {
  const wsMatch =
    (ctx.workspace === 'student_lifecycle_ai' && proof.workspace === 'student_lifecycle') ||
    (ctx.workspace === 'advancement_giving_intelligence' && proof.workspace === 'advancement_giving');
  return wsMatch;
}

export const narrativeMockProvider: NarrativeLibraryProvider = {
  async listNarrativeAssets(ctx, options = {}) {
    let list = store.filter((a) => matchesContext(a, ctx));
    if (options.approval_state) list = list.filter((a) => a.approval_state === options.approval_state);
    if (options.outcome) list = list.filter((a) => a.outcome === options.outcome);
    if (options.moment) list = list.filter((a) => a.moment === options.moment);
    if (options.sub_domain_scope) list = list.filter((a) => a.sub_domain_scope === options.sub_domain_scope);
    return list.sort((a, b) => (b.updatedAt ?? b.createdAt ?? '').localeCompare(a.updatedAt ?? a.createdAt ?? ''));
  },

  async getNarrativeAsset(ctx, id) {
    const asset = store.find((a) => a.id === id);
    if (!asset || !matchesContext(asset, ctx)) return null;
    return asset;
  },

  async createNarrativeAsset(ctx, data) {
    const workspace = mapContextToWorkspace(ctx);
    const asset: NarrativeAssetRecord = {
      id: nextId(),
      workspace,
      domain_scope: data.domain_scope,
      sub_domain_scope: data.sub_domain_scope,
      outcome: data.outcome,
      moment: data.moment,
      message_intent: data.message_intent,
      channel_fit: data.channel_fit,
      voice: data.voice,
      compliance_risk_level: data.compliance_risk_level,
      pii_tier: data.pii_tier,
      approval_state: 'draft',
      relationship_type: data.relationship_type,
      modules: data.modules,
      contentRef: data.contentRef,
      createdAt: now(),
      updatedAt: now(),
      createdById: ctx.userId,
    };
    store.push(asset);
    return asset;
  },

  async updateNarrativeAsset(ctx, id, data) {
    const idx = store.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Narrative asset not found');
    const asset = store[idx];
    if (!matchesContext(asset, ctx)) throw new Error('Narrative asset not found');
    const updated: NarrativeAssetRecord = {
      ...asset,
      ...data,
      id: asset.id,
      workspace: asset.workspace,
      approval_state: asset.approval_state,
      updatedAt: now(),
    };
    store[idx] = updated;
    return updated;
  },

  async deleteNarrativeAsset(ctx, id) {
    const idx = store.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Narrative asset not found');
    if (!matchesContext(store[idx], ctx)) throw new Error('Narrative asset not found');
    store.splice(idx, 1);
  },

  async submitForReview(ctx, id) {
    const idx = store.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Narrative asset not found');
    if (!matchesContext(store[idx], ctx)) throw new Error('Narrative asset not found');
    if (store[idx].approval_state !== 'draft') throw new Error('Only draft assets can be submitted for review');
    const updated: NarrativeAssetRecord = {
      ...store[idx],
      approval_state: 'in_review',
      updatedAt: now(),
    };
    store[idx] = updated;
    return updated;
  },

  async approve(ctx, id) {
    const idx = store.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Narrative asset not found');
    if (!matchesContext(store[idx], ctx)) throw new Error('Narrative asset not found');
    if (store[idx].approval_state !== 'in_review') throw new Error('Only in_review assets can be approved');
    const updated: NarrativeAssetRecord = {
      ...store[idx],
      approval_state: 'approved',
      approvedById: ctx.userId,
      updatedAt: now(),
    };
    store[idx] = updated;
    return updated;
  },

  async reject(ctx, id) {
    const idx = store.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Narrative asset not found');
    if (!matchesContext(store[idx], ctx)) throw new Error('Narrative asset not found');
    if (store[idx].approval_state !== 'in_review') throw new Error('Only in_review assets can be rejected');
    const updated: NarrativeAssetRecord = {
      ...store[idx],
      approval_state: 'rejected',
      updatedAt: now(),
    };
    store[idx] = updated;
    return updated;
  },

  // Proof Blocks
  async listProofBlocks(ctx, options = {}) {
    let list = proofStore.filter((p) => matchesProofContext(p, ctx));
    if (options.claim_class) list = list.filter((p) => p.claim_class === options.claim_class);
    if (options.proof_type) list = list.filter((p) => p.proof_type === options.proof_type);
    return list.sort((a, b) => (b.updatedAt ?? b.createdAt ?? '').localeCompare(a.updatedAt ?? a.createdAt ?? ''));
  },

  async getProofBlock(ctx, id) {
    const proof = proofStore.find((p) => p.id === id);
    if (!proof || !matchesProofContext(proof, ctx)) return null;
    return proof;
  },

  async createProofBlock(ctx, data) {
    const workspace = mapContextToWorkspace(ctx);
    const proof: ProofBlockRecord = {
      id: nextId(),
      workspace,
      proof_type: data.proof_type,
      claim_support_level: data.claim_support_level,
      claim_class: data.claim_class,
      freshness_window: data.freshness_window,
      allowed_voice: data.allowed_voice,
      content: data.content,
      restricted_channels: data.restricted_channels,
      createdAt: now(),
      updatedAt: now(),
    };
    proofStore.push(proof);
    return proof;
  },

  async updateProofBlock(ctx, id, data) {
    const idx = proofStore.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Proof block not found');
    if (!matchesProofContext(proofStore[idx], ctx)) throw new Error('Proof block not found');
    const updated: ProofBlockRecord = {
      ...proofStore[idx],
      ...data,
      id: proofStore[idx].id,
      workspace: proofStore[idx].workspace,
      updatedAt: now(),
    };
    proofStore[idx] = updated;
    return updated;
  },

  async deleteProofBlock(ctx, id) {
    const idx = proofStore.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Proof block not found');
    if (!matchesProofContext(proofStore[idx], ctx)) throw new Error('Proof block not found');
    proofStore.splice(idx, 1);
    linkStore.splice(0, linkStore.length, ...linkStore.filter((l) => l.proofBlockId !== id));
  },

  async linkProofToNarrative(ctx, narrativeAssetId, proofBlockId) {
    const asset = store.find((a) => a.id === narrativeAssetId);
    if (!asset || !matchesContext(asset, ctx)) throw new Error('Narrative asset not found');
    const proof = proofStore.find((p) => p.id === proofBlockId);
    if (!proof || !matchesProofContext(proof, ctx)) throw new Error('Proof block not found');
    if (!proof.allowed_voice.includes(asset.voice)) {
      throw new Error(`Proof block does not allow voice "${asset.voice}". Allowed: ${proof.allowed_voice.join(', ')}`);
    }
    if (linkStore.some((l) => l.narrativeAssetId === narrativeAssetId && l.proofBlockId === proofBlockId)) return;
    linkStore.push({ narrativeAssetId, proofBlockId });
  },

  async unlinkProofFromNarrative(ctx, narrativeAssetId, proofBlockId) {
    const asset = store.find((a) => a.id === narrativeAssetId);
    if (!asset || !matchesContext(asset, ctx)) throw new Error('Narrative asset not found');
    const idx = linkStore.findIndex(
      (l) => l.narrativeAssetId === narrativeAssetId && l.proofBlockId === proofBlockId
    );
    if (idx !== -1) linkStore.splice(idx, 1);
  },

  async listProofForNarrative(ctx, narrativeAssetId) {
    const asset = store.find((a) => a.id === narrativeAssetId);
    if (!asset || !matchesContext(asset, ctx)) return [];
    const ids = linkStore.filter((l) => l.narrativeAssetId === narrativeAssetId).map((l) => l.proofBlockId);
    return proofStore.filter((p) => ids.includes(p.id));
  },

  // Delivery Plays
  async listDeliveryPlays(ctx) {
    const workspace = mapContextToWorkspace(ctx);
    return deliveryPlayStore
      .filter((p) => p.workspace === workspace && p.sub_workspace === ctx.sub_workspace)
      .sort((a, b) => (b.updatedAt ?? b.createdAt ?? '').localeCompare(a.updatedAt ?? a.createdAt ?? ''));
  },

  async createDeliveryPlay(ctx, data) {
    const workspace = mapContextToWorkspace(ctx);
    const play: DeliveryPlayRecord = {
      id: nextId(),
      workspace,
      sub_workspace: ctx.sub_workspace,
      play_category: data.play_category,
      trigger_type: data.trigger_type,
      cadence_policy: data.cadence_policy,
      eligibility: data.eligibility,
      success_events: data.success_events,
      suppression_policy_id: data.suppression_policy_id,
      createdAt: now(),
      updatedAt: now(),
    };
    deliveryPlayStore.push(play);
    return play;
  },

  // Narrative Context (Phase 3)
  async buildEntityNarrativeContext(ctx, input) {
    const workspace = mapContextToWorkspace(ctx);
    return buildEntityNarrativeContext(workspace, ctx.sub_workspace, input);
  },

  async getContextEmbedding(ctx, input) {
    const built = await this.buildEntityNarrativeContext(ctx, input);
    const text = contextToEmbeddingText(built);
    return embedText(text);
  },

  // Recommendation Engine (Phase 4)
  async recommend(ctx, options = {}) {
    const limit = options.limit ?? 10;
    const recentSet = new Set(options.recent_narrative_ids ?? []);

    let candidates = await this.listNarrativeAssets(ctx, { approval_state: 'approved' });

    if (options.channel) {
      candidates = candidates.filter((a) => a.channel_fit.includes(options.channel!));
    }
    if (options.voice) {
      candidates = candidates.filter((a) => a.voice === options.voice);
    }
    if (options.entity_context_input?.outcome) {
      candidates = candidates.filter((a) => a.outcome === options.entity_context_input!.outcome);
    }
    if (options.entity_context_input?.moment) {
      candidates = candidates.filter((a) => a.moment === options.entity_context_input!.moment);
    }
    if (options.entity_context_input?.message_intent) {
      candidates = candidates.filter((a) => a.message_intent === options.entity_context_input!.message_intent);
    }

    let contextEmbedding: number[] | null = null;
    if (options.entity_context_input) {
      contextEmbedding = await this.getContextEmbedding(ctx, options.entity_context_input);
    }

    const scored = candidates.map((asset) => {
      let score = 0.5;
      if (contextEmbedding && asset.embedding?.length) {
        const sim = cosineSimilarity(contextEmbedding, asset.embedding);
        score = 0.5 + 0.5 * sim;
      }
      if (recentSet.has(asset.id)) score -= 0.3;
      return { asset, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const narrative_assets = scored.slice(0, limit).map((s) => s.asset);

    return { narrative_assets };
  },

  // Composition and Agent Layer (Phase 5)
  async compose(ctx, options) {
    const asset = await this.getNarrativeAsset(ctx, options.narrative_asset_id);
    if (!asset) throw new Error('Narrative asset not found');
    if (asset.approval_state !== 'approved') throw new Error('Only approved narratives can be composed');

    if (options.voice && asset.voice !== options.voice) {
      throw new Error(`Voice "${options.voice}" does not match narrative voice "${asset.voice}"`);
    }

    let proofList = await this.listProofForNarrative(ctx, options.narrative_asset_id);
    if (options.claim_class) {
      proofList = proofList.filter((p) => p.claim_class === options.claim_class);
    }
    if (options.channel) {
      proofList = proofList.filter(
        (p) => !p.restricted_channels?.includes(options.channel!)
      );
    }

    const narrativePart = asset.contentRef
      ? `[Content: ${asset.contentRef}]`
      : `[Narrative: ${asset.outcome} / ${asset.moment} – ${asset.message_intent}]`;

    const proofSnippets = proofList.map((p) => p.content.slice(0, 200) + (p.content.length > 200 ? '…' : ''));
    const body = [narrativePart, ...proofSnippets].filter(Boolean).join('\n\n');

    const proof_used = proofList.map((p) => ({
      proof_block_id: p.id,
      claim_class: p.claim_class,
      content: p.content.slice(0, 200) + (p.content.length > 200 ? '…' : ''),
    }));

    return {
      narrative_asset_id: asset.id,
      voice: asset.voice,
      body,
      proof_used,
      guardrails_ok: true,
      confidence: 1,
    };
  },

  // Delivery and Events (Phase 6)
  async recordEvent(ctx, event) {
    const workspace = mapContextToWorkspace(ctx);
    const full: NarrativeDeliveryEvent = {
      ...event,
      workspace,
      sub_workspace: ctx.sub_workspace,
      timestamp: event.timestamp ?? now(),
    };
    eventStore.push(full);
  },

  async listEvents(ctx, options = {}) {
    const workspace = mapContextToWorkspace(ctx);
    let list = eventStore.filter(
      (e) => e.workspace === workspace && e.sub_workspace === ctx.sub_workspace
    );
    if (options.since) {
      list = list.filter((e) => e.timestamp >= options.since!);
    }
    if (options.event_type) {
      list = list.filter((e) => e.event_type === options.event_type);
    }
    list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    const limit = options.limit ?? 100;
    return list.slice(0, limit);
  },

  // Learning Loop (Phase 7)
  async getPerformanceStats(ctx, options = {}) {
    const events = await this.listEvents(ctx, { since: options.since, limit: 10000 });
    const byId = new Map<
      string,
      { delivered: number; converted: number; assist: number; recommended: number }
    >();

    for (const e of events) {
      const id = e.narrative_asset_id ?? '_unknown';
      if (options.narrative_asset_id && id !== options.narrative_asset_id) continue;

      const cur = byId.get(id) ?? { delivered: 0, converted: 0, assist: 0, recommended: 0 };
      if (e.event_type === 'narrative_delivered') cur.delivered++;
      else if (e.event_type === 'narrative_converted') cur.converted++;
      else if (e.event_type === 'narrative_assist') cur.assist++;
      else if (e.event_type === 'narrative_recommended') cur.recommended++;
      byId.set(id, cur);
    }

    const result: NarrativePerformanceStats[] = [];
    for (const [narrative_asset_id, counts] of byId) {
      if (narrative_asset_id === '_unknown') continue;
      const delivered = counts.delivered;
      result.push({
        narrative_asset_id,
        ...counts,
        conversion_rate: delivered > 0 ? counts.converted / delivered : 0,
        assist_rate: delivered > 0 ? counts.assist / delivered : 0,
      });
    }
    result.sort((a, b) => b.delivered - a.delivered);
    return result;
  },

  async getLearningSignals(ctx, options = {}) {
    const stats = await this.getPerformanceStats(ctx, options);
    const signals: LearningSignal[] = [];
    for (const s of stats) {
      if (s.delivered >= 10 && s.conversion_rate < 0.05) {
        signals.push({
          narrative_asset_id: s.narrative_asset_id,
          signal_type: 'low_conversion',
          reason: `Conversion rate ${(s.conversion_rate * 100).toFixed(1)}% over ${s.delivered} deliveries`,
        });
      } else if (s.delivered >= 100) {
        signals.push({
          narrative_asset_id: s.narrative_asset_id,
          signal_type: 'high_volume',
          reason: `${s.delivered} deliveries – consider A/B or refresh`,
        });
      } else {
        signals.push({ narrative_asset_id: s.narrative_asset_id, signal_type: 'ok' });
      }
    }
    return signals;
  },
};
