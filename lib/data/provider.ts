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

  // Pipeline Team Command Center
  getPipelineTeamTodaysFocus(ctx: DataContext): Promise<AdmissionsOperatorTodaysFocusData | null>;
  getPipelineTeamGamePlan(ctx: DataContext): Promise<AdmissionsOperatorGamePlanData | null>;
  getPipelineTeamMomentum(ctx: DataContext): Promise<AdmissionsOperatorMomentumData | null>;
  getPipelineTeamPortfolioHealth(ctx: DataContext): Promise<PipelineLeadershipPortfolioHealthData | null>;
  getPipelineTeamFlaggedRisks(ctx: DataContext): Promise<AdmissionsOperatorFlaggedRiskData[]>;
  getPipelineTeamGoalTracker(ctx: DataContext, timeframe?: 'week' | 'month' | 'quarter' | 'fiscalYear'): Promise<AdmissionsOperatorGoalTrackerData | null>;
  getPipelineTeamForecast(ctx: DataContext): Promise<PipelineTeamForecastData | null>;
  getPipelineTeamAssistants(ctx: DataContext): Promise<AdmissionsOperatorAssistantData[]>;
  getPipelineTeamRecentWins(ctx: DataContext): Promise<AdmissionsOperatorRecentWinData[]>;
  getPipelineTeamRecentActivity(ctx: DataContext): Promise<AdmissionsOperatorRecentActivityData[]>;

  // Pipeline Leadership Command Center
  getPipelineLeadershipStatusSummary(ctx: DataContext): Promise<PipelineLeadershipStatusSummaryData | null>;
  getPipelineLeadershipKeyRisksAndOpportunities(ctx: DataContext): Promise<PipelineLeadershipKeyRiskOrOpportunity[]>;
  getPipelineLeadershipWhatChanged(ctx: DataContext): Promise<string[]>;
  getPipelineLeadershipRecommendedInterventions(ctx: DataContext): Promise<PipelineLeadershipIntervention[]>;
  getPipelineLeadershipWhatToWatchNext(ctx: DataContext): Promise<string[]>;
  getPipelineLeadershipInsightsAndTracking(ctx: DataContext): Promise<PipelineLeadershipInsightsData | null>;
  getPipelineLeadershipPortfolioHealth(ctx: DataContext): Promise<PipelineLeadershipPortfolioHealthData | null>;
  getPipelineLeadershipForecast(ctx: DataContext): Promise<PipelineLeadershipForecastData | null>;
  getPipelineLeadershipTeamForecastSnapshot(ctx: DataContext): Promise<PipelineLeadershipTeamForecastSnapshotData | null>;
  getPipelineLeadershipFlaggedRisks(ctx: DataContext): Promise<AdmissionsOperatorFlaggedRiskData[]>;
  getPipelineLeadershipRecentWins(ctx: DataContext): Promise<AdmissionsOperatorRecentWinData[]>;
  getPipelineLeadershipAssistants(ctx: DataContext): Promise<AdmissionsOperatorAssistantData[]>;
  getPipelineLeadershipRecentActivity(ctx: DataContext): Promise<AdmissionsOperatorRecentActivityData[]>;

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
  updateProgramMatchDraftConfig(ctx: DataContext, input: { voiceToneProfileId?: string | null; outcomesEnabled?: boolean; gate?: Partial<ProgramMatchGateConfig> }): Promise<ProgramMatchDraftConfig | null>;
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

  // Program Match Outcomes
  listProgramMatchOutcomes(ctx: DataContext, input?: { type?: 'priority' | 'field' | 'role' }): Promise<ProgramMatchOutcome[]>;
  createProgramMatchOutcome(ctx: DataContext, input: { type: 'priority' | 'field' | 'role'; name: string; category?: string | null; description: string }): Promise<ProgramMatchOutcome>;
  updateProgramMatchOutcome(ctx: DataContext, id: string, input: Partial<{ name: string; category?: string | null; description: string; isActive: boolean }>): Promise<ProgramMatchOutcome>;

  // Program Match Program Outcomes
  getProgramMatchProgramOutcomes(ctx: DataContext, programId: string): Promise<ProgramMatchProgramOutcomes | null>;
  updateProgramMatchProgramOutcomes(ctx: DataContext, programId: string, payload: Omit<ProgramMatchProgramOutcomes, 'programId' | 'updatedAt'>): Promise<ProgramMatchProgramOutcomes>;

  // Program Match Quiz Library
  listProgramMatchQuizzes(ctx: DataContext): Promise<ProgramMatchQuiz[]>;
  createProgramMatchQuiz(ctx: DataContext, input: { name: string }): Promise<ProgramMatchQuiz>;
  updateProgramMatchQuiz(ctx: DataContext, input: { id: string; name?: string; status?: 'archived' }): Promise<ProgramMatchQuiz>;
  
  // Program Match Quiz Draft (scoped to quiz)
  getProgramMatchQuizDraftByQuizId(ctx: DataContext, quizId: string): Promise<ProgramMatchQuizDraft | null>;
  updateProgramMatchQuizDraftByQuizId(ctx: DataContext, quizId: string, input: Partial<Omit<ProgramMatchQuizDraft, 'id' | 'quizId' | 'updatedAt'>> & { questions?: ProgramMatchQuizQuestion[] }): Promise<ProgramMatchQuizDraft>;
  
  // Program Match Quiz Publish & Versions
  listProgramMatchQuizPublishedVersions(ctx: DataContext, quizId: string): Promise<ProgramMatchQuizPublishedVersion[]>;
  publishProgramMatchQuizDraft(ctx: DataContext, quizId: string): Promise<ProgramMatchQuizPublishedVersion>;
  getProgramMatchQuizPublishedVersion(ctx: DataContext, id: string): Promise<ProgramMatchQuizPublishedVersion | null>;
  
  // Program Match Quiz AI Generation
  generateProgramMatchQuizDraftWithAI(ctx: DataContext, req: ProgramMatchQuizAIDraftRequest & { quizId: string }): Promise<ProgramMatchQuizDraft>;

  // Program Match Publish & Versioning
  listProgramMatchPublishedSnapshots(ctx: DataContext): Promise<ProgramMatchPublishSnapshot[]>;
  publishProgramMatchDraft(ctx: DataContext): Promise<ProgramMatchPublishSnapshot>;
  getProgramMatchPublishedSnapshot(ctx: DataContext, id: string): Promise<ProgramMatchPublishSnapshot | null>;

  // Program Match Preview Links
  createProgramMatchPreviewLink(ctx: DataContext, input: { mode: 'draft' | 'published'; targetId: string; expiresInDays: number }): Promise<ProgramMatchPreviewLink>;
  revokeProgramMatchPreviewLink(ctx: DataContext, id: string): Promise<void>;
  listProgramMatchPreviewLinks(ctx: DataContext, input?: { mode?: 'draft' | 'published' }): Promise<ProgramMatchPreviewLink[]>;

  // Program Match Deploy
  getProgramMatchDeployConfig(ctx: DataContext, publishedSnapshotId: string, embedType: 'js' | 'iframe', quizVersionId: string): Promise<ProgramMatchDeployConfig>;
  markProgramMatchDeployVerified(ctx: DataContext, publishedSnapshotId: string): Promise<ProgramMatchDeployConfig>;

  // Program Match Widget
  getProgramMatchWidgetConfig(ctx: DataContext, input: { publishedSnapshotId: string; quizVersionId: string }): Promise<ProgramMatchWidgetConfig | null>;

  // Program Match RFI
  createProgramMatchRFI(ctx: DataContext, input: { publishedSnapshotId: string; quizId: string; quizVersionId: string; contact: { email: string; firstName?: string; lastName?: string; phone?: string }; deploymentId?: string; pageTag?: string }): Promise<ProgramMatchRFI>;
  updateProgramMatchRFIProgress(ctx: DataContext, input: { rfiId: string; lastQuestionIndex: number }): Promise<ProgramMatchRFI>;
  completeProgramMatchRFI(ctx: DataContext, input: { rfiId: string; results: { topProgramIds: string[]; confidenceLabel: 'high' | 'medium' | 'low'; reasons: string[] } }): Promise<ProgramMatchRFI>;
  listProgramMatchCandidates(ctx: DataContext, input: { publishedSnapshotId?: string; quizId?: string; quizVersionId?: string; status?: 'started' | 'completed' | 'abandoned' | 'all'; q?: string; startedAfter?: string; startedBefore?: string; limit?: number; offset?: number }): Promise<ProgramMatchCandidatesListResponse>;
  markProgramMatchAbandons(ctx: DataContext, input: { olderThanMinutes: number }): Promise<{ marked: number }>;
  exportProgramMatchCandidatesCSV(ctx: DataContext, input: { status?: 'completed' | 'abandoned' | 'started' | 'all'; publishedSnapshotId?: string }): Promise<{ filename: string; csv: string }>;
  getProgramMatchAnalytics(ctx: DataContext, input: { publishedSnapshotId?: string; rangeDays: 7 | 30 | 90 }): Promise<ProgramMatchAnalytics>;

  // Program Match Templates
  listProgramMatchTemplates(ctx: DataContext): Promise<ProgramMatchTemplateSummary[]>;
  getProgramMatchTemplatePackage(ctx: DataContext, id: string): Promise<ProgramMatchTemplatePackage | null>;
  planApplyProgramMatchTemplate(ctx: DataContext, input: { templateId: string }): Promise<ProgramMatchTemplateApplyPlan>;
  applyProgramMatchTemplate(ctx: DataContext, input: { templateId: string }): Promise<ProgramMatchTemplateApplyResult>;

  // Program Match Scoring v2 + AI Explanations
  scoreProgramMatchResponses(ctx: DataContext, input: { publishedSnapshotId: string; answers: ProgramMatchAnswerPayload[] }): Promise<ProgramMatchScoreResult>;
  generateProgramMatchExplanations(ctx: DataContext, input: { publishedSnapshotId: string; toneProfileId: string; scoreResult: ProgramMatchScoreResult; includeOutcomes: boolean }): Promise<ProgramMatchExplanationsResult>;
  attachProgramMatchExplanationsToRFI(ctx: DataContext, input: { rfiId: string; explanations: ProgramMatchExplanationsResult }): Promise<void>;

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
  // Pipeline Team rotating games support
  games?: Array<{
    key: string;
    title: string;
    subtitle: string;
    icon?: string; // FontAwesome icon name (e.g., 'calendar-check', 'hand-holding-heart')
    todayCount?: number;
    weekCurrent: number;
    weekTarget: number;
    hint: string;
    // Per-game header overrides (optional, fallback to top-level values)
    streakDays?: number;
    streakLabel?: string;
    score?: number;
    scoreBasisLabel?: string;
    weeklyChallenge?: {
      completed: number;
      total: number;
      label: string;
    };
    status?: 'on-track' | 'slightly-behind' | 'at-risk';
  }>;
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

// Pipeline Team Forecast Data
export interface PipelineTeamForecastData {
  title: string;
  subtitle: string;
  committedAmount: number;
  mostLikelyAmount: number;
  atRiskAmount: number;
  currency: 'USD';
  confidence: 'high' | 'medium' | 'low';
  primaryRiskDriver: string;
  timeContextLabel: string;
  timeContextDateISO: string;
}

// Pipeline Leadership Forecast Data
export interface PipelineLeadershipForecastData {
  quarterGoal: number;
  forecastTotal: number; // committed + most likely
  gap: number; // forecastTotal - quarterGoal (can be negative)
  confidence: 'high' | 'medium' | 'low';
  committedAmount: number;
  mostLikelyAmount: number;
  atRiskAmount: number;
  currency: 'USD';
  primaryRiskDriver: string;
  timeContextLabel: string;
  timeContextDateISO: string;
}

// Pipeline Leadership Portfolio Health Data
export interface PipelineLeadershipPortfolioHealthData {
  title: string;
  subtitle?: string;
  metrics: Array<{
    id: string;
    label: string;
    value: string | number;
    status: 'on-track' | 'slightly-behind' | 'at-risk';
  }>;
}

// Pipeline Leadership Team Forecast Snapshot Data
export type ForecastStatus = 'on-track' | 'slightly-behind' | 'at-risk';

export interface PipelineLeadershipTeamForecastSnapshotRow {
  id: string;
  name: string;
  status: ForecastStatus;
  committedAmount: number;
  mostLikelyAmount: number;
  atRiskAmount: number;
  primaryRiskDriver: string; // short phrase, not a paragraph
  nextCloseDateISO: string; // for TimePill "Due in Xd"
}

export interface PipelineLeadershipTeamForecastSnapshotData {
  title: string;
  subtitle: string;
  timeframeLabel: 'This quarter';
  rows: PipelineLeadershipTeamForecastSnapshotRow[];
}

// Pipeline Leadership Intelligence Data
export interface PipelineLeadershipStatusSummaryData {
  statusSummary: string;
}

export interface PipelineLeadershipKeyRiskOrOpportunity {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  forecastImpactLabel: string;
  type: 'risk' | 'opportunity';
}

export interface PipelineLeadershipIntervention {
  id: string;
  title: string;
  rationale: string;
  estimatedImpact: string;
  primaryOwner?: string;
  ctas: Array<{ label: string; actionKey: string }>;
}

export interface PipelineLeadershipInsightMetric {
  id: string;
  label: string;
  value: string;
  subtext?: string;
}

export interface PipelineLeadershipInsightsData {
  outcomeCoverage: PipelineLeadershipInsightMetric[];
  flowHealth: PipelineLeadershipInsightMetric[];
  interventionImpact: PipelineLeadershipInsightMetric[];
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

export interface ProgramMatchGateConfig {
  enabled: boolean;
  requiredFields: {
    email: true;
    firstName: boolean;
    lastName: boolean;
    phone: boolean;
  };
  consent: {
    emailOptIn: boolean;
    smsOptIn: boolean;
  };
  copy: {
    headline: string;
    helperText: string;
  };
}

export interface ProgramMatchDraftConfig {
  id: string;
  status: 'draft';
  voiceToneProfileId: string | null;
  outcomesEnabled: boolean;
  gate: ProgramMatchGateConfig;
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

export interface ProgramMatchOutcome {
  id: string;
  type: 'priority' | 'field' | 'role';
  name: string;
  category?: string | null;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramMatchProgramOutcomes {
  programId: string;
  priorities: {
    strong: string[];
    moderate: string[];
  };
  fields: {
    strong: string[];
    moderate: string[];
  };
  roles: {
    strong: string[];
    moderate: string[];
  };
  updatedAt: string;
}

export interface ProgramMatchQuizOption {
  id: string;
  label: string;
  traitIds: string[];
  skillIds: string[];
  outcomeIds?: string[];
}

export interface ProgramMatchQuizQuestion {
  id: string;
  type: 'single_select' | 'multi_select' | 'scale';
  section: 'fit' | 'readiness' | 'outcomes';
  prompt: string;
  helperText?: string | null;
  options: ProgramMatchQuizOption[];
  isOptional: boolean;
}

export interface ProgramMatchQuiz {
  id: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  lastPublishedAt?: string | null;
  activePublishedVersionId?: string | null;
}

export interface ProgramMatchQuizDraft {
  id: string;
  quizId: string;
  title: string;
  description: string;
  targetLength: 8 | 9 | 10;
  updatedAt: string;
  questions: ProgramMatchQuizQuestion[];
}

export interface ProgramMatchQuizPublishedVersion {
  id: string;
  quizId: string;
  version: number;
  publishedAt: string;
  publishedBy?: string | null;
  title: string;
  description: string;
  targetLength: 8 | 9 | 10;
  questions: ProgramMatchQuizQuestion[];
}

export interface ProgramMatchQuizAIDraftRequest {
  targetLength: 8 | 9 | 10;
  includeSkillsQuestions: boolean;
  includeOutcomesQuestions: boolean;
  toneProfileId: string;
  activeTraitIds: string[];
  activeSkillIds: string[];
  activeOutcomeIds?: string[];
  programSummaries: { id: string; name: string }[];
  quizId: string;
}

export interface ProgramMatchPublishSnapshot {
  id: string;
  version: number;
  status: 'published';
  publishedAt: string;
  publishedBy?: string | null;
  draftConfig: ProgramMatchDraftConfig;
  traits: ProgramMatchTrait[];
  skills: ProgramMatchSkill[];
  outcomes?: ProgramMatchOutcome[];
  programs: ProgramMatchProgram[];
  programICPs: ProgramMatchProgramICP[];
  programOutcomes?: ProgramMatchProgramOutcomes[];
}

export interface ProgramMatchPreviewLink {
  id: string;
  mode: 'draft' | 'published';
  targetId: string;
  urlPath: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProgramMatchDeployConfig {
  id: string;
  publishedSnapshotId: string;
  quizVersionId: string;
  embedType: 'js' | 'iframe';
  snippet: string;
  verifiedAt?: string | null;
}

export interface ProgramMatchWidgetConfig {
  publishedSnapshotId: string;
  voiceToneProfileId: string;
  gate: {
    requiredFields: { email: true; firstName?: boolean; lastName?: boolean; phone?: boolean };
    placement: 'before_quiz';
    consent?: { emailOptIn?: boolean; smsOptIn?: boolean };
    headline: string;
    helperText: string;
  };
  quiz: ProgramMatchQuizDraft;
  programs: { id: string; name: string }[];
  icpByProgramId: Record<string, ProgramMatchICPBuckets>;
  outcomesEnabled: boolean;
  programOutcomesByProgramId?: Record<string, ProgramMatchProgramOutcomes>;
  updatedAt: string;
}

export interface ProgramMatchRFI {
  id: string;
  publishedSnapshotId: string;
  quizId: string;
  quizVersionId: string;
  deploymentId?: string | null;
  pageTag?: string | null;
  createdAt: string;
  contact: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  status: 'started' | 'completed' | 'abandoned';
  progress: {
    startedAt: string;
    completedAt?: string;
    lastActivityAt: string;
    lastQuestionIndex?: number;
  };
  abandonment?: {
    abandonedAt?: string;
    reason?: 'timeout' | 'manual' | 'unknown';
  };
  results?: {
    topProgramIds: string[];
    confidenceLabel: 'high' | 'medium' | 'low';
    reasons: string[];
  };
  explanations?: ProgramMatchExplanationsResult;
}

export interface ProgramMatchAnswerPayload {
  questionId: string;
  selectedOptionIds: string[];
  skipped?: boolean;
}

export interface ProgramMatchScoreResult {
  publishedSnapshotId: string;
  topProgramIds: string[];
  runnerUpProgramIds?: string[];
  programScores: Array<{ programId: string; score: number }>;
  confidenceLabel: 'high' | 'medium' | 'low';
  evidence: Array<{
    programId: string;
    topTraits: Array<{ traitId: string; bucket: 'critical' | 'veryImportant' | 'important' | 'niceToHave'; points: number }>;
    topSkills: Array<{ skillId: string; bucket: 'critical' | 'veryImportant' | 'important' | 'niceToHave'; points: number }>;
    outcomesHits?: Array<{ outcomeId: string; strength: 'strong' | 'moderate'; points: number }>;
  }>;
}

export interface ProgramMatchExplanation {
  programId: string;
  headline: string;
  bullets: string[];
  nextStepCtaLabel: string;
  nextStepCtaHelper?: string;
}

export interface ProgramMatchExplanationsResult {
  publishedSnapshotId: string;
  toneProfileId: string;
  explanations: ProgramMatchExplanation[];
  model?: string;
  generatedAt: string;
}

export interface ProgramMatchCandidatesListResponse {
  total: number;
  rows: ProgramMatchRFI[];
}

export interface ProgramMatchAnalytics {
  tiles: {
    gateSubmits: number;
    quizStarts: number;
    quizCompletes: number;
    resultsViewed: number;
    abandonRate: number;
  };
  funnel: { step: string; count: number }[];
  byDay: { date: string; gateSubmits: number; quizCompletes: number }[];
}

export interface ProgramMatchTemplateSummary {
  id: string;
  name: string;
  description: string;
  tags: string[];
  audience: 'graduate';
  includes: {
    traits: number;
    skills: number;
    outcomes: number;
    programs: number;
    icps: number;
    quiz: boolean;
  };
  updatedAt: string;
}

export interface ProgramMatchTemplatePackage {
  id: string;
  name: string;
  version: string;
  traits: Array<{ name: string; category: string; description: string }>;
  skills: Array<{ name: string; category: string; description: string }>;
  outcomes?: Array<{ type: 'priority' | 'field' | 'role'; name: string; category?: string | null; description: string }>;
  programs: Array<{
    name: string;
    status: 'draft' | 'active';
    icp: {
      traits: { critical: string[]; veryImportant: string[]; important: string[]; niceToHave: string[] };
      skills: { critical: string[]; veryImportant: string[]; important: string[]; niceToHave: string[] };
    };
    outcomes?: {
      priorities?: { strong: string[]; moderate: string[] };
      fields?: { strong: string[]; moderate: string[] };
      roles?: { strong: string[]; moderate: string[] };
    };
  }>;
  quizDraft?: {
    title: string;
    description: string;
    targetLength: 8 | 9 | 10;
    questions: Array<{
      section: 'fit' | 'readiness' | 'outcomes';
      type: 'single_select' | 'multi_select';
      prompt: string;
      helperText?: string;
      isOptional: boolean;
      options: Array<{
        label: string;
        traits?: string[];
        skills?: string[];
        outcomes?: string[];
      }>;
    }>;
  };
}

export interface ProgramMatchTemplateApplyPlan {
  templateId: string;
  willCreate: { traits: number; skills: number; outcomes: number; programs: number };
  willSkip: { traits: number; skills: number; outcomes: number; programs: number };
  warnings: string[];
}

export interface ProgramMatchTemplateApplyResult {
  appliedAt: string;
  created: { traits: number; skills: number; outcomes: number; programs: number };
  skipped: { traits: number; skills: number; outcomes: number; programs: number };
  warnings: string[];
}

