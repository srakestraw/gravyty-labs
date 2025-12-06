'use client';

export const dynamic = 'force-static';

import { useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { canManageAssistants } from '@/lib/roles';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Persona =
  | 'admissions'
  | 'registrar'
  | 'student-success'
  | 'career-services'
  | 'alumni-engagement'
  | 'advancement';

interface PersonaConfig {
  label: string;
  description: string;
  descriptionBullets: string[];
  snapshotMetrics: { label: string; value: string }[];
  assistants: {
    id: string;
    name: string;
    goal: string;
    status: 'active' | 'paused' | 'draft';
    impact?: string;
  }[];
  recommendedTemplates: {
    id: string;
    name: string;
    description: string;
  }[];
  recentActivity: {
    timestamp: string;
    description: string;
  }[];
  recentWins?: {
    label: string;
    detail?: string;
    assistantName?: string;
  }[];
}

// Mock data for each persona
const personaConfigs: Record<Persona, PersonaConfig> = {
  admissions: {
    label: 'Admissions',
    description: 'This space shows how assistants are helping you:',
    descriptionBullets: [
      'Reduce stalled applicants',
      'Clear missing documents',
      'Prevent melt in the admit → deposit window',
    ],
    snapshotMetrics: [
      { label: 'Active applicants', value: '1,284' },
      { label: 'Stalled (no activity in the last 7 days)', value: '212' },
      { label: 'With missing documents', value: '96' },
      { label: 'At melt risk (admitted but low engagement)', value: '48' },
      { label: 'New inquiries in the last 24 hours', value: '72' },
    ],
    assistants: [
      {
        id: '1',
        name: 'Application Progress Assistant',
        goal: 'Reduce stalled applicants',
        status: 'active',
        impact: '38% fewer stalled applications (last 7 days)',
      },
      {
        id: '2',
        name: 'Missing Documents Assistant',
        goal: 'Increase transcript & recommendation completion',
        status: 'draft',
      },
      {
        id: '3',
        name: 'Melt Prevention Assistant',
        goal: 'Reduce melt between admit and deposit',
        status: 'paused',
        impact: '17% fewer no-shows (last run period)',
      },
    ],
    recommendedTemplates: [
      {
        id: 'transcript-helper',
        name: 'Transcript Helper Assistant',
        description: 'Monitor transcript status and send guided reminders.',
      },
      {
        id: 'recommendation-letter',
        name: 'Recommendation Letter Assistant',
        description: 'Track recommender activity and remind students before deadlines.',
      },
      {
        id: 'high-intent-prospect',
        name: 'High-Intent Prospect Assistant',
        description: 'Identify prospects most likely to apply based on engagement signals.',
      },
    ],
    recentActivity: [
      {
        timestamp: '10:42 AM',
        description: 'Application Progress Assistant flagged 8 new stalled applicants',
      },
      {
        timestamp: '9:15 AM',
        description: 'Missing Documents Assistant identified 23 missing transcripts',
      },
      {
        timestamp: '8:02 AM',
        description: 'Melt Prevention Assistant escalated 3 admits for advisor follow-up',
      },
      {
        timestamp: 'Yesterday 4:21 PM',
        description: '17 stalled applicants moved forward after reminders',
      },
    ],
  },
  registrar: {
    label: 'Registrar',
    description: 'Streamline registration and enrollment processes',
    descriptionBullets: [
      'Help students with course selection',
      'Resolve schedule conflicts',
      'Send registration reminders',
    ],
    snapshotMetrics: [
      { label: 'Active registrations', value: '3,421' },
      { label: 'Schedule conflicts', value: '45' },
    ],
    assistants: [
      {
        id: '5',
        name: 'Registration Assistant',
        goal: 'Help students with course registration and schedule planning',
        status: 'active',
      },
    ],
    recommendedTemplates: [
      {
        id: 'registration-helper',
        name: 'Registration Helper',
        description: 'Assist students with course selection and scheduling',
      },
    ],
    recentActivity: [
      {
        timestamp: '11:20 AM',
        description: 'Registration Assistant resolved 5 schedule conflicts',
      },
    ],
  },
  'student-success': {
    label: 'Student Success',
    description: 'Support student retention and academic achievement',
    descriptionBullets: [
      'Detect at-risk students early',
      'Provide timely interventions',
      'Track academic progress',
    ],
    snapshotMetrics: [
      { label: 'At-risk students', value: '156' },
      { label: 'Interventions sent', value: '892' },
    ],
    assistants: [
      {
        id: '2',
        name: 'Student Success Assistant',
        goal: 'Detect at-risk students early and support them with timely outreach',
        status: 'active',
      },
    ],
    recommendedTemplates: [
      {
        id: 'at-risk-detection',
        name: 'At-Risk Detection',
        description: 'Identify and support students who may be struggling',
      },
    ],
    recentActivity: [
      {
        timestamp: '9:30 AM',
        description: 'Student Success Assistant identified 12 at-risk students',
      },
    ],
  },
  'career-services': {
    label: 'Career Services',
    description: 'Help students with career planning and job placement',
    descriptionBullets: [
      'Career counseling support',
      'Job matching assistance',
      'Resume review automation',
    ],
    snapshotMetrics: [
      { label: 'Active students', value: '2,134' },
      { label: 'Job placements', value: '456' },
      { label: 'Active mentoring pairs', value: '124' },
      { label: 'Students waiting for a mentor', value: '38' },
    ],
    assistants: [],
    recommendedTemplates: [
      {
        id: 'career-counseling',
        name: 'Career Counseling Assistant',
        description: 'Provide guidance on career paths and opportunities',
      },
    ],
    recentActivity: [],
  },
  'alumni-engagement': {
    label: 'Alumni Engagement',
    description: 'Maintain relationships and re-engage dormant alumni',
    descriptionBullets: [
      'Re-connect with dormant alumni',
      'Promote events and opportunities',
      'Personalize communications',
    ],
    snapshotMetrics: [
      { label: 'Active alumni', value: '12,456' },
      { label: 'Events registered', value: '234' },
      { label: 'Active mentoring pairs', value: '89' },
      { label: 'Alumni mentors available', value: '156' },
    ],
    assistants: [],
    recommendedTemplates: [
      {
        id: 'alumni-reengagement',
        name: 'Alumni Re-engagement Assistant',
        description: 'Re-connect with dormant alumni and personalize communications',
      },
    ],
    recentActivity: [],
  },
  advancement: {
    label: 'Advancement',
    description: 'Improve donor retention and identify giving opportunities',
    descriptionBullets: [
      'Maintain donor relationships',
      'Identify giving opportunities',
      'Recover lapsed donors',
    ],
    snapshotMetrics: [
      { label: 'Active donors', value: '5,678' },
      { label: 'LYBUNT recovery', value: '89' },
    ],
    assistants: [
      {
        id: '3',
        name: 'Advancement Assistant',
        goal: 'Improve donor retention and identify giving opportunities',
        status: 'active',
      },
    ],
    recommendedTemplates: [
      {
        id: 'donor-retention',
        name: 'Donor Retention Assistant',
        description: 'Maintain relationships with existing donors',
      },
    ],
    recentActivity: [
      {
        timestamp: '8:00 AM',
        description: 'Advancement Assistant identified 5 LYBUNT recovery opportunities',
      },
    ],
    recentWins: [
      {
        label: '3 LYBUNT donors renewed this week',
        detail: 'Recovered via personalized outreach suggested by the LYBUNT Recovery Assistant',
        assistantName: 'LYBUNT Recovery Assistant',
      },
      {
        label: '$50,000 major gift moved from cultivation → solicitation',
        detail: 'Pipeline Assistant flagged a stalled stage and recommended follow-up',
        assistantName: 'Major Gift Pipeline Assistant',
      },
      {
        label: '18 new donors completed onboarding',
        detail: 'Nurture Assistant delivered a successful welcome series',
        assistantName: 'New Donor Nurture Assistant',
      },
      {
        label: 'Alumni mentor referred a new major gift prospect',
        detail: 'Career & Alumni Insights Assistant surfaced the relationship path',
        assistantName: 'Career & Alumni Insights Assistant',
      },
      {
        label: '22 donors increased engagement after last event',
        detail: 'Event Engagement Assistant highlighted attendees likely to convert',
        assistantName: 'Event Engagement Assistant',
      },
    ],
  },
};

const personas: Persona[] = [
  'admissions',
  'registrar',
  'student-success',
  'career-services',
  'alumni-engagement',
  'advancement',
];

const personaLabels: Record<Persona, string> = {
  admissions: 'Admissions',
  registrar: 'Registrar',
  'student-success': 'Student Success',
  'career-services': 'Career Services',
  'alumni-engagement': 'Alumni Engagement',
  advancement: 'Advancement',
};

export default function AssistantsHomePage() {
  const { user } = useAuth();
  const canManage = canManageAssistants(user?.email || user?.uid);
  const [selectedPersona, setSelectedPersona] = useState<Persona>('admissions');

  const persona = personaConfigs[selectedPersona];
  const personaLabel = personaLabels[selectedPersona];

  // Mock user name - in real app, this would come from auth context
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Alex';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Persona Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          I'm working as…
        </label>
        <div className="flex flex-wrap gap-2">
          {personas.map((personaId) => {
            const isSelected = selectedPersona === personaId;
            return (
              <button
                key={personaId}
                onClick={() => setSelectedPersona(personaId)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {personaLabels[personaId]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero / Greeting */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {getGreeting()}, {userName}.
            </h2>
            <p className="text-gray-600 mb-3">
              You're viewing the AI workspace for: <strong>{personaLabel}</strong>
            </p>
            <div className="space-y-1">
              <p className="text-sm text-gray-700 font-medium">{persona.description}</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-2">
                {persona.descriptionBullets.map((bullet, index) => (
                  <li key={index}>{bullet}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Snapshot Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Snapshot</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {persona.snapshotMetrics.map((metric, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
              <div className="text-sm text-gray-600">{metric.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Wins */}
      {persona.recentWins && persona.recentWins.length > 0 && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Wins</h3>
            <p className="text-sm text-gray-600 mt-1">
              Highlights of what you and your assistants have accomplished recently.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {persona.recentWins.map((win, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <h4 className="font-semibold text-gray-900 mb-2">{win.label}</h4>
                {win.detail && (
                  <p className="text-sm text-gray-600 mb-3">{win.detail}</p>
                )}
                {win.assistantName && (
                  <p className="text-xs text-gray-500">
                    Powered by:{' '}
                    <span className="font-medium text-gray-700">{win.assistantName}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Persona Assistants */}
      {persona.assistants.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your {personaLabel} Assistants
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {persona.assistants.map((assistant) => (
              <div
                key={assistant.id}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{assistant.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{assistant.goal}</p>
                    {assistant.impact && (
                      <p className="text-xs text-green-700 font-medium">{assistant.impact}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor(
                      assistant.status
                    )}`}
                  >
                    {assistant.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  <Link
                    href={`/ai-assistants/${assistant.id}`}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    View
                  </Link>
                  {canManage && (
                    <>
                      <Link
                        href={`/ai-assistants/${assistant.id}`}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      {assistant.status === 'active' && (
                        <button
                          onClick={() => {
                            alert('Pause functionality will be implemented in a future update');
                          }}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                        >
                          Pause
                        </button>
                      )}
                      {assistant.status === 'paused' && (
                        <button
                          onClick={() => {
                            alert('Resume functionality will be implemented in a future update');
                          }}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                        >
                          Resume
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Templates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recommended for {personaLabel}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {persona.recommendedTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              {canManage && (
                <Link href={`/ai-assistants/new?template=${template.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Use Template
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {persona.recentActivity.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Link
              href="/ai-assistants/logs"
              className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
            >
              View Full Activity Log
              <FontAwesomeIcon icon="fa-solid fa-chevron-right" className="h-3 w-3" />
            </Link>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {persona.recentActivity.map((activity, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-500">
                          {activity.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{activity.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
