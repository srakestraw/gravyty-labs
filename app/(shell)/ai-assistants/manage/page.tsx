'use client';

import * as React from 'react';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import Link from 'next/link';

// Types
type PersonaKey =
  | 'admissions'
  | 'registrar'
  | 'studentSuccess'
  | 'careerServices'
  | 'alumniEngagement'
  | 'advancement';

type AssistantStatus = 'active' | 'paused' | 'draft' | 'error';

type AssistantType = 'proactive' | 'on-demand' | 'workflow' | 'eval';

interface AiAssistant {
  id: string;
  name: string;
  persona: PersonaKey;
  type: AssistantType;
  status: AssistantStatus;
  description: string;
  linkedAgents?: string[];
  lastRun: string; // e.g., "12 min ago"
  owner: string; // e.g., "Alex R."
}

interface AssistantTemplate {
  id: string;
  name: string;
  persona: PersonaKey;
  summary: string;
}

// Mock data
const assistantTemplates: AssistantTemplate[] = [
  {
    id: 'template-stalled-applicants',
    name: 'Stalled Applicants Assistant',
    persona: 'admissions',
    summary: 'Surface stalled applicants and recommend targeted outreach.',
  },
  {
    id: 'template-registration-blocker',
    name: 'Registration Blocker Assistant',
    persona: 'registrar',
    summary: 'Detect students blocked from registration and summarize root causes.',
  },
  {
    id: 'template-early-alert',
    name: 'Early Alert Assistant',
    persona: 'studentSuccess',
    summary: 'Combine LMS and attendance signals to prioritize at-risk students.',
  },
  {
    id: 'template-lybunt-recovery',
    name: 'LYBUNT Recovery Assistant',
    persona: 'advancement',
    summary: 'Identify last-year-but-not-this-year donors and suggest next steps.',
  },
];

const aiAssistants: AiAssistant[] = [
  {
    id: 'asst-stalled-applicants',
    name: 'Stalled Applicants Assistant',
    persona: 'admissions',
    type: 'proactive',
    status: 'active',
    description: 'Find stalled applicants and prioritize outreach based on impact.',
    linkedAgents: ['Application Process', 'Reminder Sender'],
    lastRun: '12 min ago',
    owner: 'Alex R.',
  },
  {
    id: 'asst-registration-blocker',
    name: 'Registration Blocker Assistant',
    persona: 'registrar',
    type: 'proactive',
    status: 'active',
    description: 'Detect students blocked from registration and surface root causes.',
    linkedAgents: ['Registration Holds', 'Prereq Checker'],
    lastRun: '1 hour ago',
    owner: 'Dana W.',
  },
  {
    id: 'asst-early-alert',
    name: 'Early Alert Assistant',
    persona: 'studentSuccess',
    type: 'proactive',
    status: 'paused',
    description: 'Combine LMS + attendance alerts to prioritize at-risk students.',
    linkedAgents: ['Risk Scorer'],
    lastRun: 'Yesterday',
    owner: 'Nissan B.',
  },
  {
    id: 'asst-donor-pipeline',
    name: 'Donor Pipeline Coach',
    persona: 'advancement',
    type: 'on-demand',
    status: 'active',
    description: 'Highlight donors to contact next based on pipeline stage and intent.',
    linkedAgents: ['LYBUNT Recovery', 'Proposal Tracker'],
    lastRun: '2 hours ago',
    owner: 'Lisa K.',
  },
  {
    id: 'asst-missing-docs',
    name: 'Missing Documents Assistant',
    persona: 'admissions',
    type: 'proactive',
    status: 'draft',
    description: 'Track missing transcripts and recommendation letters, send reminders.',
    linkedAgents: ['Document Tracker'],
    lastRun: 'Never',
    owner: 'Alex R.',
  },
  {
    id: 'asst-graduation-path',
    name: 'Graduation Path Assistant',
    persona: 'registrar',
    type: 'proactive',
    status: 'active',
    description: 'Identify students at risk of delayed graduation.',
    linkedAgents: ['Degree Audit', 'Advisor Notifier'],
    lastRun: '3 hours ago',
    owner: 'Dana W.',
  },
  {
    id: 'asst-career-matching',
    name: 'Career Opportunity Matcher',
    persona: 'careerServices',
    type: 'on-demand',
    status: 'active',
    description: 'Match students to relevant jobs and internships.',
    linkedAgents: ['Job Board', 'Student Profile'],
    lastRun: '45 min ago',
    owner: 'Jordan M.',
  },
  {
    id: 'asst-alumni-events',
    name: 'Alumni Event Promoter',
    persona: 'alumniEngagement',
    type: 'proactive',
    status: 'active',
    description: 'Identify alumni segments and send targeted event invitations.',
    linkedAgents: ['Event Manager', 'Alumni Database'],
    lastRun: '5 hours ago',
    owner: 'Sam T.',
  },
];

// Helper functions
const personaLabelFromKey = (key: PersonaKey): string => {
  switch (key) {
    case 'admissions':
      return 'Admissions';
    case 'registrar':
      return 'Registrar';
    case 'studentSuccess':
      return 'Student Success';
    case 'careerServices':
      return 'Career Services';
    case 'alumniEngagement':
      return 'Alumni Engagement';
    case 'advancement':
      return 'Advancement';
    default:
      return 'Unknown';
  }
};

const renderStatusPill = (status: AssistantStatus) => {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border';
  switch (status) {
    case 'active':
      return (
        <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-100`}>Active</span>
      );
    case 'paused':
      return (
        <span className={`${base} bg-amber-50 text-amber-700 border-amber-100`}>Paused</span>
      );
    case 'draft':
      return (
        <span className={`${base} bg-slate-50 text-slate-600 border-slate-200`}>Draft</span>
      );
    case 'error':
      return (
        <span className={`${base} bg-rose-50 text-rose-700 border-rose-100`}>Error</span>
      );
  }
};

const statusLabelFromKey = (status: AssistantStatus): string => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'paused':
      return 'Paused';
    case 'draft':
      return 'Draft';
    case 'error':
      return 'Error';
    default:
      return 'Unknown';
  }
};

export default function Page() {
  const [search, setSearch] = React.useState('');
  const [personaFilter, setPersonaFilter] = React.useState<PersonaKey | 'all'>('all');
  const [statusFilter, setStatusFilter] = React.useState<AssistantStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = React.useState<AssistantType | 'all'>('all');
  const [selectedAssistant, setSelectedAssistant] = React.useState<AiAssistant | null>(null);

  const filteredAssistants = React.useMemo(
    () =>
      aiAssistants.filter((asst) => {
        if (personaFilter !== 'all' && asst.persona !== personaFilter) return false;
        if (statusFilter !== 'all' && asst.status !== statusFilter) return false;
        if (typeFilter !== 'all' && asst.type !== typeFilter) return false;
        if (
          search &&
          !asst.name.toLowerCase().includes(search.toLowerCase()) &&
          !asst.description.toLowerCase().includes(search.toLowerCase())
        ) {
          return false;
        }
        return true;
      }),
    [personaFilter, statusFilter, typeFilter, search]
  );

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">AI Assistants</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create, manage, and monitor AI assistants across your workspaces.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/ai-assistants/new">
            <button className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">
              + New Assistant
            </button>
          </Link>
          <Link href="/ai-assistants/guardrails">
            <button className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              View Guardrails
            </button>
          </Link>
        </div>
      </header>

      {/* Filters */}
      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" className="h-4 w-4 text-gray-400" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            placeholder="Search assistants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700"
          value={personaFilter}
          onChange={(e) => setPersonaFilter(e.target.value as PersonaKey | 'all')}
        >
          <option value="all">All workspaces</option>
          <option value="admissions">Admissions</option>
          <option value="registrar">Registrar</option>
          <option value="studentSuccess">Student Success</option>
          <option value="careerServices">Career Services</option>
          <option value="alumniEngagement">Alumni Engagement</option>
          <option value="advancement">Advancement</option>
        </select>

        <select
          className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AssistantStatus | 'all')}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="draft">Draft</option>
          <option value="error">Error</option>
        </select>

        <select
          className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as AssistantType | 'all')}
        >
          <option value="all">All types</option>
          <option value="proactive">Proactive</option>
          <option value="on-demand">On-demand</option>
          <option value="workflow">Workflow</option>
          <option value="eval">Eval</option>
        </select>
      </section>

      {/* Templates */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Recommended assistant templates</h2>
          <span className="text-xs text-gray-500">Jump-start with a pre-built pattern.</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {assistantTemplates.map((tpl) => (
            <Link
              key={tpl.id}
              href={`/ai-assistants/new?template=${tpl.id}`}
              className="flex flex-col items-start gap-1 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left hover:border-gray-300 hover:bg-gray-100 transition-colors"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {personaLabelFromKey(tpl.persona)}
              </span>
              <span className="text-sm font-medium text-gray-900">{tpl.name}</span>
              <span className="text-xs text-gray-600 line-clamp-2">{tpl.summary}</span>
              <span className="mt-1 text-xs font-medium text-gray-700">Use template →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Main grid: table + detail */}
      <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        {/* Table */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900">AI Assistants</h2>
            <p className="text-xs text-gray-500">
              {filteredAssistants.length} assistant{filteredAssistants.length !== 1 ? 's' : ''}
              {search ? ' (filtered)' : ''}.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500">
                <tr>
                  <th className="px-4 py-2">Assistant</th>
                  <th className="px-4 py-2">Workspace</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Linked agents</th>
                  <th className="px-4 py-2">Last run</th>
                  <th className="px-4 py-2">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAssistants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      No assistants found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredAssistants.map((asst) => (
                    <tr
                      key={asst.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedAssistant(asst)}
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="font-medium text-gray-900">{asst.name}</div>
                        <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                          {asst.description}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-gray-600">
                        {personaLabelFromKey(asst.persona)}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-gray-600 capitalize">
                        {asst.type.replace('-', ' ')}
                      </td>
                      <td className="px-4 py-3 align-top text-xs">{renderStatusPill(asst.status)}</td>
                      <td className="px-4 py-3 align-top text-xs text-gray-600">
                        {asst.linkedAgents && asst.linkedAgents.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {asst.linkedAgents.map((agent) => (
                              <span
                                key={agent}
                                className="rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600"
                              >
                                {agent}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-gray-600">{asst.lastRun}</td>
                      <td className="px-4 py-3 align-top text-xs text-gray-600">{asst.owner}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          {selectedAssistant ? (
            <>
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">{selectedAssistant.name}</h2>
                  <p className="text-xs text-gray-500">
                    {personaLabelFromKey(selectedAssistant.persona)} •{' '}
                    {selectedAssistant.type === 'proactive' ? 'Proactive' : 'On-demand'} •{' '}
                    {statusLabelFromKey(selectedAssistant.status)}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-gray-200 px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedAssistant(null)}
                >
                  Close
                </button>
              </div>

              <p className="mb-3 text-xs text-gray-600">{selectedAssistant.description}</p>

              <div className="mb-3 space-y-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium text-gray-700">Owner:</span> {selectedAssistant.owner}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Last run:</span> {selectedAssistant.lastRun}
                </div>
                {selectedAssistant.linkedAgents && selectedAssistant.linkedAgents.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Linked agents:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedAssistant.linkedAgents.map((agent) => (
                        <span
                          key={agent}
                          className="rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600"
                        >
                          {agent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                <Link href={`/ai-assistants/${selectedAssistant.id}`}>
                  <button className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors">
                    Open Config
                  </button>
                </Link>
                <Link href={`/ai-assistants/evals?assistant=${selectedAssistant.id}`}>
                  <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Monitor Activity
                  </button>
                </Link>
                {selectedAssistant.status === 'active' ? (
                  <button className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                    Pause
                  </button>
                ) : (
                  <button className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors">
                    Activate
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <p className="max-w-xs text-xs text-gray-500">
                Select an assistant from the list to view its details, guardrails, and linked agents.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


