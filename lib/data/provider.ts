import type { AgentOpsItem } from "@/lib/agent-ops/types";
import type { Contact } from "@/lib/contacts/contact-types";
import type { Segment } from "@/lib/segments/types";
import type { SegmentDefinition } from "@/components/shared/ai-platform/segments/types";
import type { GuardrailPolicy } from "@/lib/guardrails/types";
import type { DoNotEngageEntry } from "@/lib/do-not-engage/mockDoNotEngage";

import type { WorkingMode } from '@/lib/command-center/workingModeUtils';
import { normalizeWorkingMode } from '@/lib/command-center/workingModeUtils';

export type DataContext = {
  workspace?: string;
  app?: string;
  mode?: WorkingMode | 'operator' | 'global' | 'workspace'; // working mode for filtering ('operator' accepted for backwards compatibility)
  userId?: string; // current user ID for user-specific filtering
  persona?: string; // optional, keep if useful for scenario data
};

// Type alias for queue items (using AgentOpsItem as the underlying type)
export type QueueItem = AgentOpsItem;

export interface DataProvider {
  // Agent Ops / Queue Items
  listQueueItems(ctx: DataContext): Promise<QueueItem[]>;

  // People / Contacts
  listContacts(ctx: DataContext): Promise<Contact[]>;
  getContact(ctx: DataContext, id: string): Promise<Contact | null>;

  // Segments (lib/segments type)
  listSegments(ctx: DataContext): Promise<Segment[]>;
  getSegment(ctx: DataContext, id: string): Promise<Segment | null>;

  // Segment Definitions (AI platform type)
  listSegmentDefinitions(ctx: DataContext): Promise<SegmentDefinition[]>;
  getSegmentDefinition(ctx: DataContext, id: string): Promise<SegmentDefinition | null>;

  // Guardrails
  listGuardrailPolicies(ctx: DataContext): Promise<GuardrailPolicy[]>;

  // Do Not Engage
  listDoNotEngage(ctx: DataContext): Promise<DoNotEngageEntry[]>;

  // Admissions Leadership Charts
  getAdmissionsLeadershipTrend(ctx: DataContext): Promise<AdmissionsLeadershipTrendData | null>;
  getAdmissionsLeadershipBottlenecks(ctx: DataContext): Promise<AdmissionsLeadershipBottleneckData[]>;
  getAdmissionsLeadershipFunnel(ctx: DataContext): Promise<AdmissionsLeadershipFunnelData | null>;
  
  // Admissions Leadership Command Center
  getAdmissionsLeadershipData(ctx: DataContext): Promise<AdmissionsLeadershipData | null>;
  getAdmissionsLeadershipInsights(ctx: DataContext): Promise<AdmissionsLeadershipInsights | null>;

  // Admissions Operator Command Center
  getAdmissionsOperatorTodaysFocus(ctx: DataContext): Promise<AdmissionsOperatorTodaysFocusData | null>;
  getAdmissionsOperatorGamePlan(ctx: DataContext): Promise<AdmissionsOperatorGamePlanData | null>;
  getAdmissionsOperatorMomentum(ctx: DataContext): Promise<AdmissionsOperatorMomentumData | null>;
  getAdmissionsOperatorFlaggedRisks(ctx: DataContext): Promise<AdmissionsOperatorFlaggedRiskData[]>;
  getAdmissionsOperatorGoalTracker(ctx: DataContext): Promise<AdmissionsOperatorGoalTrackerData | null>;
  getAdmissionsOperatorAssistants(ctx: DataContext): Promise<AdmissionsOperatorAssistantData[]>;
  getAdmissionsOperatorRecentWins(ctx: DataContext): Promise<AdmissionsOperatorRecentWinData[]>;
  getAdmissionsOperatorRecentActivity(ctx: DataContext): Promise<AdmissionsOperatorRecentActivityData[]>;

  // Admissions Team Game Plan (for Queue integration)
  getAdmissionsTeamGamePlan(ctx: DataContext): Promise<AdmissionsTeamGamePlanData | null>;
  getAdmissionsQueueGamePlanCounts(ctx: DataContext): Promise<Record<string, number>>;
  getAdmissionsQueueItemsByObjective(ctx: DataContext, objectiveId: string, limit?: number): Promise<QueueItem[]>;

  // Program Match
  getProgramMatchHubSummary(ctx: DataContext): Promise<ProgramMatchHubSummary | null>;
  getProgramMatchChecklist(ctx: DataContext): Promise<ProgramMatchChecklistItem[]>;
  getProgramMatchLibrariesSummary(ctx: DataContext): Promise<ProgramMatchLibrariesSummary | null>;
  getProgramMatchProgramsSummary(ctx: DataContext): Promise<ProgramMatchProgramsSummary | null>;
  getProgramMatchCandidatesSummary(ctx: DataContext): Promise<ProgramMatchCandidatesSummary | null>;
  getProgramMatchAnalyticsSummary(ctx: DataContext): Promise<ProgramMatchAnalyticsSummary | null>;
  getProgramMatchDraftConfig(ctx: DataContext): Promise<ProgramMatchDraftConfig | null>;
  updateProgramMatchDraftConfig(ctx: DataContext, input: { voiceToneProfileId?: string | null }): Promise<ProgramMatchDraftConfig | null>;
  listVoiceToneProfiles(ctx: DataContext): Promise<VoiceToneProfile[]>;

  // Program Match Traits
  listProgramMatchTraits(ctx: DataContext): Promise<ProgramMatchTrait[]>;
  createProgramMatchTrait(ctx: DataContext, input: { name: string; category: string; description: string }): Promise<ProgramMatchTrait>;
  updateProgramMatchTrait(ctx: DataContext, id: string, input: Partial<{ name: string; category: string; description: string; isActive: boolean }>): Promise<ProgramMatchTrait>;

  // Program Match Skills
  listProgramMatchSkills(ctx: DataContext): Promise<ProgramMatchSkill[]>;
  createProgramMatchSkill(ctx: DataContext, input: { name: string; category: string; description: string }): Promise<ProgramMatchSkill>;
  updateProgramMatchSkill(ctx: DataContext, id: string, input: Partial<{ name: string; category: string; description: string; isActive: boolean }>): Promise<ProgramMatchSkill>;

  // Program Match Programs
  listProgramMatchPrograms(ctx: DataContext): Promise<ProgramMatchProgram[]>;
  createProgramMatchProgram(ctx: DataContext, input: { name: string }): Promise<ProgramMatchProgram>;
  updateProgramMatchProgram(ctx: DataContext, id: string, input: Partial<{ name: string; status: 'draft' | 'active' | 'inactive' }>): Promise<ProgramMatchProgram>;

  // Program Match ICP
  getProgramMatchProgramICP(ctx: DataContext, programId: string): Promise<ProgramMatchProgramICP | null>;
  updateProgramMatchProgramICP(ctx: DataContext, programId: string, buckets: ProgramMatchICPBuckets): Promise<ProgramMatchProgramICP>;

}

// Admissions Leadership Chart Data Types
export interface AdmissionsLeadershipTrendData {
  dates: string[];
  deposits: number[];
}

export interface AdmissionsLeadershipBottleneckData {
  stage: string;
  currentDays: number;
  targetDays: number;
}

export interface AdmissionsLeadershipFunnelData {
  stages: {
    label: string;
    count: number;
    conversionRate?: number;
  }[];
}

// Admissions Leadership Command Center Data Types
export interface AdmissionsLeadershipIntervention {
  id: string;
  title: string;
  description: string;
  impactText?: string;
  cta?: { label: string; href?: string };
  ownerLabel?: string;
}

export interface AdmissionsLeadershipData {
  alignmentSummary?: string;
  statusSummary: string;
  keyRisksAndOpportunities: Array<{
    id: string;
    title: string;
    description: string;
    forecastImpact: string;
    severity: 'high' | 'medium' | 'low' | 'opportunity';
  }>;
  upstreamDemandSignals: string[];
  whatChanged: string[];
  recommendedInterventions: AdmissionsLeadershipIntervention[];
  interventionToTeamNote?: string;
  whatToWatchNext: string[];
}

export interface AdmissionsLeadershipInsightMetric {
  id: string;
  label: string;
  value: string;
  subtext?: string;
}

export interface AdmissionsLeadershipInsights {
  outcomeCoverage: AdmissionsLeadershipInsightMetric[];
  flowHealth: AdmissionsLeadershipInsightMetric[];
  interventionImpact: AdmissionsLeadershipInsightMetric[];
}

// Admissions Operator Command Center Data Types
export interface AdmissionsOperatorTodaysFocusData {
  text: string;
}

export interface AdmissionsOperatorGamePlanItem {
  id: string;
  title: string;
  description?: string;
  impactHint?: string;
  criteria?: string;
  ctas: Array<{ label: string; href?: string }>;
  // PHASE 1: Task completion feedback
  status?: 'open' | 'in_progress' | 'completed';
  completedAt?: string; // ISO timestamp
  lastOutcomeSummary?: string; // Short 1-line narrative
  // PHASE 2: Goal impact mapping
  goalImpacts?: Array<{ goalId: string; deltaLabel: string; deltaValue?: number }>;
}

export interface AdmissionsOperatorGamePlanData {
  total: number;
  completed: number;
  items: AdmissionsOperatorGamePlanItem[];
  // PHASE 3: Momentum summary
  todaysProgressSummary?: { movedForwardCount?: number; narrative?: string };
  // PHASE 4: Completion summary
  completionSummary?: string;
  // Coach message: narrative encouragement and context
  coachMessage?: string;
}

export interface AdmissionsOperatorMomentumData {
  streakDays: number;
  weeklyChallenge: {
    completed: number;
    total: number;
    label?: string;
  };
  score: number;
}

export interface AdmissionsOperatorFlaggedRiskData {
  id: string;
  title: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface AdmissionsOperatorGoalTrackerMetric {
  id: string;
  label: string;
  current: number;
  target: number;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
  status?: string;
}

export interface AdmissionsOperatorGoalTrackerData {
  title: string;
  timeframeLabel: string;
  subtitle?: string;
  metrics: AdmissionsOperatorGoalTrackerMetric[];
}

export interface AdmissionsOperatorAssistantData {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  description: string;
  impact?: string;
}

export interface AdmissionsOperatorRecentWinData {
  id: string;
  text: string;
  detail?: string;
  assistantName?: string;
}

export interface AdmissionsOperatorRecentActivityData {
  id: string;
  timestamp: string;
  text: string;
}

// Admissions Team Game Plan (for Queue integration)
export interface AdmissionsTeamGamePlanObjective {
  id: string;
  title: string;
  shortTitle?: string;
  description?: string;
  impactText?: string;
}

export interface AdmissionsTeamGamePlanData {
  completedCount: number;
  totalCount: number; // should be 3
  objectives: AdmissionsTeamGamePlanObjective[];
}

// Program Match Data Types
export interface ProgramMatchHubSummary {
  status: 'draft' | 'published' | 'archived';
  lastUpdated: string; // ISO string
  progressPercent: number; // 0-100
}

export interface ProgramMatchChecklistItem {
  id: string;
  label: string;
  state: 'not_started' | 'in_progress' | 'complete';
  sectionId: string; // ID of the section to scroll to
}

export interface ProgramMatchLibrariesSummary {
  traitsCount: number;
  skillsCount: number;
  outcomesEnabled: boolean;
}


export interface ProgramMatchProgramsSummary {
  activeProgramsCount: number;
  draftProgramsCount: number;
  programs: Array<{ id: string; name: string; status: 'active' | 'draft' }>;
}

export interface ProgramMatchCandidatesSummary {
  columns: Array<{ id: string; label: string }>;
  rows: Array<Record<string, unknown>>;
}

export interface ProgramMatchAnalyticsTile {
  id: string;
  label: string;
  value: number | string;
  subtext?: string;
}

export interface ProgramMatchAnalyticsSummary {
  tiles: ProgramMatchAnalyticsTile[];
  // Chart placeholders can be added later
}

export interface ProgramMatchDraftConfig {
  id: string;
  status: 'draft';
  voiceToneProfileId: string | null;
  updatedAt: string;
}

export interface VoiceToneProfile {
  id: string;
  name: string;
  description?: string;
}

export interface ProgramMatchTrait {
  id: string;
  name: string;
  category: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramMatchSkill {
  id: string;
  name: string;
  category: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramMatchProgram {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'inactive';
  updatedAt: string;
}

export interface ProgramMatchICPBuckets {
  critical: { traitIds: string[]; skillIds: string[] };
  veryImportant: { traitIds: string[]; skillIds: string[] };
  important: { traitIds: string[]; skillIds: string[] };
  niceToHave: { traitIds: string[]; skillIds: string[] };
}

export interface ProgramMatchProgramICP {
  programId: string;
  buckets: ProgramMatchICPBuckets;
  updatedAt: string;
}

