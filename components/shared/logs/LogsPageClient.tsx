'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';
import { AgentActivityLog } from '@/components/ai-assistants/agent-ops/AgentActivityLog';
import { PersonActivityTab } from '@/components/ai-assistants/agent-ops/people/PersonActivityTab';
import { mockLogs } from '@/app/(shell)/ai-assistants/lib/data';
import { getAllPeople, getActivityForPerson } from '@/lib/agent-ops/people-mock';

interface LogsPageClientProps {
  basePath?: string; // Base path for navigation (default: '/ai-assistants/logs')
}

type LogOutcome = 'ok' | 'error' | 'escalated' | 'guardrail';

type Role = 'Admissions' | 'Registrar' | 'Student Success' | 'Career Services' | 'Alumni Engagement' | 'Advancement';

interface TranscriptEntry {
  speaker: 'user' | 'assistant';
  at: string;
  text: string;
  events?: string[]; // e.g. "guardrail: fairness", "escalation: self_harm"
}

interface AssistantLogEntry {
  id: string;
  createdAt: string;
  role: Role;
  type: 'assistant' | 'agent';
  participantName?: string;
  participantId?: string;
  assistantName: string;
  assistantId?: string;
  summary: string;
  outcome: LogOutcome;
  hasGuardrailEvents?: boolean;
  hasEscalation?: boolean;
  transcript: TranscriptEntry[];
  guardrailEvents?: string[];
  escalationInfo?: {
    rule: string;
    channel: 'email' | 'sms' | 'voice' | 'ticket';
    notified: string;
    acknowledged?: boolean;
    action: string;
  };
  metadata?: {
    version?: string;
    model?: string;
    sisId?: string;
    crmId?: string;
  };
}

// TODO: Replace with real logs API
const MOCK_LOGS: AssistantLogEntry[] = [
  {
    id: 'log-1',
    createdAt: '2024-01-16T10:32:00Z',
    role: 'Admissions',
    type: 'assistant',
    participantName: 'Chloe Anderson',
    participantId: 'c_anderson_applicant',
    assistantName: 'Admissions Assistant – MBA Fall 2026',
    assistantId: 'assistant-1',
    summary: 'Student asked about transcript submission deadline',
    outcome: 'ok',
    transcript: [
      {
        speaker: 'user',
        at: '2024-01-16T10:32:00Z',
        text: 'Hi, I need to submit my transcript but I\'m not sure about the deadline. Can you help?',
      },
      {
        speaker: 'assistant',
        at: '2024-01-16T10:32:15Z',
        text: 'I can help with that! The deadline for transcript submission is February 15, 2024. You can upload it through the applicant portal or send it directly to admissions@university.edu.',
      },
    ],
    metadata: {
      version: 'v2.1.0',
      model: 'gpt-4',
      sisId: 'SIS-12345',
    },
  },
  {
    id: 'log-2',
    createdAt: '2024-01-16T09:15:00Z',
    role: 'Student Success',
    type: 'assistant',
    participantName: 'Marcus Liu',
    participantId: 'm_liu_student',
    assistantName: 'Student Success Assistant – First-Year Cohort',
    assistantId: 'assistant-2',
    summary: 'Student expressed concerns about academic performance',
    outcome: 'escalated',
    hasEscalation: true,
    transcript: [
      {
        speaker: 'user',
        at: '2024-01-16T09:15:00Z',
        text: 'I\'m really struggling with my classes and I don\'t know what to do. I feel like I\'m going to fail everything.',
      },
      {
        speaker: 'assistant',
        at: '2024-01-16T09:15:20Z',
        text: 'I understand this is a challenging time. Let me connect you with someone who can help right away.',
        events: ['escalation: mental_health_distress'],
      },
    ],
    escalationInfo: {
      rule: 'Acute mental health distress',
      channel: 'email',
      notified: 'Student Care Counselor',
      acknowledged: true,
      action: 'Automation paused; assigned to Student Support queue',
    },
    metadata: {
      version: 'v1.5.2',
      model: 'gpt-4',
      sisId: 'SIS-67890',
    },
  },
  {
    id: 'log-3',
    createdAt: '2024-01-15T14:22:00Z',
    role: 'Admissions',
    type: 'agent',
    participantName: 'Anonymous',
    assistantName: 'Transcript Helper Agent',
    assistantId: 'agent-transcript-helper',
    summary: 'Guardrail triggered during transcript reminder',
    outcome: 'guardrail',
    hasGuardrailEvents: true,
    transcript: [
      {
        speaker: 'user',
        at: '2024-01-15T14:22:00Z',
        text: 'I already submitted my transcript last week, why am I getting this reminder?',
      },
      {
        speaker: 'assistant',
        at: '2024-01-15T14:22:10Z',
        text: 'I apologize for the confusion. Let me check your records and get back to you.',
        events: ['guardrail: fairness'],
      },
    ],
    guardrailEvents: ['Do Not Engage – matched global list'],
    metadata: {
      version: 'v1.0.0',
      model: 'gpt-3.5-turbo',
    },
  },
  {
    id: 'log-4',
    createdAt: '2024-01-15T11:45:00Z',
    role: 'Advancement',
    type: 'agent',
    participantName: 'Ana Ramirez',
    participantId: 'a_ramirez_donor',
    assistantName: 'Advancement Assistant – LYBUNT Recovery',
    assistantId: 'assistant-3',
    summary: 'Donor engagement conversation',
    outcome: 'ok',
    transcript: [
      {
        speaker: 'user',
        at: '2024-01-15T11:45:00Z',
        text: 'I received an email about the annual fund. Can you tell me more about how my donation would be used?',
      },
      {
        speaker: 'assistant',
        at: '2024-01-15T11:45:18Z',
        text: 'Thank you for your interest! Annual fund donations support student scholarships, faculty research, and campus improvements. Would you like to learn more about any specific area?',
      },
    ],
    metadata: {
      version: 'v2.0.1',
      model: 'gpt-4',
      crmId: 'CRM-45678',
    },
  },
  {
    id: 'log-5',
    createdAt: '2024-01-14T16:30:00Z',
    role: 'Registrar',
    type: 'assistant',
    participantName: 'Derrick Martin',
    participantId: 'd_martin_student',
    assistantName: 'Registration Assistant',
    assistantId: 'assistant-4',
    summary: 'Error occurred during course registration query',
    outcome: 'error',
    transcript: [
      {
        speaker: 'user',
        at: '2024-01-14T16:30:00Z',
        text: 'I need to register for CS 101 but I\'m getting an error',
      },
      {
        speaker: 'assistant',
        at: '2024-01-14T16:30:12Z',
        text: 'I encountered an error while checking course availability. Please try again in a few minutes or contact the registrar directly.',
      },
    ],
    metadata: {
      version: 'v1.2.0',
      model: 'gpt-3.5-turbo',
      sisId: 'SIS-11111',
    },
  },
];

type LogScope = 'all' | 'agent' | 'person';

// Mock agents list - in production this would come from an API
const MOCK_AGENTS = [
  { id: 'agent-transcript-helper', name: 'Transcript Helper Agent' },
  { id: 'agent-registration-requirements', name: 'Registration Requirements Agent' },
  { id: 'agent-high-intent-prospect', name: 'High-Intent Prospect Agent' },
  { id: 'agent-donor-warmup', name: 'Donor Warm-Up Agent' },
  { id: 'agent-international-visa', name: 'International Visa Docs Agent' },
  { id: 'assistant-1', name: 'Admissions Assistant – MBA Fall 2026' },
  { id: 'assistant-2', name: 'Student Success Assistant – First-Year Cohort' },
  { id: 'assistant-3', name: 'Advancement Assistant – LYBUNT Recovery' },
  { id: 'assistant-4', name: 'Registration Assistant' },
];

export function LogsPageClient({ basePath = '/ai-assistants/logs' }: LogsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL params
  const [scope, setScope] = React.useState<LogScope>(
    (searchParams.get('scope') as LogScope) || 'all'
  );
  const [selectedAgentId, setSelectedAgentId] = React.useState<string | null>(
    searchParams.get('agentId') || null
  );
  const [selectedPersonId, setSelectedPersonId] = React.useState<string | null>(
    searchParams.get('personId') || null
  );
  
  const [selectedLog, setSelectedLog] = React.useState<AssistantLogEntry | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [outcomeFilter, setOutcomeFilter] = React.useState<string>('all');
  const [dateRange, setDateRange] = React.useState<string>('7 days');

  // Sync state from URL params when they change (e.g., browser back/forward)
  React.useEffect(() => {
    const urlScope = searchParams.get('scope') as LogScope | null;
    const urlAgentId = searchParams.get('agentId');
    const urlPersonId = searchParams.get('personId');
    
    if (urlScope && ['all', 'agent', 'person'].includes(urlScope)) {
      setScope(urlScope);
      if (urlScope === 'agent' && urlAgentId) {
        setSelectedAgentId(urlAgentId);
      } else if (urlScope === 'person' && urlPersonId) {
        setSelectedPersonId(urlPersonId);
      }
    }
  }, [searchParams]);

  // Update URL when scope or selected IDs change
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (scope !== 'all') {
      params.set('scope', scope);
      if (scope === 'agent' && selectedAgentId) {
        params.set('agentId', selectedAgentId);
      } else if (scope === 'person' && selectedPersonId) {
        params.set('personId', selectedPersonId);
      }
    }
    const newUrl = params.toString() ? `${basePath}?${params.toString()}` : basePath;
    router.replace(newUrl, { scroll: false });
  }, [scope, selectedAgentId, selectedPersonId, router, basePath]);

  const handleScopeChange = (newScope: LogScope) => {
    setScope(newScope);
    // Clear selections when switching scopes
    if (newScope !== 'agent') setSelectedAgentId(null);
    if (newScope !== 'person') setSelectedPersonId(null);
  };

  const roles: Role[] = ['Admissions', 'Registrar', 'Student Success', 'Career Services', 'Alumni Engagement', 'Advancement'];

  const filteredLogs = React.useMemo(() => {
    return MOCK_LOGS.filter((log) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          log.participantName?.toLowerCase().includes(query) ||
          log.assistantName.toLowerCase().includes(query) ||
          log.summary.toLowerCase().includes(query) ||
          log.id.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (roleFilter !== 'all' && log.role !== roleFilter) return false;
      if (typeFilter !== 'all' && log.type !== typeFilter) return false;
      if (outcomeFilter !== 'all' && log.outcome !== outcomeFilter) return false;

      return true;
    });
  }, [searchQuery, roleFilter, typeFilter, outcomeFilter]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffHours < 48) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    }
  };

  const getOutcomeColor = (outcome: LogOutcome) => {
    switch (outcome) {
      case 'ok':
        return 'bg-green-100 text-green-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      case 'escalated':
        return 'bg-orange-100 text-orange-700';
      case 'guardrail':
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setTypeFilter('all');
    setOutcomeFilter('all');
    setDateRange('7 days');
  };

  // Get agent logs for selected agent
  const agentLogs = React.useMemo(() => {
    if (scope !== 'agent' || !selectedAgentId) return [];
    return mockLogs.filter(log => log.assistantId === selectedAgentId);
  }, [scope, selectedAgentId]);

  // Get person activity for selected person
  const personActivity = React.useMemo(() => {
    if (scope !== 'person' || !selectedPersonId) return [];
    return getActivityForPerson(selectedPersonId);
  }, [scope, selectedPersonId]);

  const allPeople = React.useMemo(() => getAllPeople(), []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Logs</h1>
          <p className="text-sm text-gray-600">
            {scope === 'all' 
              ? 'Review real assistant and agent activity, including guardrail triggers and human escalations.'
              : scope === 'agent'
              ? 'View activity logs for a specific agent or assistant.'
              : 'View activity logs for a specific person.'}
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'agent', label: 'By agent' },
            { id: 'person', label: 'By person' },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleScopeChange(option.id as LogScope)}
              className={cn(
                'rounded-full px-3 py-1',
                scope === option.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      {/* Scope-specific content */}
      {scope === 'all' && (
        <>
          {/* Filters & Search */}
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
            <div className="grid gap-3 md:grid-cols-5">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search by person, message, or ID…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              >
                <option value="all">All roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              >
                <option value="all">All</option>
                <option value="assistant">Assistant</option>
                <option value="agent">Agent</option>
              </select>
              <select
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              >
                <option value="all">All</option>
                <option value="ok">Success</option>
                <option value="error">Error</option>
                <option value="escalated">Escalated</option>
                <option value="guardrail">Guardrail triggered</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              >
                <option value="today">Today</option>
                <option value="7 days">7 days</option>
                <option value="30 days">30 days</option>
                <option value="custom">Custom</option>
              </select>
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear filters
              </button>
            </div>
          </div>

          {/* Main content - Split view */}
          <div className="grid gap-4 md:grid-cols-[400px,1fr]">
        {/* Left pane - Log list */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Activity stream</h2>
          <div className="space-y-1 max-h-[calc(100vh-400px)] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                No logs found matching your filters.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={cn(
                    'rounded-lg border p-3 cursor-pointer transition-colors',
                    selectedLog?.id === log.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-500">{formatTime(log.createdAt)}</p>
                      <p className="text-xs font-medium text-gray-900 truncate mt-0.5">
                        {log.participantName || 'Anonymous'}
                      </p>
                      <p className="text-[11px] text-gray-600 truncate">{log.assistantName}</p>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0',
                        getOutcomeColor(log.outcome)
                      )}
                    >
                      {log.outcome === 'ok' ? 'OK' : log.outcome.charAt(0).toUpperCase() + log.outcome.slice(1)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 line-clamp-2 mt-1">{log.summary}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700">
                      {log.role}
                    </span>
                    {log.hasGuardrailEvents && (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] text-yellow-700">
                        Guardrail
                      </span>
                    )}
                    {log.hasEscalation && (
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[10px] text-orange-700">
                        Escalated
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right pane - Log detail */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          {!selectedLog ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <p className="text-sm text-gray-500">Select an interaction on the left to see full details.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header section */}
              <div className="space-y-2 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Conversation ID</p>
                    <p className="text-sm font-mono text-gray-900">{selectedLog.id}</p>
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                      getOutcomeColor(selectedLog.outcome)
                    )}
                  >
                    {selectedLog.outcome === 'ok' ? 'OK' : selectedLog.outcome.charAt(0).toUpperCase() + selectedLog.outcome.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-gray-500">Timestamp</p>
                    <p className="text-gray-900">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Role</p>
                    <p className="text-gray-900">{selectedLog.role}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Type</p>
                    <p className="text-gray-900 capitalize">{selectedLog.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Assistant/Agent</p>
                    <p className="text-gray-900">{selectedLog.assistantName}</p>
                  </div>
                </div>
              </div>

              {/* Timeline section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Conversation timeline</h3>
                <div className="space-y-3">
                  {selectedLog.transcript.map((entry, index) => (
                    <div
                      key={index}
                      className={cn(
                        'rounded-lg border p-3',
                        entry.speaker === 'user'
                          ? 'border-gray-200 bg-gray-50 ml-0'
                          : 'border-indigo-100 bg-indigo-50 mr-0'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium text-gray-700 capitalize">
                          {entry.speaker}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(entry.at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-900">{entry.text}</p>
                      {entry.events && entry.events.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {entry.events.map((event, eventIndex) => (
                            <span
                              key={eventIndex}
                              className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] text-yellow-700"
                            >
                              <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" className="h-3 w-3" />
                              {event}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Guardrails & escalation */}
              {(selectedLog.hasGuardrailEvents || selectedLog.hasEscalation) && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-gray-900">Guardrails & escalation</h4>
                  {selectedLog.guardrailEvents && selectedLog.guardrailEvents.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-gray-700">Guardrails triggered:</p>
                      <ul className="list-disc list-inside text-[11px] text-gray-600 space-y-0.5">
                        {selectedLog.guardrailEvents.map((event, index) => (
                          <li key={index}>{event}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedLog.escalationInfo && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-gray-700">Human escalation:</p>
                      <div className="text-[11px] text-gray-600 space-y-0.5">
                        <p>Rule: {selectedLog.escalationInfo.rule}</p>
                        <p>Channel: {selectedLog.escalationInfo.channel}</p>
                        <p>Notified: {selectedLog.escalationInfo.notified}</p>
                        <p>Action: {selectedLog.escalationInfo.action}</p>
                        {selectedLog.escalationInfo.acknowledged !== undefined && (
                          <p>
                            Acknowledged:{' '}
                            {selectedLog.escalationInfo.acknowledged ? (
                              <span className="text-green-600">Yes</span>
                            ) : (
                              <span className="text-gray-500">No</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Metadata */}
              {selectedLog.metadata && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-gray-900">Metadata</h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {selectedLog.metadata.version && (
                      <div>
                        <p className="text-gray-500">Version</p>
                        <p className="text-gray-900">{selectedLog.metadata.version}</p>
                      </div>
                    )}
                    {selectedLog.metadata.model && (
                      <div>
                        <p className="text-gray-500">Model</p>
                        <p className="text-gray-900">{selectedLog.metadata.model}</p>
                      </div>
                    )}
                    {selectedLog.metadata.sisId && (
                      <div>
                        <p className="text-gray-500">SIS ID</p>
                        <p className="text-gray-900 font-mono">{selectedLog.metadata.sisId}</p>
                      </div>
                    )}
                    {selectedLog.metadata.crmId && (
                      <div>
                        <p className="text-gray-500">CRM ID</p>
                        <p className="text-gray-900 font-mono">{selectedLog.metadata.crmId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {scope === 'agent' && (
        <section className="mt-4 space-y-4">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Agent
            </label>
            <select
              value={selectedAgentId || ''}
              onChange={(e) => setSelectedAgentId(e.target.value || null)}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
            >
              <option value="">Choose an agent...</option>
              {MOCK_AGENTS.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
          {selectedAgentId ? (
            <AgentActivityLog logs={agentLogs} />
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <FontAwesomeIcon icon="fa-solid fa-robot" className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">
                Select an agent to view its recent activity.
              </p>
            </div>
          )}
        </section>
      )}

      {scope === 'person' && (
        <section className="mt-4 space-y-4">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Person
            </label>
            <select
              value={selectedPersonId || ''}
              onChange={(e) => setSelectedPersonId(e.target.value || null)}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
            >
              <option value="">Choose a person...</option>
              {allPeople.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} ({person.primaryId})
                </option>
              ))}
            </select>
          </div>
          {selectedPersonId ? (
            <PersonActivityTab activity={personActivity} />
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <FontAwesomeIcon icon="fa-solid fa-user" className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">
                Select a person to view their activity.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}





