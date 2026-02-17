/**
 * Types for Narrative Messaging seed fixture (e.g. UNC).
 * Used by seed loader and mock provider seedFromFixture.
 */

export interface NarrativeSeedModule {
  id: string;
  type: string;
  contentRef?: string | null;
  order?: number;
}

export interface NarrativeSeedAsset {
  id: string;
  title: string;
  domain_scope: string;
  sub_domain_scope: string;
  outcome: string;
  moment: string;
  message_intent: string;
  primary_cta?: string;
  channel_fit: string[];
  voice: string;
  compliance_risk_level: string;
  pii_tier: string;
  approval_state: string;
  relationship_type?: string;
  contentRef?: string;
  modules?: NarrativeSeedModule[];
  proof_refs?: string[];
}

export interface ProofBlockSeed {
  id: string;
  title?: string;
  proof_type: string;
  claim_support_level: string;
  claim_class: string;
  freshness_window: string;
  allowed_voice: string[];
  restricted_channels?: string[];
  content: string;
}

export interface NarrativeProofLinkSeed {
  narrative_asset_id: string;
  proof_block_id: string;
}

export interface DeliveryPlaySeed {
  id: string;
  title?: string;
  play_category: string;
  trigger_type: string;
  trigger_definition?: string;
  cadence_policy: string;
  channels?: string[];
  suppression_rules?: string;
  narrative_selection?: Record<string, string | string[]>;
  eligibility?: { narrativeIds?: string[]; outcome?: string; moment?: string; segmentIds?: string[] };
  success_events?: { type: string; metric?: string; threshold?: number }[];
}

export interface PreviewScenarioSeed {
  id: string;
  persona: string;
  context: string;
  channel: string;
  assembled_message: string;
  why_chosen: string[];
}

export interface PerformancePerNarrativeSeed {
  narrative_asset_id: string;
  delivered: number;
  converted: number;
  assist: number;
  recommended?: number;
}

export interface PerformanceTopNarrativeSeed {
  narrative_asset_id: string;
  title: string;
  delivered: number;
}

export interface PerformanceTopProofSeed {
  proof_block_id: string;
  title: string;
  use_count: number;
}

export interface NarrativeSeedFixture {
  _meta?: {
    institution?: string;
    workspace?: string;
    sub_workspace?: string;
    default_voice?: string;
    description?: string;
  };
  narratives: NarrativeSeedAsset[];
  proof_blocks: ProofBlockSeed[];
  narrative_proof_links: NarrativeProofLinkSeed[];
  delivery_plays: DeliveryPlaySeed[];
  preview_scenarios?: PreviewScenarioSeed[];
  performance?: {
    _note?: string;
    per_narrative?: PerformancePerNarrativeSeed[];
    per_play?: { play_id: string; delivered: number; converted: number; assist: number }[];
    top_narratives_this_month?: PerformanceTopNarrativeSeed[];
    top_proof_blocks?: PerformanceTopProofSeed[];
  };
}
