/**
 * Advancement Pipeline Provider Implementation
 *
 * Implements pipeline-specific methods for the Advancement AI Assistant.
 * Uses mock data initially; all data access goes through this provider.
 * Mock data counts are consistent: 6 high, 10 medium, 8 low = 24 stalled prospects.
 */

import type {
  UserContext,
  ProviderResponse,
  StalledSummary,
  PriorityBucket,
  PriorityProspectRow,
  ProspectDetail,
  LikelyToGiveProspect,
} from './types';
import { successResponse, errorResponse } from './types';

// ============================================================================
// Mock Data - Counts must match: 6 high, 10 medium, 8 low = 24 total
// ============================================================================

const MOCK_STALLED_SUMMARY: StalledSummary = {
  stalledCount: 24,
  highCount: 6,
  mediumCount: 10,
  lowCount: 8,
};

// Advancement agent IDs for suggestedAgentIds (from getAdvancementAgentOptions)
const AGENT_DONOR_WARMUP = 'agent-donor-warmup';
const AGENT_FLOW_REENGAGEMENT = 'agent-flow-prospect-reengagement';

const MOCK_PRIORITY_PROSPECTS: PriorityProspectRow[] = [
  // HIGH PRIORITY (6)
  {
    id: 'p1',
    name: 'Margaret Chen',
    subtitle: 'Class of 1998',
    priority: 'high',
    lastActivity: '8 days ago',
    stallReasons: ['No recent touchpoints', 'Open ask with no activity'],
    officer: 'Sarah Mitchell',
    activeAgents: ['Donor Warm-Up Agent'],
    suggestedAgentIds: [AGENT_FLOW_REENGAGEMENT, AGENT_DONOR_WARMUP],
  },
  {
    id: 'p2',
    name: 'Robert Williams',
    subtitle: 'Major Donor',
    priority: 'high',
    lastActivity: '7 days ago',
    stallReasons: ['Overdue follow-up', 'No recent touchpoints'],
    officer: 'James Park',
    activeAgents: [],
    suggestedAgentIds: [AGENT_DONOR_WARMUP, AGENT_FLOW_REENGAGEMENT],
  },
  {
    id: 'p3',
    name: 'Elizabeth Davis',
    subtitle: 'Class of 2005',
    priority: 'high',
    lastActivity: '9 days ago',
    stallReasons: ['Open ask with no activity'],
    officer: 'Sarah Mitchell',
    activeAgents: ['Donor Warm-Up Agent'],
    suggestedAgentIds: [AGENT_DONOR_WARMUP],
  },
  {
    id: 'p4',
    name: 'David Martinez',
    subtitle: 'Board Member',
    priority: 'high',
    lastActivity: '10 days ago',
    stallReasons: ['Overdue follow-up', 'Open ask with no activity'],
    officer: 'James Park',
    activeAgents: [],
    suggestedAgentIds: [AGENT_DONOR_WARMUP, AGENT_FLOW_REENGAGEMENT],
  },
  {
    id: 'p5',
    name: 'Patricia Thompson',
    subtitle: 'Class of 1985',
    priority: 'high',
    lastActivity: '8 days ago',
    stallReasons: ['No recent touchpoints', 'Overdue follow-up'],
    officer: 'Sarah Mitchell',
    activeAgents: ['Donor Warm-Up Agent'],
    suggestedAgentIds: [AGENT_FLOW_REENGAGEMENT],
  },
  {
    id: 'p6',
    name: 'Christopher Lee',
    subtitle: 'Leadership Council',
    priority: 'high',
    lastActivity: '7 days ago',
    stallReasons: ['Open ask with no activity'],
    officer: 'James Park',
    activeAgents: [],
    suggestedAgentIds: [AGENT_DONOR_WARMUP, AGENT_FLOW_REENGAGEMENT],
  },
  // MEDIUM PRIORITY (10)
  {
    id: 'p7',
    name: 'Thomas Anderson',
    subtitle: 'Class of 1992',
    priority: 'medium',
    lastActivity: '5 days ago',
    stallReasons: ['No recent touchpoints'],
    officer: 'James Park',
    activeAgents: [],
    suggestedAgentIds: [AGENT_DONOR_WARMUP],
  },
  {
    id: 'p8',
    name: 'Jennifer Lopez',
    subtitle: 'Leadership Council',
    priority: 'medium',
    lastActivity: '6 days ago',
    stallReasons: ['Open ask with no activity'],
    officer: 'Sarah Mitchell',
    activeAgents: ['Pipeline Agent'],
    suggestedAgentIds: [],
  },
  {
    id: 'p9',
    name: 'Susan Wright',
    subtitle: 'Class of 2000',
    priority: 'medium',
    lastActivity: '5 days ago',
    stallReasons: ['No recent touchpoints'],
    officer: 'James Park',
    activeAgents: [],
    suggestedAgentIds: [AGENT_DONOR_WARMUP],
  },
  {
    id: 'p10',
    name: 'Daniel Kim',
    subtitle: 'Young Alumni',
    priority: 'medium',
    lastActivity: '6 days ago',
    stallReasons: ['Open ask with no activity'],
    officer: 'Sarah Mitchell',
    activeAgents: ['Pipeline Agent'],
    suggestedAgentIds: [AGENT_DONOR_WARMUP],
  },
  {
    id: 'p11',
    name: 'Nancy Garcia',
    subtitle: 'Class of 1978',
    priority: 'medium',
    lastActivity: '5 days ago',
    stallReasons: ['No recent touchpoints'],
    officer: 'James Park',
    activeAgents: [],
    suggestedAgentIds: [AGENT_DONOR_WARMUP],
  },
  {
    id: 'p12',
    name: 'Kevin O\'Brien',
    subtitle: 'Major Donor',
    priority: 'medium',
    lastActivity: '6 days ago',
    stallReasons: ['Open ask with no activity'],
    officer: 'Sarah Mitchell',
    activeAgents: ['Pipeline Agent'],
    suggestedAgentIds: [],
  },
  {
    id: 'p13',
    name: 'Linda Foster',
    subtitle: 'Class of 1995',
    priority: 'medium',
    lastActivity: '5 days ago',
    stallReasons: ['No recent touchpoints'],
    officer: 'James Park',
    activeAgents: [],
    suggestedAgentIds: [AGENT_DONOR_WARMUP],
  },
  {
    id: 'p14',
    name: 'Mark Johnson',
    subtitle: 'Corporate Partner',
    priority: 'medium',
    lastActivity: '6 days ago',
    stallReasons: ['Open ask with no activity'],
    officer: 'Sarah Mitchell',
    activeAgents: [],
    suggestedAgentIds: [AGENT_DONOR_WARMUP, AGENT_FLOW_REENGAGEMENT],
  },
  {
    id: 'p15',
    name: 'Rebecca Moore',
    subtitle: 'Class of 2012',
    priority: 'medium',
    lastActivity: '5 days ago',
    stallReasons: ['No recent touchpoints'],
    officer: 'James Park',
    activeAgents: ['Pipeline Agent'],
    suggestedAgentIds: [],
  },
  {
    id: 'p16',
    name: 'Steven Clark',
    subtitle: 'Leadership Council',
    priority: 'medium',
    lastActivity: '6 days ago',
    stallReasons: ['Open ask with no activity'],
    officer: 'Sarah Mitchell',
    activeAgents: [],
    suggestedAgentIds: [AGENT_DONOR_WARMUP],
  },
  // LOW PRIORITY (8)
  {
    id: 'p17',
    name: 'Michael Brown',
    subtitle: 'Class of 2010',
    priority: 'low',
    lastActivity: '4 days ago',
    stallReasons: [],
    officer: 'James Park',
    activeAgents: [],
    suggestedAgentIds: [AGENT_DONOR_WARMUP],
  },
  {
    id: 'p18',
    name: 'Amanda Taylor',
    subtitle: 'Class of 2015',
    priority: 'low',
    lastActivity: '3 days ago',
    stallReasons: [],
    officer: 'Sarah Mitchell',
    activeAgents: ['Pipeline Agent'],
    suggestedAgentIds: [],
  },
  {
    id: 'p19',
    name: 'Brian Wilson',
    subtitle: 'Young Alumni',
    priority: 'low',
    lastActivity: '4 days ago',
    stallReasons: [],
    officer: 'James Park',
    activeAgents: [],
    suggestedAgentIds: [AGENT_DONOR_WARMUP],
  },
  {
    id: 'p20',
    name: 'Jessica Hall',
    subtitle: 'Class of 2008',
    priority: 'low',
    lastActivity: '3 days ago',
    stallReasons: [],
    officer: 'Sarah Mitchell',
    activeAgents: [],
    suggestedAgentIds: [AGENT_DONOR_WARMUP],
  },
  {
    id: 'p21',
    name: 'Matthew Davis',
    subtitle: 'Class of 2018',
    priority: 'low',
    lastActivity: '4 days ago',
    stallReasons: [],
    officer: 'James Park',
    activeAgents: ['Pipeline Agent'],
    suggestedAgentIds: [],
  },
  {
    id: 'p22',
    name: 'Rachel Green',
    subtitle: 'Class of 2014',
    priority: 'low',
    lastActivity: '3 days ago',
    stallReasons: [],
    officer: 'Sarah Mitchell',
    activeAgents: [],
    suggestedAgentIds: [AGENT_DONOR_WARMUP],
  },
  {
    id: 'p23',
    name: 'Andrew Harris',
    subtitle: 'Young Alumni',
    priority: 'low',
    lastActivity: '4 days ago',
    stallReasons: [],
    officer: 'James Park',
    activeAgents: [],
    suggestedAgentIds: [],
  },
  {
    id: 'p24',
    name: 'Emily Martinez',
    subtitle: 'Class of 2016',
    priority: 'low',
    lastActivity: '3 days ago',
    stallReasons: [],
    officer: 'Sarah Mitchell',
    activeAgents: ['Pipeline Agent'],
    suggestedAgentIds: [],
  },
];

// Base prospect detail factory for consistent structure
function createProspectDetail(
  overrides: Partial<ProspectDetail> & Pick<ProspectDetail, 'id' | 'name' | 'officer' | 'lastActivity' | 'priority'>
): ProspectDetail {
  const base = {
    overview: `${overrides.name} is in the pipeline and may need follow-up.`,
    currentFindings: [] as string[],
    whyStalled: [] as string[],
    recentActions: [] as ProspectDetail['recentActions'],
    whatHappensNext: 'Consider scheduling a follow-up touchpoint.',
    recommendedNextSteps: [
      { label: 'Create task', action: 'create-task' },
      { label: 'Draft email', action: 'draft-email' },
      { label: 'Send email', action: 'send-email' },
      { label: 'Tag for follow-up', action: 'tag-follow-up' },
      { label: 'Open profile', action: 'open-profile' },
      { label: 'Flag for manager review', action: 'flag-manager' },
    ],
    timeline: [] as ProspectDetail['timeline'],
  };
  return { ...base, ...overrides } as ProspectDetail;
}

const MOCK_PROSPECT_DETAILS: Record<string, ProspectDetail> = {
  p1: createProspectDetail({
    id: 'p1',
    name: 'Margaret Chen',
    officer: 'Sarah Mitchell',
    lastActivity: '8 days ago',
    segment: 'Major Donor',
    priority: 'high',
    stage: 'Cultivation',
    overview:
      'Margaret is a high-priority prospect who has stalled in the pipeline. She has expressed interest in the scholarship fund but has had no touchpoints in the past week.',
    currentFindings: [
      'No contact in the last 8 days',
      'Open ask for $50K scholarship fund',
      'Previously engaged with stewardship emails',
    ],
    whyStalled: [
      'Waiting for proposal review',
      'No follow-up scheduled after last call',
      'May need personal outreach from officer',
    ],
    recentActions: [
      { timestamp: '8 days ago', action: 'Call logged', detail: 'Discussed scholarship fund opportunity' },
      { timestamp: '12 days ago', action: 'Email sent', detail: 'Proposal summary and next steps' },
      { timestamp: '14 days ago', action: 'Pipeline Agent activated', detail: 'Started monitoring prospect activity' },
    ],
    whatHappensNext:
      'The Pipeline Agent will continue monitoring. A personal follow-up call from the officer is recommended to re-engage.',
    timeline: [
      { timestamp: '2 hours ago', action: 'Agent check', detail: 'Pipeline Agent reviewed status' },
      { timestamp: '14 days ago', action: 'Agent activated', detail: 'Pipeline Agent started monitoring' },
      { timestamp: '12 days ago', action: 'Email sent', detail: 'Proposal summary sent' },
      { timestamp: '8 days ago', action: 'Call logged', detail: 'Discussed scholarship fund' },
    ],
  }),
  p2: createProspectDetail({
    id: 'p2',
    name: 'Robert Williams',
    officer: 'James Park',
    lastActivity: '7 days ago',
    segment: 'Major Donor',
    priority: 'high',
    stage: 'Solicitation',
    overview:
      'Robert is a major donor prospect with an overdue follow-up. He indicated interest in naming a space but has not responded to the last outreach.',
    currentFindings: [
      'Overdue follow-up by 3 days',
      'No response to last email',
      'High capacity rating',
    ],
    whyStalled: [
      'Follow-up task not completed',
      'May be traveling',
      'Needs different outreach approach',
    ],
    recentActions: [
      { timestamp: '7 days ago', action: 'Email sent', detail: 'Naming opportunity proposal' },
      { timestamp: '10 days ago', action: 'Call logged', detail: 'Initial discussion of naming' },
    ],
    whatHappensNext:
      'Immediate follow-up recommended. Consider a personal call or alternative contact method.',
    timeline: [
      { timestamp: '7 days ago', action: 'Email sent', detail: 'Naming opportunity proposal' },
      { timestamp: '10 days ago', action: 'Call logged', detail: 'Initial discussion' },
    ],
  }),
  p3: createProspectDetail({
    id: 'p3',
    name: 'Elizabeth Davis',
    officer: 'Sarah Mitchell',
    lastActivity: '9 days ago',
    segment: 'Class of 2005',
    priority: 'high',
    stage: 'Cultivation',
    overview:
      'Elizabeth has an open ask with no recent activity. She expressed interest in supporting the engineering program.',
    currentFindings: [
      'Open ask with no activity in 9 days',
      'Previously engaged with stewardship',
    ],
    whyStalled: ['Open ask with no activity'],
    recentActions: [
      { timestamp: '9 days ago', action: 'Email sent', detail: 'Engineering program proposal' },
    ],
    whatHappensNext: 'Follow up on the open ask with a personal touch.',
    timeline: [
      { timestamp: '9 days ago', action: 'Email sent', detail: 'Engineering program proposal' },
    ],
  }),
  p4: createProspectDetail({
    id: 'p4',
    name: 'David Martinez',
    officer: 'James Park',
    lastActivity: '10 days ago',
    segment: 'Board Member',
    priority: 'high',
    stage: 'Solicitation',
    overview:
      'David has an overdue follow-up on a capital campaign ask. Board members require timely stewardship.',
    currentFindings: ['Overdue follow-up by 5 days', 'Open ask with no activity'],
    whyStalled: ['Overdue follow-up', 'Open ask with no activity'],
    recentActions: [
      { timestamp: '10 days ago', action: 'Call logged', detail: 'Capital campaign discussion' },
    ],
    whatHappensNext: 'Prioritize follow-up given board member status.',
    timeline: [
      { timestamp: '10 days ago', action: 'Call logged', detail: 'Capital campaign discussion' },
    ],
  }),
  p5: createProspectDetail({
    id: 'p5',
    name: 'Patricia Thompson',
    officer: 'Sarah Mitchell',
    lastActivity: '8 days ago',
    segment: 'Class of 1985',
    priority: 'high',
    stage: 'Cultivation',
    overview:
      'Patricia has stalled with no recent touchpoints. She has strong affinity and capacity.',
    currentFindings: ['No recent touchpoints', 'Overdue follow-up'],
    whyStalled: ['No recent touchpoints', 'Overdue follow-up'],
    recentActions: [],
    whatHappensNext: 'Schedule stewardship call to re-engage.',
    timeline: [
      { timestamp: '4 hours ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent flagged prospect for follow-up due to no touchpoints in 8 days.' },
      { timestamp: '2 days ago', action: 'Follow-up Agent queued task', detail: 'Follow-up Agent created reminder for stewardship call.' },
      { timestamp: '5 days ago', action: 'Stewardship Agent drafted update', detail: 'Stewardship Agent prepared cultivation update for officer review.' },
      { timestamp: '8 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
  p6: createProspectDetail({
    id: 'p6',
    name: 'Christopher Lee',
    officer: 'James Park',
    lastActivity: '7 days ago',
    segment: 'Leadership Council',
    priority: 'high',
    stage: 'Cultivation',
    overview:
      'Christopher has an open ask with no activity. Leadership Council members need consistent touchpoints.',
    currentFindings: ['Open ask with no activity'],
    whyStalled: ['Open ask with no activity'],
    recentActions: [],
    whatHappensNext: 'Follow up on open ask.',
    timeline: [
      { timestamp: '6 hours ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent noted open ask with no activity; recommended Email Draft Agent.' },
      { timestamp: '3 days ago', action: 'Call Prep Agent prepared notes', detail: 'Call Prep Agent researched Leadership Council engagement history.' },
      { timestamp: '5 days ago', action: 'Follow-up Agent queued task', detail: 'Follow-up Agent created follow-up reminder for open ask.' },
      { timestamp: '7 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
  p7: createProspectDetail({
    id: 'p7',
    name: 'Thomas Anderson',
    officer: 'James Park',
    lastActivity: '5 days ago',
    segment: 'Class of 1992',
    priority: 'medium',
    stage: 'Cultivation',
    overview: 'Thomas has had no recent touchpoints. Consider re-engagement outreach.',
    currentFindings: ['No recent touchpoints'],
    whyStalled: ['No recent touchpoints'],
    recentActions: [],
    whatHappensNext: 'Schedule a check-in call or send a stewardship update.',
    timeline: [
      { timestamp: '1 day ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent flagged prospect for re-engagement outreach.' },
      { timestamp: '3 days ago', action: 'Stewardship Agent drafted update', detail: 'Stewardship Agent prepared Class of 1992 reunion update for officer.' },
      { timestamp: '4 days ago', action: 'Follow-up Agent queued task', detail: 'Follow-up Agent created check-in reminder.' },
      { timestamp: '5 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
  p8: createProspectDetail({
    id: 'p8',
    name: 'Jennifer Lopez',
    officer: 'Sarah Mitchell',
    lastActivity: '6 days ago',
    segment: 'Leadership Council',
    priority: 'medium',
    stage: 'Solicitation',
    overview: 'Jennifer has an open ask with no activity. Pipeline Agent is monitoring.',
    currentFindings: ['Open ask with no activity'],
    whyStalled: ['Open ask with no activity'],
    recentActions: [],
    whatHappensNext: 'Pipeline Agent will continue monitoring.',
    timeline: [
      { timestamp: '12 hours ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent noted open ask with no activity; monitoring continues.' },
      { timestamp: '2 days ago', action: 'Email Draft Agent prepared draft', detail: 'Email Draft Agent drafted follow-up on open ask for officer review.' },
      { timestamp: '4 days ago', action: 'Follow-up Agent queued task', detail: 'Follow-up Agent created reminder for Leadership Council prospect.' },
      { timestamp: '6 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
  p9: createProspectDetail({
    id: 'p9',
    name: 'Susan Wright',
    officer: 'James Park',
    lastActivity: '5 days ago',
    segment: 'Class of 2000',
    priority: 'medium',
    stage: 'Cultivation',
    overview: 'Susan needs a nudge. No touchpoints in 5 days.',
    currentFindings: ['No recent touchpoints'],
    whyStalled: ['No recent touchpoints'],
    recentActions: [],
    whatHappensNext: 'Send stewardship update.',
    timeline: [
      { timestamp: '8 hours ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent flagged prospect for nudge; no touchpoints in 5 days.' },
      { timestamp: '2 days ago', action: 'Stewardship Agent drafted update', detail: 'Stewardship Agent prepared Class of 2000 engagement update.' },
      { timestamp: '3 days ago', action: 'Follow-up Agent queued task', detail: 'Follow-up Agent created stewardship reminder.' },
      { timestamp: '5 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
  p10: createProspectDetail({
    id: 'p10',
    name: 'Daniel Kim',
    officer: 'Sarah Mitchell',
    lastActivity: '6 days ago',
    segment: 'Young Alumni',
    priority: 'medium',
    stage: 'Cultivation',
    overview: 'Daniel has an open ask with no activity.',
    currentFindings: ['Open ask with no activity'],
    whyStalled: ['Open ask with no activity'],
    recentActions: [],
    whatHappensNext: 'Follow up on open ask.',
    timeline: [
      { timestamp: '10 hours ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent noted open ask for Young Alumni prospect.' },
      { timestamp: '3 days ago', action: 'Email Draft Agent prepared draft', detail: 'Email Draft Agent drafted young alumni engagement email.' },
      { timestamp: '4 days ago', action: 'Follow-up Agent queued task', detail: 'Follow-up Agent created follow-up reminder.' },
      { timestamp: '6 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
  p11: createProspectDetail({
    id: 'p11',
    name: 'Nancy Garcia',
    officer: 'James Park',
    lastActivity: '5 days ago',
    segment: 'Class of 1978',
    priority: 'medium',
    stage: 'Cultivation',
    overview: 'Nancy has had no recent touchpoints.',
    currentFindings: ['No recent touchpoints'],
    whyStalled: ['No recent touchpoints'],
    recentActions: [],
    whatHappensNext: 'Schedule check-in.',
    timeline: [
      { timestamp: '6 hours ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent flagged Class of 1978 prospect for check-in.' },
      { timestamp: '2 days ago', action: 'Stewardship Agent drafted update', detail: 'Stewardship Agent prepared legacy society update for officer.' },
      { timestamp: '3 days ago', action: 'Follow-up Agent queued task', detail: 'Follow-up Agent created check-in reminder.' },
      { timestamp: '5 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
  p12: createProspectDetail({
    id: 'p12',
    name: 'Kevin O\'Brien',
    officer: 'Sarah Mitchell',
    lastActivity: '6 days ago',
    segment: 'Major Donor',
    priority: 'medium',
    stage: 'Solicitation',
    overview: 'Kevin has an open ask with no activity.',
    currentFindings: ['Open ask with no activity'],
    whyStalled: ['Open ask with no activity'],
    recentActions: [],
    whatHappensNext: 'Follow up on open ask.',
    timeline: [
      { timestamp: '14 hours ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent noted open ask for Major Donor prospect.' },
      { timestamp: '3 days ago', action: 'Call Prep Agent prepared notes', detail: 'Call Prep Agent researched naming opportunity history.' },
      { timestamp: '4 days ago', action: 'Email Draft Agent prepared draft', detail: 'Email Draft Agent drafted follow-up on open ask.' },
      { timestamp: '6 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
  p13: createProspectDetail({
    id: 'p13',
    name: 'Linda Foster',
    officer: 'James Park',
    lastActivity: '5 days ago',
    segment: 'Class of 1995',
    priority: 'medium',
    stage: 'Cultivation',
    overview: 'Linda has had no recent touchpoints.',
    currentFindings: ['No recent touchpoints'],
    whyStalled: ['No recent touchpoints'],
    recentActions: [],
    whatHappensNext: 'Send stewardship update.',
    timeline: [
      { timestamp: '9 hours ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent flagged Class of 1995 prospect for stewardship.' },
      { timestamp: '2 days ago', action: 'Stewardship Agent drafted update', detail: 'Stewardship Agent prepared engagement update for officer.' },
      { timestamp: '4 days ago', action: 'Follow-up Agent queued task', detail: 'Follow-up Agent created stewardship reminder.' },
      { timestamp: '5 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
  p14: createProspectDetail({
    id: 'p14',
    name: 'Mark Johnson',
    officer: 'Sarah Mitchell',
    lastActivity: '6 days ago',
    segment: 'Corporate Partner',
    priority: 'medium',
    stage: 'Solicitation',
    overview: 'Mark has an open ask with no activity.',
    currentFindings: ['Open ask with no activity'],
    whyStalled: ['Open ask with no activity'],
    recentActions: [],
    whatHappensNext: 'Follow up on open ask.',
    timeline: [
      { timestamp: '11 hours ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent noted open ask for Corporate Partner prospect.' },
      { timestamp: '2 days ago', action: 'Call Prep Agent prepared notes', detail: 'Call Prep Agent researched corporate partnership history.' },
      { timestamp: '4 days ago', action: 'Email Draft Agent prepared draft', detail: 'Email Draft Agent drafted follow-up on open ask.' },
      { timestamp: '6 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
  p15: createProspectDetail({
    id: 'p15',
    name: 'Rebecca Moore',
    officer: 'James Park',
    lastActivity: '5 days ago',
    segment: 'Class of 2012',
    priority: 'medium',
    stage: 'Cultivation',
    overview: 'Rebecca has had no recent touchpoints.',
    currentFindings: ['No recent touchpoints'],
    whyStalled: ['No recent touchpoints'],
    recentActions: [],
    whatHappensNext: 'Schedule check-in.',
    timeline: [
      { timestamp: '7 hours ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent flagged Class of 2012 prospect for check-in.' },
      { timestamp: '2 days ago', action: 'Stewardship Agent drafted update', detail: 'Stewardship Agent prepared young alumni update for officer.' },
      { timestamp: '3 days ago', action: 'Follow-up Agent queued task', detail: 'Follow-up Agent created check-in reminder.' },
      { timestamp: '5 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
  p16: createProspectDetail({
    id: 'p16',
    name: 'Steven Clark',
    officer: 'Sarah Mitchell',
    lastActivity: '6 days ago',
    segment: 'Leadership Council',
    priority: 'medium',
    stage: 'Cultivation',
    overview: 'Steven has an open ask with no activity.',
    currentFindings: ['Open ask with no activity'],
    whyStalled: ['Open ask with no activity'],
    recentActions: [],
    whatHappensNext: 'Follow up on open ask.',
    timeline: [
      { timestamp: '5 hours ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent noted open ask for Leadership Council prospect.' },
      { timestamp: '2 days ago', action: 'Email Draft Agent prepared draft', detail: 'Email Draft Agent drafted follow-up on open ask.' },
      { timestamp: '4 days ago', action: 'Follow-up Agent queued task', detail: 'Follow-up Agent created follow-up reminder.' },
      { timestamp: '6 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
  p17: createProspectDetail({
    id: 'p17',
    name: 'Michael Brown',
    officer: 'James Park',
    lastActivity: '4 days ago',
    segment: 'Class of 2010',
    priority: 'low',
    stage: 'Cultivation',
    overview: 'Michael is just starting to stall. Early outreach may prevent further delay.',
    currentFindings: [],
    whyStalled: [],
    recentActions: [],
    whatHappensNext: 'Consider adding Pipeline Agent for monitoring.',
    timeline: [
      { timestamp: '3 hours ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent flagged Class of 2010 prospect for early outreach.' },
      { timestamp: '1 day ago', action: 'Follow-up Agent queued task', detail: 'Follow-up Agent created early outreach reminder.' },
      { timestamp: '2 days ago', action: 'Stewardship Agent drafted update', detail: 'Stewardship Agent prepared light-touch update for officer.' },
      { timestamp: '4 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
  p18: createProspectDetail({
    id: 'p18',
    name: 'Amanda Taylor',
    officer: 'Sarah Mitchell',
    lastActivity: '3 days ago',
    segment: 'Class of 2015',
    priority: 'low',
    stage: 'Cultivation',
    overview: 'Amanda is in early stall. Light touch recommended.',
    currentFindings: [],
    whyStalled: [],
    recentActions: [],
    whatHappensNext: 'Monitor for another few days.',
    timeline: [
      { timestamp: '5 hours ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent noted Class of 2015 prospect in early stall.' },
      { timestamp: '1 day ago', action: 'Stewardship Agent drafted update', detail: 'Stewardship Agent prepared light-touch cultivation note.' },
      { timestamp: '2 days ago', action: 'Follow-up Agent queued task', detail: 'Follow-up Agent created monitor reminder for 2 days.' },
      { timestamp: '3 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
  p19: createProspectDetail({
    id: 'p19',
    name: 'Brian Wilson',
    officer: 'James Park',
    lastActivity: '4 days ago',
    segment: 'Young Alumni',
    priority: 'low',
    stage: 'Cultivation',
    overview: 'Brian is in early stall.',
    currentFindings: [],
    whyStalled: [],
    recentActions: [],
    whatHappensNext: 'Monitor.',
    timeline: [
      { timestamp: '2 hours ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent flagged Young Alumni prospect in early stall.' },
      { timestamp: '2 days ago', action: 'Follow-up Agent queued task', detail: 'Follow-up Agent created monitor reminder.' },
      { timestamp: '3 days ago', action: 'Stewardship Agent drafted update', detail: 'Stewardship Agent prepared young alumni update.' },
      { timestamp: '4 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
  p20: createProspectDetail({
    id: 'p20',
    name: 'Jessica Hall',
    officer: 'Sarah Mitchell',
    lastActivity: '3 days ago',
    segment: 'Class of 2008',
    priority: 'low',
    stage: 'Cultivation',
    overview: 'Jessica is in early stall.',
    currentFindings: [],
    whyStalled: [],
    recentActions: [],
    whatHappensNext: 'Monitor.',
    timeline: [
      { timestamp: '4 hours ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent noted Class of 2008 prospect in early stall.' },
      { timestamp: '1 day ago', action: 'Stewardship Agent drafted update', detail: 'Stewardship Agent prepared light-touch update.' },
      { timestamp: '2 days ago', action: 'Follow-up Agent queued task', detail: 'Follow-up Agent created monitor reminder.' },
      { timestamp: '3 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
  p21: createProspectDetail({
    id: 'p21',
    name: 'Matthew Davis',
    officer: 'James Park',
    lastActivity: '4 days ago',
    segment: 'Class of 2018',
    priority: 'low',
    stage: 'Cultivation',
    overview: 'Matthew is in early stall.',
    currentFindings: [],
    whyStalled: [],
    recentActions: [],
    whatHappensNext: 'Monitor.',
    timeline: [
      { timestamp: '6 hours ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent flagged Class of 2018 prospect in early stall.' },
      { timestamp: '2 days ago', action: 'Follow-up Agent queued task', detail: 'Follow-up Agent created monitor reminder.' },
      { timestamp: '3 days ago', action: 'Stewardship Agent drafted update', detail: 'Stewardship Agent prepared young alumni update.' },
      { timestamp: '4 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
  p22: createProspectDetail({
    id: 'p22',
    name: 'Rachel Green',
    officer: 'Sarah Mitchell',
    lastActivity: '3 days ago',
    segment: 'Class of 2014',
    priority: 'low',
    stage: 'Cultivation',
    overview: 'Rachel is in early stall.',
    currentFindings: [],
    whyStalled: [],
    recentActions: [],
    whatHappensNext: 'Monitor.',
    timeline: [
      { timestamp: '8 hours ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent noted Class of 2014 prospect in early stall.' },
      { timestamp: '1 day ago', action: 'Stewardship Agent drafted update', detail: 'Stewardship Agent prepared light-touch cultivation note.' },
      { timestamp: '2 days ago', action: 'Follow-up Agent queued task', detail: 'Follow-up Agent created monitor reminder.' },
      { timestamp: '3 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
  p23: createProspectDetail({
    id: 'p23',
    name: 'Andrew Harris',
    officer: 'James Park',
    lastActivity: '4 days ago',
    segment: 'Young Alumni',
    priority: 'low',
    stage: 'Cultivation',
    overview: 'Andrew is in early stall.',
    currentFindings: [],
    whyStalled: [],
    recentActions: [],
    whatHappensNext: 'Monitor.',
    timeline: [
      { timestamp: '1 hour ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent flagged Young Alumni prospect in early stall.' },
      { timestamp: '1 day ago', action: 'Follow-up Agent queued task', detail: 'Follow-up Agent created monitor reminder.' },
      { timestamp: '2 days ago', action: 'Stewardship Agent drafted update', detail: 'Stewardship Agent prepared young alumni update.' },
      { timestamp: '4 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
  p24: createProspectDetail({
    id: 'p24',
    name: 'Emily Martinez',
    officer: 'Sarah Mitchell',
    lastActivity: '3 days ago',
    segment: 'Class of 2016',
    priority: 'low',
    stage: 'Cultivation',
    overview: 'Emily is in early stall.',
    currentFindings: [],
    whyStalled: [],
    recentActions: [],
    whatHappensNext: 'Monitor.',
    timeline: [
      { timestamp: '2 hours ago', action: 'Pipeline Agent reviewed status', detail: 'Pipeline Agent noted Class of 2016 prospect in early stall.' },
      { timestamp: '1 day ago', action: 'Stewardship Agent drafted update', detail: 'Stewardship Agent prepared light-touch cultivation note.' },
      { timestamp: '2 days ago', action: 'Follow-up Agent queued task', detail: 'Follow-up Agent created monitor reminder.' },
      { timestamp: '3 days ago', action: 'Pipeline Agent activated', detail: 'Pipeline Agent started monitoring prospect activity.' },
    ],
  }),
};

const MOCK_LIKELY_TO_GIVE: LikelyToGiveProspect[] = [
  { id: 'p1', name: 'Margaret Chen', score: 92, lastGiftDate: '6 months ago', givingTier: 'Leadership' },
  { id: 'p2', name: 'Robert Williams', score: 88, lastGiftDate: '8 months ago', givingTier: 'Major' },
  { id: 'p4', name: 'David Martinez', score: 87, lastGiftDate: '5 months ago', givingTier: 'Major' },
  { id: 'p7', name: 'Thomas Anderson', score: 85, lastGiftDate: '4 months ago', givingTier: 'Annual' },
  { id: 'p8', name: 'Jennifer Lopez', score: 83, lastGiftDate: '5 months ago', givingTier: 'Leadership' },
  { id: 'p12', name: 'Kevin O\'Brien', score: 81, lastGiftDate: '7 months ago', givingTier: 'Major' },
  { id: 'p5', name: 'Patricia Thompson', score: 79, lastGiftDate: '9 months ago', givingTier: 'Leadership' },
  { id: 'p3', name: 'Elizabeth Davis', score: 76, lastGiftDate: '3 months ago', givingTier: 'Annual' },
];

const MOCK_PRIORITY_LIST_TODAY: PriorityProspectRow[] = [
  ...MOCK_PRIORITY_PROSPECTS.filter((p) => p.priority === 'high').slice(0, 4),
  ...MOCK_PRIORITY_PROSPECTS.filter((p) => p.priority === 'medium').slice(0, 4),
];

// ============================================================================
// Intent-specific thinking steps (deterministic UI, not LLM)
// ============================================================================

export const ADVANCEMENT_THINKING_STEPS: Record<string, string[]> = {
  'stalled-this-week': [
    'Pulling prospects with no movement in 7 days...',
    'Checking for: no recent touchpoints...',
    'Checking for: open asks with no activity...',
    'Checking for: overdue follow-ups...',
    'Prioritizing by urgency and capacity...',
    'Planning next steps...',
  ],
  'needs-nudge': [
    'Finding prospects with stalled momentum...',
    'Checking for follow-up opportunities...',
    'Identifying prospects who responded well to past outreach...',
    'Matching prospects to recommended touchpoints...',
    'Building nudge recommendations...',
    'Planning next steps...',
  ],
  'at-risk-lapsing': [
    'Identifying donors approaching lapse threshold...',
    'Checking last gift dates and giving history...',
    'Analyzing engagement patterns...',
    'Flagging high-value at-risk donors...',
    'Prioritizing re-engagement opportunities...',
    'Planning next steps...',
  ],
  'likely-to-give': [
    'Analyzing giving history and patterns...',
    'Identifying prospects with capacity and affinity...',
    'Checking recent engagement and touchpoints...',
    'Scoring likelihood to give in next 30 days...',
    'Ranking prospects by opportunity score...',
    'Planning next steps...',
  ],
  'priority-list': [
    'Building today\'s outreach list...',
    'Checking officer assignments and workload...',
    'Prioritizing by urgency and opportunity...',
    'Balancing high-value and at-risk prospects...',
    'Optimizing for today\'s capacity...',
    'Planning next steps...',
  ],
};

const DEFAULT_THINKING_STEPS = ADVANCEMENT_THINKING_STEPS['stalled-this-week'];

// ============================================================================
// Provider Implementation
// ============================================================================

export class AdvancementPipelineProvider {
  async getStalledThisWeek(
    userContext: UserContext
  ): Promise<ProviderResponse<StalledSummary>> {
    return successResponse(MOCK_STALLED_SUMMARY, {
      sources: [{ type: 'pipeline', id: 'stalled', name: 'Stalled prospects' }],
      confidence: 'high',
    });
  }

  async getPriorityBucket(
    userContext: UserContext,
    bucket: PriorityBucket
  ): Promise<ProviderResponse<PriorityProspectRow[]>> {
    const rows = MOCK_PRIORITY_PROSPECTS.filter((p) => p.priority === bucket);
    return successResponse(rows, {
      sources: [{ type: 'pipeline', id: `bucket-${bucket}`, name: `${bucket} priority prospects` }],
      confidence: 'high',
    });
  }

  async getProspectDetail(
    userContext: UserContext,
    prospectId: string
  ): Promise<ProviderResponse<ProspectDetail>> {
    // Support numeric IDs from AI (e.g. "1" -> "p1") since mock uses p1, p2, ...
    const lookupId =
      /^\d+$/.test(prospectId) && !MOCK_PROSPECT_DETAILS[prospectId]
        ? `p${prospectId}`
        : prospectId;
    const detail = MOCK_PROSPECT_DETAILS[lookupId];
    if (!detail) {
      return errorResponse({
        code: 'NOT_FOUND',
        message: `Prospect with ID ${prospectId} not found`,
      });
    }
    return successResponse(detail, {
      sources: [{ type: 'prospect', id: prospectId, name: detail.name }],
      confidence: 'high',
    });
  }

  async getLikelyToGive(
    userContext: UserContext,
    windowDays = 30
  ): Promise<ProviderResponse<LikelyToGiveProspect[]>> {
    return successResponse(MOCK_LIKELY_TO_GIVE, {
      sources: [{ type: 'pipeline', id: 'likely-to-give', name: `Likely to give in ${windowDays} days` }],
      confidence: 'medium',
    });
  }

  async getPriorityListToday(
    userContext: UserContext
  ): Promise<ProviderResponse<PriorityProspectRow[]>> {
    return successResponse(MOCK_PRIORITY_LIST_TODAY, {
      sources: [{ type: 'pipeline', id: 'priority-list', name: "Today's priority list" }],
      confidence: 'high',
    });
  }

  static getThinkingStepsForIntent(intent: string): string[] {
    return ADVANCEMENT_THINKING_STEPS[intent] ?? DEFAULT_THINKING_STEPS;
  }
}
