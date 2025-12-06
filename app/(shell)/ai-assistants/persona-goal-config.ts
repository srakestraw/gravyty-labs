import { PersonaGoalTrackerProps } from '@/components/shared/persona-goal-tracker';

export type PersonaKey =
  | 'admissions'
  | 'registrar'
  | 'student-success'
  | 'career-services'
  | 'alumni-engagement'
  | 'advancement';

// NOTE: These are mock data values. In production, these should be wired to real metrics
// from your data sources (APIs, databases, etc.)
export const personaGoalConfigs: Record<PersonaKey, PersonaGoalTrackerProps> = {
  admissions: {
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
  },
  registrar: {
    title: 'Goal Tracker',
    timeframeLabel: 'This term',
    subtitle: 'Monitor registration and holds so students are ready on day one.',
    metrics: [
      {
        id: 'registered',
        label: 'Students fully registered',
        current: 8700,
        target: 9000,
        unit: 'students',
        trend: 'up',
      },
      {
        id: 'holds-cleared',
        label: 'Registration holds cleared',
        current: 420,
        target: 500,
        unit: 'holds',
        trend: 'up',
      },
      {
        id: 'unregistered-eligible',
        label: 'Eligible but not registered',
        current: 280,
        target: 0,
        unit: 'students',
        trend: 'down',
      },
    ],
  },
  'student-success': {
    title: 'Goal Tracker',
    timeframeLabel: 'This term',
    subtitle: "See how you're doing on keeping students on track and supported.",
    metrics: [
      {
        id: 'on-track',
        label: 'Students on track',
        current: 1350,
        target: 1500,
        unit: 'students',
        trend: 'up',
      },
      {
        id: 'at-risk-contacted',
        label: 'At-risk students contacted in last 7 days',
        current: 210,
        target: 250,
        unit: 'students',
        trend: 'up',
      },
      {
        id: 'cases-resolved',
        label: 'Support cases resolved',
        current: 78,
        target: 100,
        unit: 'cases',
        trend: 'up',
      },
    ],
  },
  'career-services': {
    title: 'Goal Tracker',
    timeframeLabel: 'This semester',
    subtitle: "Track how well you're connecting students with career opportunities.",
    metrics: [
      {
        id: 'appointments',
        label: 'Career appointments completed',
        current: 190,
        target: 240,
        unit: 'appointments',
        trend: 'up',
      },
      {
        id: 'jobs-shared',
        label: 'New job / internship leads shared',
        current: 62,
        target: 80,
        unit: 'leads',
        trend: 'up',
      },
      {
        id: 'students-placed',
        label: 'Students with offers recorded',
        current: 34,
        target: 50,
        unit: 'students',
        trend: 'up',
      },
    ],
  },
  'alumni-engagement': {
    title: 'Goal Tracker',
    timeframeLabel: 'This year',
    subtitle: 'Follow your progress across events, mentoring, and volunteering.',
    metrics: [
      {
        id: 'events-rsvp',
        label: 'Event RSVPs',
        current: 540,
        target: 700,
        unit: 'RSVPs',
        trend: 'up',
      },
      {
        id: 'mentoring-matches',
        label: 'Active mentoring matches',
        current: 92,
        target: 120,
        unit: 'matches',
        trend: 'up',
      },
      {
        id: 'volunteers',
        label: 'Active volunteers',
        current: 130,
        target: 160,
        unit: 'volunteers',
        trend: 'flat',
      },
    ],
  },
  advancement: {
    // Using the existing Advancement Goal Tracker values as the baseline
    title: 'Goal Tracker',
    timeframeLabel: 'This fiscal year',
    subtitle: 'Track your donor pipeline and recovery progress.',
    metrics: [
      {
        id: 'giving-goal',
        label: 'Quarterly Giving Goal',
        current: 1.2,
        target: 2.0,
        unit: '$M',
        trend: 'up',
        status: 'on-track',
      },
      {
        id: 'lybunt-recovery',
        label: 'LYBUNT Recovery',
        current: 89,
        target: 150,
        unit: 'donors',
        trend: 'up',
        status: 'slightly-behind',
      },
      {
        id: 'proposals-advanced',
        label: 'Key Proposals Advanced',
        current: 18,
        target: 25,
        unit: 'proposals',
        trend: 'up',
        status: 'on-track',
      },
      {
        id: 'donor-meetings',
        label: 'Strategic Donor Meetings',
        current: 6,
        target: 15,
        unit: 'meetings',
        trend: 'up',
        status: 'at-risk',
      },
    ],
  },
};

