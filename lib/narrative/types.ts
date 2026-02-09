/**
 * Narrative Library Service - types and context.
 * Phase 1: CRUD, approvals, workspace-scoped filtering.
 */

export type NarrativeWorkspace = 'student_lifecycle_ai' | 'advancement_giving_intelligence';

export type NarrativeContext = {
  workspace: NarrativeWorkspace;
  sub_workspace: string;
  userId?: string;
};

/** API shape for narrative assets (matches schema; snake_case for classification fields). */
export interface NarrativeAssetRecord {
  id: string;
  workspace: string;
  domain_scope: 'student_lifecycle' | 'advancement_giving';
  sub_domain_scope: string;
  outcome: string;
  moment: string;
  message_intent: string;
  channel_fit: string[];
  voice: string;
  compliance_risk_level: 'low' | 'medium' | 'high';
  pii_tier: 'none' | 'standard' | 'sensitive';
  approval_state: 'draft' | 'in_review' | 'approved' | 'rejected';
  relationship_type?: string;
  modules?: { id: string; type: string; contentRef?: string }[];
  contentRef?: string;
  embedding?: number[];
  createdAt?: string;
  updatedAt?: string;
  createdById?: string;
  approvedById?: string;
}

export interface NarrativeAssetInput {
  domain_scope: 'student_lifecycle' | 'advancement_giving';
  sub_domain_scope: string;
  outcome: string;
  moment: string;
  message_intent: string;
  channel_fit: string[];
  voice: string;
  compliance_risk_level: 'low' | 'medium' | 'high';
  pii_tier: 'none' | 'standard' | 'sensitive';
  relationship_type?: string;
  modules?: { id: string; type: string; contentRef?: string }[];
  contentRef?: string;
}

export interface ListNarrativeAssetsOptions {
  approval_state?: NarrativeAssetRecord['approval_state'];
  outcome?: string;
  moment?: string;
  sub_domain_scope?: string;
}

// -----------------------------------------------------------------------------
// Proof Blocks (Phase 2)
// -----------------------------------------------------------------------------

export interface ProofBlockRecord {
  id: string;
  workspace: string;
  proof_type: string;
  claim_support_level: string;
  claim_class: string;
  freshness_window: string;
  allowed_voice: string[];
  content: string;
  restricted_channels?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProofBlockInput {
  proof_type: string;
  claim_support_level: string;
  claim_class: string;
  freshness_window: string;
  allowed_voice: string[];
  content: string;
  restricted_channels?: string[];
}

export interface ListProofBlocksOptions {
  claim_class?: string;
  proof_type?: string;
}

// -----------------------------------------------------------------------------
// Delivery Plays
// -----------------------------------------------------------------------------

export interface DeliveryPlayRecord {
  id: string;
  workspace: string;
  sub_workspace: string;
  play_category: string;
  trigger_type: string;
  cadence_policy: string;
  eligibility?: { narrativeIds?: string[]; outcome?: string; moment?: string; segmentIds?: string[] };
  success_events?: { type: string; metric?: string; threshold?: number }[];
  suppression_policy_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryPlayInput {
  play_category: string;
  trigger_type: string;
  cadence_policy: string;
  eligibility?: DeliveryPlayRecord['eligibility'];
  success_events?: DeliveryPlayRecord['success_events'];
  suppression_policy_id?: string;
}

// -----------------------------------------------------------------------------
// Narrative Context Service (Phase 3) - entity-aware context for similarity
// -----------------------------------------------------------------------------

/** Inputs to build entity narrative context (CDP / moment data). */
export interface EntityNarrativeContextInput {
  role_persona?: string;
  lifecycle_state?: string;
  relationship_context?: string;
  risk_opportunity_signals?: string[];
  channel?: string;
  use_case?: string;
  /** Optional: set explicitly for eligibility; otherwise derived from signals. */
  outcome?: string;
  moment?: string;
  message_intent?: string;
}

/** Built context: maps to Outcome, Moment, Message Intent for eligibility; used for embedding. */
export interface EntityNarrativeContext {
  workspace: string;
  sub_workspace: string;
  outcome: string;
  moment: string;
  message_intent: string;
  role_persona?: string;
  lifecycle_state?: string;
  relationship_context?: string;
  risk_opportunity_signals?: string[];
  channel?: string;
  use_case?: string;
}

// -----------------------------------------------------------------------------
// Recommendation Engine (Phase 4)
// -----------------------------------------------------------------------------

/** Input for recommend(): workspace/scoped; channel/use_case for filtering; optional context for similarity. */
export interface RecommendOptions {
  channel?: string;
  use_case?: string;
  /** Optional entity context for similarity ranking (narrative_embedding vs context_embedding). */
  entity_context_input?: EntityNarrativeContextInput;
  /** Narrative IDs recently shown/sent (fatigue/diversity: reduce repetition). */
  recent_narrative_ids?: string[];
  /** Preferred voice for filtering (schema: only narratives with this voice). */
  voice?: string;
  /** Max number of recommendations to return. */
  limit?: number;
}

export interface RecommendResult {
  narrative_assets: NarrativeAssetRecord[];
}

// -----------------------------------------------------------------------------
// Composition and Agent Layer (Phase 5)
// -----------------------------------------------------------------------------

/** Input for compose(): voice/sender_policy/claim_class per PRD; narrative by id or from recommend. */
export interface ComposeOptions {
  /** Narrative asset to compose from (must be approved). */
  narrative_asset_id: string;
  /** Voice for sender policy (must match asset.voice). */
  voice?: string;
  /** Optional sender policy identifier (workspace-specific). */
  sender_policy?: string;
  /** Optional: only include proof blocks with this claim_class. */
  claim_class?: string;
  /** Optional: channel for restricted_channels filtering on proof. */
  channel?: string;
}

/** Composed output: approved content + proof only; no invented claims. */
export interface ComposeResult {
  narrative_asset_id: string;
  voice: string;
  /** Composed body (narrative modules + proof snippets). */
  body: string;
  /** Proof blocks used (claim_class, content snippet). */
  proof_used: { proof_block_id: string; claim_class: string; content: string }[];
  /** Guardrails: true if only approved content was used. */
  guardrails_ok: boolean;
  /** Confidence 0–1 (stub: 1 when guardrails_ok). */
  confidence: number;
}

// -----------------------------------------------------------------------------
// Delivery and Events (Phase 6)
// -----------------------------------------------------------------------------

export type NarrativeEventType =
  | 'narrative_delivered'
  | 'narrative_converted'
  | 'narrative_assist'
  | 'narrative_recommended';

/** Standardized event for delivery and learning loop; workspace/sub_workspace/play_id required. */
export interface NarrativeDeliveryEvent {
  workspace: string;
  sub_workspace: string;
  play_id: string;
  event_type: NarrativeEventType;
  narrative_asset_id?: string;
  entity_id?: string;
  channel?: string;
  outcome?: string;
  moment?: string;
  timestamp: string;
}

export interface ListEventsOptions {
  since?: string;
  event_type?: NarrativeEventType;
  limit?: number;
}

// -----------------------------------------------------------------------------
// Learning Loop (Phase 7)
// -----------------------------------------------------------------------------

/** Aggregated performance per narrative (workspace/sub_workspace scoped). */
export interface NarrativePerformanceStats {
  narrative_asset_id: string;
  delivered: number;
  converted: number;
  assist: number;
  recommended: number;
  conversion_rate: number;
  assist_rate: number;
}

export interface GetPerformanceStatsOptions {
  since?: string;
  narrative_asset_id?: string;
}

/** Signal for lifecycle automation (e.g. retrain, refresh, retire). */
export interface LearningSignal {
  narrative_asset_id: string;
  signal_type: 'low_conversion' | 'high_volume' | 'stale' | 'ok';
  reason?: string;
}

export interface NarrativeLibraryProvider {
  listNarrativeAssets(
    ctx: NarrativeContext,
    options?: ListNarrativeAssetsOptions
  ): Promise<NarrativeAssetRecord[]>;
  getNarrativeAsset(ctx: NarrativeContext, id: string): Promise<NarrativeAssetRecord | null>;
  createNarrativeAsset(
    ctx: NarrativeContext,
    data: NarrativeAssetInput
  ): Promise<NarrativeAssetRecord>;
  updateNarrativeAsset(
    ctx: NarrativeContext,
    id: string,
    data: Partial<NarrativeAssetInput>
  ): Promise<NarrativeAssetRecord>;
  deleteNarrativeAsset(ctx: NarrativeContext, id: string): Promise<void>;
  submitForReview(ctx: NarrativeContext, id: string): Promise<NarrativeAssetRecord>;
  approve(ctx: NarrativeContext, id: string): Promise<NarrativeAssetRecord>;
  reject(ctx: NarrativeContext, id: string): Promise<NarrativeAssetRecord>;

  // Proof Blocks
  listProofBlocks(
    ctx: NarrativeContext,
    options?: ListProofBlocksOptions
  ): Promise<ProofBlockRecord[]>;
  getProofBlock(ctx: NarrativeContext, id: string): Promise<ProofBlockRecord | null>;
  createProofBlock(ctx: NarrativeContext, data: ProofBlockInput): Promise<ProofBlockRecord>;
  updateProofBlock(
    ctx: NarrativeContext,
    id: string,
    data: Partial<ProofBlockInput>
  ): Promise<ProofBlockRecord>;
  deleteProofBlock(ctx: NarrativeContext, id: string): Promise<void>;

  // Linking (claim enforcement: voice must be in proof allowed_voice)
  linkProofToNarrative(
    ctx: NarrativeContext,
    narrativeAssetId: string,
    proofBlockId: string
  ): Promise<void>;
  unlinkProofFromNarrative(
    ctx: NarrativeContext,
    narrativeAssetId: string,
    proofBlockId: string
  ): Promise<void>;
  listProofForNarrative(
    ctx: NarrativeContext,
    narrativeAssetId: string
  ): Promise<ProofBlockRecord[]>;

  // Delivery Plays
  listDeliveryPlays(ctx: NarrativeContext): Promise<DeliveryPlayRecord[]>;
  createDeliveryPlay(ctx: NarrativeContext, data: DeliveryPlayInput): Promise<DeliveryPlayRecord>;

  // Narrative Context (Phase 3) - entity-aware context and embedding
  buildEntityNarrativeContext(
    ctx: NarrativeContext,
    input: EntityNarrativeContextInput
  ): Promise<EntityNarrativeContext>;
  getContextEmbedding(
    ctx: NarrativeContext,
    input: EntityNarrativeContextInput
  ): Promise<number[]>;

  // Recommendation Engine (Phase 4)
  recommend(ctx: NarrativeContext, options?: RecommendOptions): Promise<RecommendResult>;

  // Composition and Agent Layer (Phase 5)
  compose(ctx: NarrativeContext, options: ComposeOptions): Promise<ComposeResult>;

  // Delivery and Events (Phase 6)
  recordEvent(ctx: NarrativeContext, event: Omit<NarrativeDeliveryEvent, 'workspace' | 'sub_workspace'>): Promise<void>;
  listEvents(ctx: NarrativeContext, options?: ListEventsOptions): Promise<NarrativeDeliveryEvent[]>;

  // Learning Loop (Phase 7)
  getPerformanceStats(ctx: NarrativeContext, options?: GetPerformanceStatsOptions): Promise<NarrativePerformanceStats[]>;
  getLearningSignals(ctx: NarrativeContext, options?: GetPerformanceStatsOptions): Promise<LearningSignal[]>;
}
