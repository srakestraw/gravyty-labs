import type { 
  DataProvider, 
  DataContext,
  AdmissionsLeadershipTrendData,
  AdmissionsLeadershipBottleneckData,
  AdmissionsLeadershipFunnelData,
  AdmissionsLeadershipData,
  AdmissionsLeadershipInsights,
  AdmissionsOperatorTodaysFocusData,
  AdmissionsOperatorGamePlanData,
  AdmissionsOperatorMomentumData,
  AdmissionsOperatorFlaggedRiskData,
  AdmissionsOperatorGoalTrackerData,
  AdmissionsOperatorAssistantData,
  AdmissionsOperatorRecentWinData,
  AdmissionsOperatorRecentActivityData,
  AdmissionsTeamGamePlanData,
  ProgramMatchHubSummary,
  ProgramMatchChecklistItem,
  ProgramMatchLibrariesSummary,
  ProgramMatchProgramsSummary,
  ProgramMatchCandidatesSummary,
  ProgramMatchAnalyticsSummary,
} from "@/lib/data/provider";

import { getMockAgentOpsItems, getMockAgentOpsItemsForWorkspace } from "@/lib/agent-ops/mock";
import { MOCK_CONTACTS } from "@/lib/contacts/mock-contacts";
import { MOCK_SEGMENTS } from "@/lib/segments/mock-segments";
import { MOCK_SEGMENTS as MOCK_SEGMENT_DEFINITIONS, getSegmentsByWorkspace } from "@/components/shared/ai-platform/segments/mock-data";
import { getMockGuardrailPolicies } from "@/lib/guardrails/mockPolicies";
import { MOCK_DO_NOT_ENGAGE } from "@/lib/do-not-engage/mockDoNotEngage";
import type { QueueItem } from "@/lib/data/provider";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mockProvider: DataProvider = {
  async listQueueItems(ctx: DataContext) {
    await delay(150);
    let items: QueueItem[];

    // Filter by workspace if provided
    if (ctx.workspace) {
      items = getMockAgentOpsItemsForWorkspace(ctx.workspace);
    } else {
      items = getMockAgentOpsItems();
    }

    // Filter by app if provided (queue items have role which maps to app context)
    if (ctx.app) {
      // Map app IDs to roles for filtering
      const appRoleMap: Record<string, string> = {
        'student-lifecycle': 'Admissions', // default for student-lifecycle
        'advancement': 'Advancement',
      };
      const targetRole = appRoleMap[ctx.app];
      if (targetRole) {
        items = items.filter((item) => item.role === targetRole || (item.role as string) === 'All');
      }
    }

    // Filter by user if provided (items have assignedTo field)
    if (ctx.userId) {
      items = items.filter((item) => !item.assignedTo || item.assignedTo === ctx.userId);
    }

    // Filter by mode if provided (leadership mode might show different items)
    // For now, mode filtering is handled by the UI layer, but we can add logic here if needed
    // if (ctx.mode === 'leadership') {
    //   items = items.filter((item) => item.severity === 'Critical' || item.severity === 'High');
    // }

    return items;
  },

  async listContacts(_ctx: DataContext) {
    await delay(150);
    return MOCK_CONTACTS;
  },

  async getContact(_ctx: DataContext, id: string) {
    await delay(100);
    return MOCK_CONTACTS.find((c) => c.id === id) ?? null;
  },

  async listSegments(_ctx: DataContext) {
    await delay(150);
    return MOCK_SEGMENTS;
  },

  async getSegment(_ctx: DataContext, id: string) {
    await delay(100);
    return MOCK_SEGMENTS.find((s) => s.id === id) ?? null;
  },

  async listSegmentDefinitions(ctx: DataContext) {
    await delay(150);
    // Filter segments by workspace/app context if provided
    if (ctx.workspace || ctx.app) {
      return getSegmentsByWorkspace(ctx.workspace, ctx.app);
    }
    return MOCK_SEGMENT_DEFINITIONS;
  },

  async getSegmentDefinition(_ctx: DataContext, id: string) {
    await delay(100);
    return MOCK_SEGMENT_DEFINITIONS.find((s) => s.id === id) ?? null;
  },

  async listGuardrailPolicies(_ctx: DataContext) {
    await delay(100);
    return getMockGuardrailPolicies();
  },

  async listDoNotEngage(_ctx: DataContext) {
    await delay(100);
    return MOCK_DO_NOT_ENGAGE;
  },

  // Admissions Leadership Charts
  async getAdmissionsLeadershipTrend(ctx: DataContext): Promise<AdmissionsLeadershipTrendData | null> {
    await delay(150);
    
    // Only return data for admissions workspace in leadership mode
    if (ctx.workspace !== 'admissions' || ctx.mode !== 'leadership') {
      return null;
    }

    // Return placeholder-safe data
    const dates: string[] = [];
    const deposits: number[] = [];
    const today = new Date();
    
    // Generate last 14 days of data
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
      // Simulate deposit trend (slight upward trend)
      deposits.push(28 + Math.floor(Math.random() * 8) + (13 - i) * 0.5);
    }

    return { dates, deposits };
  },

  async getAdmissionsLeadershipBottlenecks(ctx: DataContext): Promise<AdmissionsLeadershipBottleneckData[]> {
    await delay(150);
    
    // Only return data for admissions workspace in leadership mode
    if (ctx.workspace !== 'admissions' || ctx.mode !== 'leadership') {
      return [];
    }

    // Return placeholder-safe data
    return [
      {
        stage: 'Missing Transcript',
        currentDays: 9.4,
        targetDays: 5,
      },
      {
        stage: 'Application Review',
        currentDays: 12.2,
        targetDays: 7,
      },
      {
        stage: 'Admit → Deposit',
        currentDays: 18.5,
        targetDays: 10,
      },
    ];
  },

  async getAdmissionsLeadershipFunnel(ctx: DataContext): Promise<AdmissionsLeadershipFunnelData | null> {
    await delay(150);
    
    // Only return data for admissions workspace in leadership mode
    if (ctx.workspace !== 'admissions' || ctx.mode !== 'leadership') {
      return null;
    }

    // Return placeholder-safe data
    return {
      stages: [
        {
          label: 'Applications',
          count: 2184,
        },
        {
          label: 'Under Review',
          count: 1520,
          conversionRate: 69.6,
        },
        {
          label: 'Admitted',
          count: 1012,
          conversionRate: 46.3,
        },
        {
          label: 'Deposited',
          count: 436,
          conversionRate: 20.0,
        },
      ],
    };
  },

  // Admissions Leadership Command Center
  async getAdmissionsLeadershipData(ctx: DataContext): Promise<AdmissionsLeadershipData | null> {
    await delay(150);
    
    if (ctx.workspace !== 'admissions' || ctx.mode !== 'leadership') {
      return null;
    }

    return {
      alignmentSummary: "Today's team focus aligns with reducing transcript friction and review delays.",
      statusSummary: "Based on current pipeline velocity and conversion rates, Admissions is forecasted to land approximately 30 deposits below target unless mid-funnel bottlenecks are addressed. While application volume is down versus plan, this is an upstream demand signal rather than an admissions execution issue. The primary controllable risk remains review delays and transcript friction.",
      keyRisksAndOpportunities: [
        {
          id: 'review-delays',
          title: 'Mid-Funnel Review Delays Increasing',
          description: 'Application review throughput declined 22% this week, with Business School programs experiencing capacity constraints.',
          forecastImpact: 'Review delays are contributing to a projected 12-deposit shortfall.',
          severity: 'high',
        },
        {
          id: 'transcript-friction',
          title: 'Transcript Requirements Stalling High-Intent Applicants',
          description: 'Average time in transcript collection stage is 9.4 days, nearly double the 5-day target, with 120 applicants currently stalled.',
          forecastImpact: 'Transcript friction is contributing to a projected 15-deposit shortfall, particularly among high-intent applicants who convert at 2× the average rate.',
          severity: 'high',
        },
        {
          id: 'engineering-success',
          title: 'Engineering Programs Outperforming Plan',
          description: 'Engineering programs are demonstrating effective conversion strategies that could be applied to underperforming programs.',
          forecastImpact: 'Applying similar tactics to MBA and Nursing programs could recover an estimated 8–10 deposits.',
          severity: 'opportunity',
        },
      ],
      upstreamDemandSignals: [
        'Application volume is down 4% versus plan (upstream demand signal, not an admissions execution issue).',
        'Inquiry-to-application conversion remains steady, indicating consistent marketing effectiveness.',
      ],
      whatChanged: [
        'Application review backlog increased 37% week over week, extending forecasted time-to-decision.',
        'Deposit conversion declined following the March 1 reminder, contributing to the projected shortfall.',
        'High-intent applicants converted at twice the average rate, highlighting the value of reducing friction for this segment.',
        'Transcript collection stage dwell time increased from 7.2 to 9.4 days, directly impacting forecasted deposit timing.',
      ],
      recommendedInterventions: [
        {
          id: 'reduce-transcript-friction',
          title: 'Reduce transcript friction for high-intent applicants',
          description: 'to recover an estimated 25–30 deposits and improve forecasted outcome.',
          impactText: '25–30 deposits',
          ownerLabel: 'Admissions Ops',
          cta: { label: 'Adjust transcript rules' },
        },
        {
          id: 'reassign-reviewers',
          title: 'Reassign 2 reviewers to MBA pipeline',
          description: 'to address capacity constraints and recover an estimated 10–12 deposits, improving forecasted outcome.',
          impactText: '10–12 deposits',
          ownerLabel: 'Admissions Leadership',
          cta: { label: 'Reallocate reviewers' },
        },
        {
          id: 'deposit-reminder',
          title: 'Launch targeted deposit reminder campaign',
          description: 'for admits who have been admitted for more than 10 days without depositing, with an estimated impact of 15–20 additional deposits to improve forecasted outcome.',
          impactText: '15–20 deposits',
          ownerLabel: 'Marketing/CRM',
          cta: { label: 'Launch deposit reminder' },
        },
      ],
      interventionToTeamNote: "These interventions will generate updated team priorities in Today's Game Plan over the next 7–10 days.",
      whatToWatchNext: [
        'Deposit response to next outreach within 48 hours (validates forecast trajectory)',
        'Review backlog trend after capacity reallocation (indicates whether forecast is improving)',
        'Yield movement by program (signals whether forecasted shortfall is narrowing or widening)',
      ],
    };
  },

  async getAdmissionsLeadershipInsights(ctx: DataContext): Promise<AdmissionsLeadershipInsights | null> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions' || ctx.mode !== 'leadership') {
      return null;
    }

    return {
      outcomeCoverage: [
        {
          id: 'stalled-addressed',
          label: 'Stalled applicants addressed',
          value: '68%',
          subtext: '142 of 208 stalled applicants',
        },
        {
          id: 'admits-touched',
          label: 'Admits touched before deposit deadline',
          value: '84%',
          subtext: '378 of 450 admits',
        },
      ],
      flowHealth: [
        {
          id: 'avg-review-days',
          label: 'Avg days in review',
          value: '12.2 days',
          subtext: 'Target: 7 days',
        },
        {
          id: 'dwell-time-change',
          label: 'Week-over-week dwell time change',
          value: '+2.1 days',
          subtext: 'Increased from 10.1 to 12.2',
        },
      ],
      interventionImpact: [
        {
          id: 'impact-since-intervention',
          label: 'Impact since last intervention',
          value: '23 applicants moved forward',
          subtext: 'After transcript rule adjustment',
        },
        {
          id: 'forecast-change',
          label: 'Forecast change since action',
          value: '+8 deposits',
          subtext: 'Projected improvement',
        },
      ],
    };
  },

  // Admissions Operator Command Center
  async getAdmissionsOperatorTodaysFocus(ctx: DataContext): Promise<AdmissionsOperatorTodaysFocusData | null> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'admissions' || normalizedMode !== 'team') {
      return null;
    }

    return {
      text: 'Reduce stalled applicants, clear missing documents, and prevent melt for high-intent admits.',
    };
  },

  async getAdmissionsOperatorGamePlan(ctx: DataContext): Promise<AdmissionsOperatorGamePlanData | null> {
    await delay(150);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'admissions' || normalizedMode !== 'team') {
      return null;
    }

    // Simulate some tasks as completed for demo purposes
    const now = new Date();
    const recentlyCompleted = new Date(now.getTime() - 2 * 60 * 1000); // 2 minutes ago
    
    return {
      total: 3,
      completed: 1, // One task completed (change to 3 to see completion summary)
      todaysProgressSummary: {
        movedForwardCount: 12,
        narrative: "You've moved 12 applicants forward today.",
      },
      // PHASE 4: Completion summary (shown when completed === total)
      completionSummary: "Today's Game Plan complete. You reduced stall risk across 27 applications.",
      // Coach message: narrative encouragement
      coachMessage: "Your consistent outreach is making a real difference. Today, focus on those high-risk students—early intervention now can change their entire trajectory.",
      items: [
        {
          id: 'stalled-applicants',
          title: 'Reach out to 15 applicants who stalled this week',
          description: 'No portal activity for 7+ days, many are missing only 1–2 items.',
          impactHint: 'Unblocking them can meaningfully boost completion before deadlines.',
          status: 'completed',
          completedAt: recentlyCompleted.toISOString(),
          lastOutcomeSummary: '→ 4 applications moved closer to review',
          goalImpacts: [
            { goalId: 'apps-completed', deltaLabel: 'Completed applications', deltaValue: 4 },
          ],
          ctas: [
            { label: 'Open', href: '/student-lifecycle/admissions/agent-ops/queue?filter=stalled' },
            { label: 'Let AI suggest next step', href: '/student-lifecycle/admissions/ai-assistants/assistant' },
          ],
        },
        {
          id: 'missing-documents',
          title: 'Clear missing documents for 20 applicants',
          description: 'Transcripts and recommendation letters are the most common blockers.',
          impactHint: 'Completing these moves applications closer to review-ready status.',
          status: 'open',
          goalImpacts: [
            { goalId: 'apps-completed', deltaLabel: 'Completed applications', deltaValue: 6 },
          ],
          ctas: [
            { label: 'Open', href: '/student-lifecycle/admissions/agent-ops/queue?filter=missing-docs' },
            { label: 'Let AI suggest next step', href: '/student-lifecycle/admissions/ai-assistants/assistant' },
          ],
        },
        {
          id: 'melt-risk',
          title: 'Support 10 admits at melt risk',
          description: 'Admitted but low engagement—reach out before they commit elsewhere.',
          impactHint: 'Early intervention can recover 2–3 deposits that would otherwise be lost.',
          status: 'open',
          goalImpacts: [
            { goalId: 'deposits', deltaLabel: 'Deposits', deltaValue: 2 },
          ],
          ctas: [
            { label: 'Open', href: '/student-lifecycle/admissions/agent-ops/queue?filter=melt-risk' },
            { label: 'Let AI suggest next step', href: '/student-lifecycle/admissions/ai-assistants/assistant' },
          ],
        },
      ],
    };
  },

  async getAdmissionsOperatorMomentum(ctx: DataContext): Promise<AdmissionsOperatorMomentumData | null> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'admissions' || normalizedMode !== 'team') {
      return null;
    }

    return {
      streakDays: 3,
      weeklyChallenge: {
        completed: 9,
        total: 25,
        label: 'Weekly challenge',
      },
      score: 76,
    };
  },

  async getAdmissionsOperatorFlaggedRisks(ctx: DataContext): Promise<AdmissionsOperatorFlaggedRiskData[]> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'admissions' || normalizedMode !== 'team') {
      return [];
    }

    return [
      {
        id: 'high-stall-rate',
        title: 'Stall rate increased 15% this week',
        description: 'More applicants going 7+ days without activity than last week.',
        severity: 'high',
      },
      {
        id: 'transcript-delays',
        title: 'Transcript collection delays',
        description: 'Average time in transcript stage is 9.4 days (target: 5).',
        severity: 'medium',
      },
    ];
  },

  async getAdmissionsOperatorGoalTracker(ctx: DataContext): Promise<AdmissionsOperatorGoalTrackerData | null> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'admissions' || normalizedMode !== 'team') {
      return null;
    }

    return {
      title: 'Goal Tracker',
      timeframeLabel: 'This admissions cycle',
      subtitle: "Track how you're progressing against key application goals.",
      metrics: [
        {
          id: 'apps-started',
          label: 'Applications started',
          current: 320,
          target: 400,
          unit: 'apps',
          trend: 'up',
        },
        {
          id: 'apps-completed',
          label: 'Completed applications',
          current: 240,
          target: 300,
          unit: 'apps',
          trend: 'up',
        },
        {
          id: 'admits',
          label: 'Admits',
          current: 180,
          target: 220,
          unit: 'admits',
          trend: 'flat',
        },
        {
          id: 'deposits',
          label: 'Deposits',
          current: 90,
          target: 120,
          unit: 'deposits',
          trend: 'up',
        },
      ],
    };
  },

  async getAdmissionsOperatorAssistants(ctx: DataContext): Promise<AdmissionsOperatorAssistantData[]> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'admissions' || normalizedMode !== 'team') {
      return [];
    }

    return [
      {
        id: '1',
        name: 'Application Progress Assistant',
        status: 'active',
        description: 'Reduce stalled applicants',
        impact: '38% fewer stalled applications (last 7 days)',
      },
      {
        id: '2',
        name: 'Missing Documents Assistant',
        status: 'draft',
        description: 'Increase transcript & recommendation completion',
      },
      {
        id: '3',
        name: 'Melt Prevention Assistant',
        status: 'paused',
        description: 'Reduce melt between admit and deposit',
        impact: '17% fewer no-shows (last run period)',
      },
    ];
  },

  async getAdmissionsOperatorRecentWins(ctx: DataContext): Promise<AdmissionsOperatorRecentWinData[]> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'admissions' || normalizedMode !== 'team') {
      return [];
    }

    return [
      {
        id: 'win-1',
        text: '38% fewer stalled applications',
        detail: 'Application Progress Assistant helped move 47 applicants forward this week.',
        assistantName: 'Application Progress Assistant',
      },
      {
        id: 'win-2',
        text: '23 missing transcripts identified',
        detail: 'Missing Documents Assistant flagged applicants needing follow-up.',
        assistantName: 'Missing Documents Assistant',
      },
    ];
  },

  async getAdmissionsOperatorRecentActivity(ctx: DataContext): Promise<AdmissionsOperatorRecentActivityData[]> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'admissions' || normalizedMode !== 'team') {
      return [];
    }

    return [
      {
        id: 'activity-1',
        timestamp: '10:42 AM',
        text: 'Application Progress Assistant flagged 8 new stalled applicants',
      },
      {
        id: 'activity-2',
        timestamp: '9:15 AM',
        text: 'Missing Documents Assistant identified 23 missing transcripts',
      },
      {
        id: 'activity-3',
        timestamp: '8:02 AM',
        text: 'Melt Prevention Assistant escalated 3 admits for advisor follow-up',
      },
      {
        id: 'activity-4',
        timestamp: 'Yesterday 4:21 PM',
        text: '17 stalled applicants moved forward after reminders',
      },
    ];
  },

  // Admissions Team Game Plan (for Queue integration)
  async getAdmissionsTeamGamePlan(ctx: DataContext): Promise<AdmissionsTeamGamePlanData | null> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'admissions' || (normalizedMode !== 'team' && ctx.mode !== 'leadership')) {
      return null;
    }

    // Get the game plan from the operator game plan and extract objectives
    const gamePlan = await this.getAdmissionsOperatorGamePlan(ctx);
    if (!gamePlan) {
      return null;
    }

    return {
      completedCount: gamePlan.completed,
      totalCount: gamePlan.total,
      objectives: gamePlan.items.map((item) => ({
        id: item.id,
        title: item.title,
        shortTitle: item.title,
        description: item.description,
        impactText: item.impactHint,
      })),
    };
  },

  async getAdmissionsQueueGamePlanCounts(ctx: DataContext): Promise<Record<string, number>> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return {};
    }

    // Get all queue items for the context
    const items = await this.listQueueItems(ctx);
    
    // Map items to objectives based on tags
    const objectiveIds = ['stalled-applicants', 'missing-documents', 'melt-risk'];
    const counts: Record<string, number> = {};
    
    for (const objectiveId of objectiveIds) {
      counts[objectiveId] = items.filter((item) => 
        itemMatchesObjective(item, objectiveId)
      ).length;
    }

    return counts;
  },

  async getAdmissionsQueueItemsByObjective(ctx: DataContext, objectiveId: string, limit?: number): Promise<QueueItem[]> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return [];
    }

    // Get all queue items for the context
    const items = await this.listQueueItems(ctx);
    
    // Filter items that match the objective
    let matchingItems = items.filter((item) => itemMatchesObjective(item, objectiveId));
    
    // Apply limit if provided
    if (limit !== undefined && limit > 0) {
      matchingItems = matchingItems.slice(0, limit);
    }

    return matchingItems;
  },

  // Program Match
  async getProgramMatchHubSummary(ctx: DataContext): Promise<ProgramMatchHubSummary | null> {
    await delay(100);
    
    // Only return data for admissions workspace
    if (ctx.workspace !== 'admissions') {
      return null;
    }

    return {
      status: 'draft',
      lastUpdated: new Date().toISOString(),
      progressPercent: 0,
    };
  },

  async getProgramMatchChecklist(ctx: DataContext): Promise<ProgramMatchChecklistItem[]> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return [];
    }

    return [
      {
        id: 'checklist-1',
        label: 'Configure voice and tone',
        state: 'not_started',
        sectionId: 'voice-tone',
      },
      {
        id: 'checklist-2',
        label: 'Set up lead capture gate',
        state: 'not_started',
        sectionId: 'lead-capture',
      },
      {
        id: 'checklist-3',
        label: 'Build trait and skill libraries',
        state: 'not_started',
        sectionId: 'libraries',
      },
      {
        id: 'checklist-4',
        label: 'Define program ICPs',
        state: 'not_started',
        sectionId: 'program-icp',
      },
      {
        id: 'checklist-5',
        label: 'Create quiz questions',
        state: 'not_started',
        sectionId: 'quiz',
      },
      {
        id: 'checklist-6',
        label: 'Preview and deploy',
        state: 'not_started',
        sectionId: 'preview-deploy',
      },
    ];
  },

  async getProgramMatchLibrariesSummary(ctx: DataContext): Promise<ProgramMatchLibrariesSummary | null> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return null;
    }

    return {
      traitsCount: 0,
      skillsCount: 0,
      outcomesEnabled: false,
    };
  },

  async getProgramMatchProgramsSummary(ctx: DataContext): Promise<ProgramMatchProgramsSummary | null> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return null;
    }

    return {
      activeProgramsCount: 0,
      draftProgramsCount: 0,
      programs: [],
    };
  },

  async getProgramMatchCandidatesSummary(ctx: DataContext): Promise<ProgramMatchCandidatesSummary | null> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return null;
    }

    return {
      columns: [
        { id: 'name', label: 'Name' },
        { id: 'email', label: 'Email' },
        { id: 'matchedProgram', label: 'Matched Program' },
        { id: 'score', label: 'Match Score' },
        { id: 'completedAt', label: 'Completed At' },
      ],
      rows: [],
    };
  },

  async getProgramMatchAnalyticsSummary(ctx: DataContext): Promise<ProgramMatchAnalyticsSummary | null> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return null;
    }

    return {
      tiles: [
        {
          id: 'total-completions',
          label: 'Total Completions',
          value: 0,
        },
        {
          id: 'unique-visitors',
          label: 'Unique Visitors',
          value: 0,
        },
        {
          id: 'completion-rate',
          label: 'Completion Rate',
          value: '0%',
        },
        {
          id: 'avg-match-score',
          label: 'Avg Match Score',
          value: '0.0',
        },
      ],
    };
  },

};

// Helper function to map queue items to objectives based on tags
function itemMatchesObjective(item: QueueItem, objectiveId: string): boolean {
  const tags = item.tags || [];
  const titleLower = item.title.toLowerCase();
  const summaryLower = item.summary.toLowerCase();
  
  switch (objectiveId) {
    case 'stalled-applicants':
      // Items tagged stalled, inactive, no-activity, incomplete-application
      return (
        tags.some(tag => 
          ['stalled', 'inactive', 'no-activity', 'incomplete-app', 'incomplete-application'].includes(tag.toLowerCase())
        ) ||
        titleLower.includes('stalled') ||
        titleLower.includes('incomplete') ||
        summaryLower.includes('stalled') ||
        summaryLower.includes('no activity')
      );
    
    case 'missing-documents':
      // Items tagged missing-transcript, missing-docs, verification, recommendation-letter
      return (
        tags.some(tag => 
          ['missing-transcript', 'missing-docs', 'verification', 'recommendation-letter', 'transcript', 'missing'].includes(tag.toLowerCase())
        ) ||
        titleLower.includes('missing') ||
        titleLower.includes('transcript') ||
        titleLower.includes('document') ||
        summaryLower.includes('missing') ||
        summaryLower.includes('transcript')
      );
    
    case 'melt-risk':
      // Items tagged melt-risk, deposit-window, admitted-no-deposit, high-intent
      return (
        tags.some(tag => 
          ['melt-risk', 'deposit-window', 'admitted-no-deposit', 'high-intent', 'deposit'].includes(tag.toLowerCase())
        ) ||
        titleLower.includes('melt') ||
        titleLower.includes('deposit') ||
        titleLower.includes('admitted') ||
        summaryLower.includes('melt') ||
        summaryLower.includes('deposit')
      );
    
    default:
      return false;
  }
}

