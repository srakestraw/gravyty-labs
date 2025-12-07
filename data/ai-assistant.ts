export interface PriorityCase {
  id: string;
  name: string;
  program: string;
  priority: 'high' | 'medium' | 'low';
  lastActivity: string;
  missing: string[];
  advisor: string;
  activeAgents: string[];
  suggestedAgents: string[];
  avatar?: string;
}

export interface CaseDetail {
  personId: string;
  name: string;
  program: string;
  advisor: string;
  priority: 'high' | 'medium' | 'low';
  lastActivity: string;
  status: string;
  overview: string;
  currentFindings: string[];
  whyStalled: string[];
  recentActions: {
    timestamp: string;
    action: string;
    detail: string;
  }[];
  whatHappensNext: string;
  recommendedNextSteps: {
    label: string;
    action: string;
  }[];
  timeline: {
    timestamp: string;
    action: string;
    detail: string;
  }[];
}

export interface SummaryData {
  stalledCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

// Mock data
export const mockSummaryData: SummaryData = {
  stalledCount: 32,
  highCount: 8,
  mediumCount: 14,
  lowCount: 10,
};

export const mockPriorityCases: PriorityCase[] = [
  {
    id: '1',
    name: 'Luke W.',
    program: 'Computer Science',
    priority: 'high',
    lastActivity: '7 days ago',
    missing: ['Transcript', 'Rec Letter'],
    advisor: 'Sarah Chen',
    activeAgents: ['Application Process Agent'],
    suggestedAgents: ['Transcript Helper', 'Rec Letter Assistant'],
  },
  {
    id: '2',
    name: 'Olivia Rhye',
    program: 'Business Administration',
    priority: 'high',
    lastActivity: '6 days ago',
    missing: ['Transcript'],
    advisor: 'Michael Torres',
    activeAgents: ['Application Process Agent'],
    suggestedAgents: ['Transcript Helper'],
  },
  {
    id: '3',
    name: 'Emma Wilson',
    program: 'Engineering',
    priority: 'high',
    lastActivity: '8 days ago',
    missing: ['Rec Letter', 'Personal Statement'],
    advisor: 'Sarah Chen',
    activeAgents: ['Application Process Agent'],
    suggestedAgents: ['Rec Letter Assistant'],
  },
  {
    id: '4',
    name: 'James Martinez',
    program: 'Biology',
    priority: 'medium',
    lastActivity: '5 days ago',
    missing: ['Transcript'],
    advisor: 'Michael Torres',
    activeAgents: [],
    suggestedAgents: ['Transcript Helper', 'Application Process Agent'],
  },
  {
    id: '5',
    name: 'Sophia Lee',
    program: 'Psychology',
    priority: 'medium',
    lastActivity: '4 days ago',
    missing: [],
    advisor: 'Sarah Chen',
    activeAgents: ['Application Process Agent'],
    suggestedAgents: [],
  },
];

export const mockCaseDetails: Record<string, CaseDetail> = {
  '1': {
    personId: '1',
    name: 'Luke W.',
    program: 'Computer Science',
    advisor: 'Sarah Chen',
    priority: 'high',
    lastActivity: '7 days ago',
    status: 'Running',
    overview:
      'Luke is a high-priority applicant who has stalled in the application process. He has completed most of his application but is missing critical documents.',
    currentFindings: [
      'No portal activity in the last 7 days',
      'Missing transcript and recommendation letter',
      'Application is 85% complete',
      'Previously engaged with portal regularly',
    ],
    whyStalled: [
      'Waiting for transcript from previous institution',
      'Recommender has not submitted letter yet',
      'May need reminder about upcoming deadline',
    ],
    recentActions: [
      {
        timestamp: '7 days ago',
        action: 'Last portal login',
        detail: 'Viewed application checklist',
      },
      {
        timestamp: '10 days ago',
        action: 'Email sent',
        detail: 'Reminder about missing documents',
      },
      {
        timestamp: '12 days ago',
        action: 'Application Process Agent activated',
        detail: 'Started monitoring application progress',
      },
    ],
    whatHappensNext:
      'The Application Process Agent will continue monitoring and send targeted reminders. Adding the Transcript Helper and Rec Letter Assistant can help accelerate document collection.',
    recommendedNextSteps: [
      { label: 'Add Transcript Helper', action: 'add-agent' },
      { label: 'Send Email', action: 'send-email' },
      { label: 'Send SMS', action: 'send-sms' },
      { label: 'Tag for follow-up', action: 'tag' },
      { label: 'Open Profile', action: 'open-profile' },
      { label: 'Flag for Advisor', action: 'flag-advisor' },
      { label: 'View full agent timeline', action: 'view-timeline' },
    ],
    timeline: [
      {
        timestamp: '2 hours ago',
        action: 'Agent check',
        detail: 'Application Process Agent reviewed status',
      },
      {
        timestamp: '12 days ago',
        action: 'Agent activated',
        detail: 'Application Process Agent started monitoring',
      },
      {
        timestamp: '10 days ago',
        action: 'Email sent',
        detail: 'Reminder about missing documents sent',
      },
      {
        timestamp: '7 days ago',
        action: 'Portal activity',
        detail: 'Last login - viewed checklist',
      },
    ],
  },
};

export const suggestedPrompts = [
  'Who stalled this week?',
  'What are the top lead sources for applicants?',
  'Build my priority list for today',
  "Who needs a nudge to keep going?",
  "Who's missing documents?",
];

export const thinkingSteps = [
  'Pulling all applicants with no progress in 7 days…',
  'Checking for: incomplete items…',
  'Checking for: unread messages…',
  'Checking for: no portal activity…',
  'Checking for: missed deadlines…',
  'Planning next steps…',
];


