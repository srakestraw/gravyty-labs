export type PersonRole = 'student' | 'alumni' | 'donor' | 'prospect' | 'staff';

export type SourceSystem = 'banner' | 'colleague' | 'workday' | 'salesforce' | 'advance' | 'other';

export interface PersonContact {
  type: 'email' | 'sms' | 'phone';
  value: string;
  primary?: boolean;
}

export interface PersonRecord {
  id: string;
  name: string;
  roles: PersonRole[];
  primaryId: string; // e.g. Student ID or Constituent ID
  sourceSystems: SourceSystem[];
  contacts: PersonContact[];
  preferredChannel?: 'email' | 'sms' | 'phone';
  doNotEngage?: {
    global?: boolean;
    roles?: PersonRole[];
    reason?: string;
    source?: 'opt_out' | 'admin' | 'system';
  };
}

export interface PersonAgentAssignment {
  personId: string;
  agentId: string;
  agentName: string;
  agentRole: string;
  status: 'active' | 'paused' | 'on_hold';
  lastActionAt: string;
}

export interface PersonActivity {
  id: string;
  personId: string;
  timestamp: string;
  channel: 'email' | 'sms' | 'phone' | 'internal_flag' | 'task';
  agentName?: string;
  description: string;
}

export const MOCK_PEOPLE: PersonRecord[] = [
  {
    id: 'person-1',
    name: 'Sarah Chen',
    roles: ['student'],
    primaryId: 'S0012345',
    sourceSystems: ['banner'],
    contacts: [
      { type: 'email', value: 'sarah.chen@example.edu', primary: true },
      { type: 'sms', value: '+1-555-0123', primary: false },
    ],
    preferredChannel: 'email',
  },
  {
    id: 'person-2',
    name: 'Michael Rodriguez',
    roles: ['student'],
    primaryId: 'S0020042',
    sourceSystems: ['banner'],
    contacts: [
      { type: 'email', value: 'm.rodriguez@example.edu', primary: true },
      { type: 'phone', value: '+1-555-0456', primary: false },
    ],
    preferredChannel: 'sms',
  },
  {
    id: 'person-3',
    name: 'Emily Johnson',
    roles: ['student', 'prospect'],
    primaryId: 'S0078001',
    sourceSystems: ['banner', 'salesforce'],
    contacts: [
      { type: 'email', value: 'emily.j@example.edu', primary: true },
    ],
    preferredChannel: 'email',
  },
  {
    id: 'person-4',
    name: 'David Kim',
    roles: ['alumni', 'donor'],
    primaryId: 'A0098765',
    sourceSystems: ['advance', 'salesforce'],
    contacts: [
      { type: 'email', value: 'david.kim@example.edu', primary: true },
      { type: 'phone', value: '+1-555-0789', primary: false },
    ],
    preferredChannel: 'email',
    doNotEngage: {
      global: true,
      reason: 'User opt-out',
      source: 'opt_out',
    },
  },
  {
    id: 'person-5',
    name: 'Priya Patel',
    roles: ['student'],
    primaryId: 'S0089001',
    sourceSystems: ['banner'],
    contacts: [
      { type: 'email', value: 'priya.patel@example.edu', primary: true },
      { type: 'sms', value: '+1-555-0321', primary: false },
    ],
    preferredChannel: 'sms',
  },
  {
    id: 'person-6',
    name: 'James Wilson',
    roles: ['alumni'],
    primaryId: 'A0023456',
    sourceSystems: ['advance'],
    contacts: [
      { type: 'email', value: 'james.wilson@example.edu', primary: true },
    ],
    preferredChannel: 'email',
  },
  {
    id: 'person-7',
    name: 'Alexandra Martinez',
    roles: ['prospect'],
    primaryId: 'P0012012',
    sourceSystems: ['salesforce'],
    contacts: [
      { type: 'email', value: 'alex.martinez@example.edu', primary: true },
      { type: 'phone', value: '+1-555-0654', primary: false },
    ],
    preferredChannel: 'phone',
  },
  {
    id: 'person-8',
    name: 'Robert Taylor',
    roles: ['student'],
    primaryId: 'S0056001',
    sourceSystems: ['banner'],
    contacts: [
      { type: 'email', value: 'robert.taylor@example.edu', primary: true },
    ],
    preferredChannel: 'email',
  },
  {
    id: 'person-9',
    name: 'Lisa Anderson',
    roles: ['alumni', 'donor'],
    primaryId: 'A0045001',
    sourceSystems: ['advance'],
    contacts: [
      { type: 'email', value: 'lisa.anderson@example.edu', primary: true },
    ],
    preferredChannel: 'email',
  },
  {
    id: 'person-10',
    name: 'Christopher Lee',
    roles: ['student'],
    primaryId: 'S0023001',
    sourceSystems: ['banner'],
    contacts: [
      { type: 'email', value: 'chris.lee@example.edu', primary: true },
      { type: 'sms', value: '+1-555-0987', primary: false },
    ],
    preferredChannel: 'sms',
  },
];

const MOCK_ASSIGNMENTS: PersonAgentAssignment[] = [
  {
    personId: 'person-1',
    agentId: 'agent-transcript-helper',
    agentName: 'Transcript Helper Agent',
    agentRole: 'Admissions',
    status: 'active',
    lastActionAt: '2024-01-15T10:30:00Z',
  },
  {
    personId: 'person-2',
    agentId: 'agent-registration-requirements',
    agentName: 'Registration Requirements Agent',
    agentRole: 'Registrar',
    status: 'active',
    lastActionAt: '2024-01-15T09:15:00Z',
  },
  {
    personId: 'person-3',
    agentId: 'agent-high-intent-prospect',
    agentName: 'High-Intent Prospect Agent',
    agentRole: 'Admissions',
    status: 'active',
    lastActionAt: '2024-01-14T22:45:00Z',
  },
  {
    personId: 'person-4',
    agentId: 'agent-donor-warmup',
    agentName: 'Donor Warm-Up Agent',
    agentRole: 'Advancement',
    status: 'paused',
    lastActionAt: '2024-01-15T08:20:00Z',
  },
  {
    personId: 'person-5',
    agentId: 'agent-international-visa',
    agentName: 'International Visa Docs Agent',
    agentRole: 'Admissions',
    status: 'active',
    lastActionAt: '2024-01-15T07:00:00Z',
  },
  {
    personId: 'person-7',
    agentId: 'agent-high-intent-prospect',
    agentName: 'High-Intent Prospect Agent',
    agentRole: 'Admissions',
    status: 'active',
    lastActionAt: '2024-01-14T14:00:00Z',
  },
  {
    personId: 'person-10',
    agentId: 'agent-high-intent-prospect',
    agentName: 'High-Intent Prospect Agent',
    agentRole: 'Admissions',
    status: 'active',
    lastActionAt: '2024-01-15T06:00:00Z',
  },
];

const MOCK_ACTIVITY: PersonActivity[] = [
  {
    id: 'activity-1',
    personId: 'person-1',
    timestamp: '2024-01-15T10:30:00Z',
    channel: 'email',
    agentName: 'Transcript Helper Agent',
    description: 'Sent reminder about missing transcript',
  },
  {
    id: 'activity-2',
    personId: 'person-1',
    timestamp: '2024-01-14T15:20:00Z',
    channel: 'internal_flag',
    agentName: 'Transcript Helper Agent',
    description: 'Flagged for transcript verification',
  },
  {
    id: 'activity-3',
    personId: 'person-2',
    timestamp: '2024-01-15T09:15:00Z',
    channel: 'email',
    agentName: 'Registration Requirements Agent',
    description: 'Sent notification about registration hold',
  },
  {
    id: 'activity-4',
    personId: 'person-3',
    timestamp: '2024-01-14T22:45:00Z',
    channel: 'sms',
    agentName: 'High-Intent Prospect Agent',
    description: 'Quiet hours - message scheduled for next day',
  },
  {
    id: 'activity-5',
    personId: 'person-4',
    timestamp: '2024-01-15T08:20:00Z',
    channel: 'internal_flag',
    description: 'Do Not Engage rule triggered',
  },
  {
    id: 'activity-6',
    personId: 'person-5',
    timestamp: '2024-01-15T07:00:00Z',
    channel: 'email',
    agentName: 'International Visa Docs Agent',
    description: 'Escalation: Missing I-20 and visa documents',
  },
];

export function getAllPeople(): PersonRecord[] {
  return MOCK_PEOPLE;
}

export function getPersonById(id: string): PersonRecord | undefined {
  return MOCK_PEOPLE.find((p) => p.id === id);
}

export function getAssignmentsForPerson(personId: string): PersonAgentAssignment[] {
  return MOCK_ASSIGNMENTS.filter((a) => a.personId === personId);
}

export function getActivityForPerson(personId: string): PersonActivity[] {
  return MOCK_ACTIVITY.filter((a) => a.personId === personId).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getQueueItemsForPerson(personId: string) {
  const { getMockAgentOpsItems } = require('./mock');
  return getMockAgentOpsItems().filter((item: any) => item.person?.id === personId);
}

// Helper functions for labels
export function roleLabel(role: PersonRole): string {
  const labels: Record<PersonRole, string> = {
    student: 'Student',
    alumni: 'Alumni',
    donor: 'Donor',
    prospect: 'Prospect',
    staff: 'Staff',
  };
  return labels[role] || role;
}

export function sourceSystemLabel(system: SourceSystem): string {
  const labels: Record<SourceSystem, string> = {
    banner: 'Banner',
    colleague: 'Colleague',
    workday: 'Workday',
    salesforce: 'Salesforce',
    advance: 'Advance',
    other: 'Other',
  };
  return labels[system] || system;
}

export function contactLabel(type: 'email' | 'sms' | 'phone'): string {
  const labels = {
    email: 'Email',
    sms: 'SMS',
    phone: 'Phone',
  };
  return labels[type] || type;
}

export function assignmentStatusLabel(status: 'active' | 'paused' | 'on_hold'): string {
  const labels = {
    active: 'Active',
    paused: 'Paused',
    on_hold: 'On Hold',
  };
  return labels[status] || status;
}

export function channelLabel(channel: PersonActivity['channel']): string {
  const labels = {
    email: 'Email',
    sms: 'SMS',
    phone: 'Phone',
    internal_flag: 'Internal Flag',
    task: 'Task',
  };
  return labels[channel] || channel;
}

