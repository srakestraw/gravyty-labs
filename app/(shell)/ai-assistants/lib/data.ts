/**
 * Placeholder data for AI Assistants app
 * In v1, this is static mock data
 */

export interface Assistant {
  id: string;
  name: string;
  goal: string;
  status: 'active' | 'paused' | 'draft';
  owner: string;
  lastUpdated: string;
  template: string;
  scope: {
    program?: string;
    term?: string;
  };
  guardrails: {
    messageLimit: number;
    quietHours: { start: string; end: string };
    canEscalate: boolean;
  };
  performance: {
    messagesSent: number;
    responsesGenerated: number;
    satisfactionScore: number;
  };
}

export interface Guardrail {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  value?: string | number | boolean;
}

export interface EvalScore {
  assistantId: string;
  assistantName: string;
  correctness: number;
  safety: number;
  fairness: number;
  lastEvaluated: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
}

export const mockAssistants: Assistant[] = [
  {
    id: '1',
    name: 'Admissions Assistant – MBA Fall 2026',
    goal: 'Reduce stalled applicants and improve application completion',
    status: 'active',
    owner: 'Sarah Johnson',
    lastUpdated: '2024-01-15T10:30:00Z',
    template: 'admissions',
    scope: { program: 'MBA', term: 'Fall 2026' },
    guardrails: {
      messageLimit: 2,
      quietHours: { start: '22:00', end: '08:00' },
      canEscalate: true,
    },
    performance: {
      messagesSent: 1247,
      responsesGenerated: 1189,
      satisfactionScore: 4.2,
    },
  },
  {
    id: '2',
    name: 'Student Success Assistant – First-Year Cohort',
    goal: 'Detect at-risk students early and support them with timely outreach',
    status: 'active',
    owner: 'Michael Chen',
    lastUpdated: '2024-01-14T09:15:00Z',
    template: 'student-success',
    scope: { term: 'Fall 2024' },
    guardrails: {
      messageLimit: 3,
      quietHours: { start: '20:00', end: '09:00' },
      canEscalate: true,
    },
    performance: {
      messagesSent: 892,
      responsesGenerated: 856,
      satisfactionScore: 4.5,
    },
  },
  {
    id: '3',
    name: 'Advancement Assistant – LYBUNT Recovery',
    goal: 'Improve donor retention and identify giving opportunities',
    status: 'active',
    owner: 'Emily Rodriguez',
    lastUpdated: '2024-01-13T14:20:00Z',
    template: 'advancement',
    scope: {},
    guardrails: {
      messageLimit: 2,
      quietHours: { start: '22:00', end: '08:00' },
      canEscalate: false,
    },
    performance: {
      messagesSent: 654,
      responsesGenerated: 612,
      satisfactionScore: 4.3,
    },
  },
];

export const mockGlobalGuardrails: Guardrail[] = [
  {
    id: 'bias-fairness',
    name: 'Bias & Fairness',
    enabled: true,
    description: 'Ensure all responses are free from bias and treat all students fairly',
  },
  {
    id: 'message-limit',
    name: 'Global Message Limits',
    enabled: true,
    description: 'Maximum messages per person per day',
    value: 2,
  },
  {
    id: 'quiet-hours',
    name: 'Global Quiet Hours',
    enabled: true,
    description: 'Time period when assistants should not send messages',
    value: '22:00 - 08:00',
  },
];

export const mockEvalScores: EvalScore[] = [
  {
    assistantId: '1',
    assistantName: 'Admissions Outreach Assistant',
    correctness: 0.92,
    safety: 0.88,
    fairness: 0.95,
    lastEvaluated: '2024-01-15',
  },
  {
    assistantId: '2',
    assistantName: 'Student Success Advisor',
    correctness: 0.89,
    safety: 0.91,
    fairness: 0.93,
    lastEvaluated: '2024-01-14',
  },
];

export const mockTemplates: Template[] = [
  {
    id: 'admissions',
    name: 'Admissions Assistant',
    description: 'Reduce stalled applicants and improve application completion.',
    category: 'Admissions',
    icon: 'fa-solid fa-clipboard-check',
  },
  {
    id: 'student-success',
    name: 'Student Success Assistant',
    description: 'Detect at-risk students early and support them with timely outreach.',
    category: 'Student Success',
    icon: 'fa-solid fa-graduation-cap',
  },
  {
    id: 'advancement',
    name: 'Advancement Assistant',
    description: 'Improve donor retention and identify giving opportunities.',
    category: 'Advancement',
    icon: 'fa-solid fa-hand-holding-dollar',
  },
  {
    id: 'alumni',
    name: 'Alumni Engagement Assistant',
    description: 'Re-engage dormant alumni and personalize communications.',
    category: 'Alumni',
    icon: 'fa-solid fa-users',
  },
  {
    id: 'registration',
    name: 'Registration Assistant',
    description: 'Help students with course registration and schedule planning.',
    category: 'Registration',
    icon: 'fa-solid fa-calendar-check',
  },
];

export const mockPermissions = [
  {
    role: 'Assistant Admin',
    canCreate: true,
    canEditGuardrails: true,
    canDeploy: true,
  },
  {
    role: 'Compliance Officer',
    canCreate: false,
    canEditGuardrails: false,
    canDeploy: false,
  },
  {
    role: 'Viewer',
    canCreate: false,
    canEditGuardrails: false,
    canDeploy: false,
  },
];

export const mockLogs = [
  {
    id: '1',
    timestamp: '2024-01-15T10:30:00Z',
    action: 'Stall detected',
    outcome: 'Reminder sent to student',
    assistantId: '2',
  },
  {
    id: '2',
    timestamp: '2024-01-15T09:15:00Z',
    action: 'Reminder suggested',
    outcome: 'Message queued for delivery',
    assistantId: '1',
  },
  {
    id: '3',
    timestamp: '2024-01-14T16:45:00Z',
    action: 'Escalation triggered',
    outcome: 'Human advisor notified',
    assistantId: '2',
  },
];

