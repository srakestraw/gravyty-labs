'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useClientSearchParams } from '@/lib/hooks/useClientSearchParams';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type EvalScope = 'global' | 'agent' | 'person';
export type EvalScopeFilter = 'all' | EvalScope;

interface EvalsPageClientProps {
  basePath?: string; // Base path for navigation (default: '/ai-assistants/evals')
}

// TODO: Replace with real eval runs API
interface EvalRun {
  id: string;
  name: string;
  suite: string;
  target: string;
  status: 'completed' | 'running' | 'failed';
  score: number;
  maxScore: number;
  runDate: string;
  createdBy: string;
  scope: EvalScope;
  targetId?: string | null;
  targetType?: 'agent' | 'person' | null;
  targetName: string;
  safetyScore?: number;
  factualityScore?: number;
  guardrailPassCount?: number;
  guardrailFailCount?: number;
  testCases?: TestCase[];
}

interface TestCase {
  id: string;
  scenarioName: string;
  outcome: 'pass' | 'fail' | 'needs_review';
  score: number;
  prompt?: string;
  response?: string;
  expected?: string;
  notes?: string;
  guardrails?: string[];
}

interface GuardrailSummary {
  category: string;
  passing: number;
  total: number;
  escalations?: number;
}

interface RunLogEntry {
  timestamp: string;
  message: string;
}

interface EvalSuite {
  id: string;
  name: string;
  testCaseCount: number;
  lastRunDate?: string;
}

// Mock data
const MOCK_EVAL_RUNS: EvalRun[] = [
  {
    id: 'run-1',
    name: 'Admissions – Melt Prevention v2',
    suite: 'Admissions: Melt Scenarios',
    target: 'Admissions Assistant – MBA Fall 2026',
    status: 'completed',
    score: 87,
    maxScore: 100,
    runDate: '2024-01-15T10:30:00Z',
    createdBy: 'Sarah Johnson',
    scope: 'agent',
    targetId: 'agent-admissions-mba',
    targetType: 'agent',
    targetName: 'Admissions Assistant – MBA Fall 2026',
    safetyScore: 92,
    factualityScore: 85,
    guardrailPassCount: 45,
    guardrailFailCount: 2,
    testCases: [
      {
        id: 'tc-1',
        scenarioName: 'Student asks to defer admission due to finances',
        outcome: 'pass',
        score: 92,
        prompt: 'Student has not submitted transcript for 2 weeks',
        response: 'Sent reminder with clear next steps',
        expected: 'Reminder sent with actionable guidance',
        guardrails: ['No bias', 'Financial guidance'],
      },
      {
        id: 'tc-2',
        scenarioName: 'Parent emails about incomplete FAFSA',
        outcome: 'needs_review',
        score: 74,
        prompt: 'Student asks about FAFSA deadline',
        response: 'Generic response about financial aid',
        expected: 'Specific FAFSA deadline and steps',
        notes: 'Missing specific deadline information',
        guardrails: ['Safety', 'Financial advice'],
      },
      {
        id: 'tc-3',
        scenarioName: 'Student expresses anxiety about dropping out',
        outcome: 'fail',
        score: 61,
        prompt: 'Student expresses concerns about academic performance',
        response: 'Generic encouragement',
        expected: 'Empathetic response with escalation path',
        notes: 'Should trigger mental health guardrail',
        guardrails: ['Human escalation: mental health'],
      },
    ],
  },
  {
    id: 'run-2',
    name: 'Student Success – At-Risk Detection',
    suite: 'Student Success: Early Warning',
    target: 'Student Success Assistant – First-Year Cohort',
    status: 'completed',
    score: 91,
    maxScore: 100,
    runDate: '2024-01-14T09:15:00Z',
    createdBy: 'Michael Chen',
    scope: 'agent',
    targetId: 'agent-student-success',
    targetType: 'agent',
    targetName: 'Student Success Assistant – First-Year Cohort',
    safetyScore: 94,
    factualityScore: 89,
    guardrailPassCount: 38,
    guardrailFailCount: 1,
  },
  {
    id: 'run-3',
    name: 'Advancement – Donor Engagement',
    suite: 'Advancement: LYBUNT Recovery',
    target: 'Advancement Assistant – LYBUNT Recovery',
    status: 'running',
    score: 0,
    maxScore: 100,
    runDate: '2024-01-16T14:20:00Z',
    createdBy: 'Emily Rodriguez',
    scope: 'agent',
    targetId: 'agent-advancement-lybunt',
    targetType: 'agent',
    targetName: 'Advancement Assistant – LYBUNT Recovery',
  },
  {
    id: 'run-4',
    name: 'Global Guardrail Compliance Check',
    suite: 'Global: Safety & Compliance',
    target: 'System-wide',
    status: 'completed',
    score: 96,
    maxScore: 100,
    runDate: '2024-01-15T08:00:00Z',
    createdBy: 'System',
    scope: 'global',
    targetId: null,
    targetType: null,
    targetName: 'System-wide',
    safetyScore: 98,
    factualityScore: 94,
    guardrailPassCount: 120,
    guardrailFailCount: 0,
  },
  {
    id: 'run-5',
    name: 'Persona Evaluation – Sarah Chen',
    suite: 'Persona: High-Value Prospects',
    target: 'Sarah Chen',
    status: 'completed',
    score: 88,
    maxScore: 100,
    runDate: '2024-01-14T16:45:00Z',
    createdBy: 'David Kim',
    scope: 'person',
    targetId: 'person-sarah-chen',
    targetType: 'person',
    targetName: 'Sarah Chen',
    safetyScore: 90,
    factualityScore: 86,
    guardrailPassCount: 15,
    guardrailFailCount: 1,
  },
  {
    id: 'run-6',
    name: 'Persona Evaluation – Marcus Johnson',
    suite: 'Persona: At-Risk Students',
    target: 'Marcus Johnson',
    status: 'completed',
    score: 82,
    maxScore: 100,
    runDate: '2024-01-13T11:20:00Z',
    createdBy: 'Lisa Wang',
    scope: 'person',
    targetId: 'person-marcus-johnson',
    targetType: 'person',
    targetName: 'Marcus Johnson',
    safetyScore: 85,
    factualityScore: 79,
    guardrailPassCount: 12,
    guardrailFailCount: 2,
  },
];

const MOCK_SUITES: EvalSuite[] = [
  {
    id: 'suite-1',
    name: 'Admissions – Stalled Applicants Suite',
    testCaseCount: 47,
    lastRunDate: '2024-01-15T10:30:00Z',
  },
  {
    id: 'suite-2',
    name: 'Student Success – Early Warning Suite',
    testCaseCount: 39,
    lastRunDate: '2024-01-14T09:15:00Z',
  },
  {
    id: 'suite-3',
    name: 'Advancement – LYBUNT Recovery Suite',
    testCaseCount: 28,
    lastRunDate: '2024-01-13T14:20:00Z',
  },
];

// Scope chip component
function ScopeChip({ scope }: { scope: EvalScope }) {
  const colors = {
    global: 'bg-gray-100 text-gray-700',
    agent: 'bg-blue-100 text-blue-700',
    person: 'bg-teal-100 text-teal-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
        colors[scope]
      )}
    >
      {scope === 'global' ? 'Global' : scope === 'agent' ? 'Agent' : 'Person'}
    </span>
  );
}

// Status pill component
function StatusPill({ status }: { status: 'completed' | 'running' | 'failed' }) {
  const map = {
    completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700' },
    running: { label: 'Running', className: 'bg-indigo-50 text-indigo-700' },
    failed: { label: 'Failed', className: 'bg-rose-50 text-rose-700' },
  }[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
        map.className
      )}
    >
      {map.label}
    </span>
  );
}

// Scenario row component
type ScenarioOutcome = 'pass' | 'needs_review' | 'fail';

function ScenarioRow({
  outcome,
  title,
  score,
  guardrails = [],
}: {
  outcome: ScenarioOutcome;
  title: string;
  score: number;
  guardrails?: string[];
}) {
  const outcomeMap: Record<ScenarioOutcome, { label: string; className: string }> = {
    pass: { label: 'Pass', className: 'bg-emerald-50 text-emerald-700' },
    needs_review: { label: 'Needs review', className: 'bg-amber-50 text-amber-700' },
    fail: { label: 'Fail', className: 'bg-rose-50 text-rose-700' },
  };

  const meta = outcomeMap[outcome];

  return (
    <li className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 hover:border-gray-200">
      <div className="flex items-center justify-between gap-2">
        <p className="flex-1 truncate text-xs font-medium text-gray-900">{title}</p>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-800">
            {score}/100
          </span>
          <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', meta.className)}>
            {meta.label}
          </span>
        </div>
      </div>
      {guardrails.length > 0 && (
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {guardrails.map((g) => (
            <span key={g} className="rounded-full bg-white px-2 py-0.5 text-[10px] text-gray-600">
              {g}
            </span>
          ))}
          <button className="ml-auto text-[10px] font-medium text-indigo-600 hover:text-indigo-700">
            View run detail
          </button>
        </div>
      )}
    </li>
  );
}

// Eval run detail component
interface EvalRunDetailProps {
  run: EvalRun;
  guardrailSummary?: GuardrailSummary[];
  runLog?: RunLogEntry[];
  onViewInLogs?: () => void;
  basePath?: string;
}

function EvalRunDetail({ run, guardrailSummary, runLog, onViewInLogs, basePath = '/ai-assistants' }: EvalRunDetailProps) {
  const router = useRouter();
  
  const scopeLabel =
    run.scope === 'global'
      ? 'Global'
      : run.scope === 'agent'
      ? `Agent • ${run.targetName}`
      : `Person • ${run.targetName}`;

  const formatRunDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getScoreGrade = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    return 'D';
  };

  const grade = getScoreGrade(run.score, run.maxScore);
  
  const passing = run.testCases?.filter((tc) => tc.outcome === 'pass').length ?? 0;
  const failing = run.testCases?.filter((tc) => tc.outcome === 'fail').length ?? 0;
  const needsReview = run.testCases?.filter((tc) => tc.outcome === 'needs_review').length ?? 0;
  const totalScenarios = run.testCases?.length ?? 0;
  const regressions = run.guardrailFailCount ?? 0;

  const verdict = run.score >= 85 ? 'Passing' : run.score >= 70 ? 'Needs attention' : 'At risk';
  const verdictIcon = run.score >= 85 ? '✅' : run.score >= 70 ? '⚠️' : '❌';

  // Map test cases to scenarios
  const scenarios = run.testCases?.map((tc) => ({
    outcome: tc.outcome as ScenarioOutcome,
    title: tc.scenarioName,
    score: tc.score,
    guardrails: tc.guardrails || [],
  })) || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-sm font-semibold text-gray-900">{run.name}</h1>
            <p className="text-xs text-gray-600">
              {run.score}/{run.maxScore} ({grade}) • Suite:{' '}
              <span className="font-medium text-gray-800">{run.suite}</span>
            </p>
            <p className="text-xs text-gray-600">
              Scope: <span className="font-medium">{scopeLabel}</span>
            </p>
            <p className="text-[11px] text-gray-500">
              Run by {run.createdBy} • {formatRunDate(run.runDate)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={run.status} />
            <button className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800">
              Re-run eval
            </button>
            <button className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50">
              View suite
            </button>
            <button className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50">
              <span>Download results</span>
              <span className="text-[9px]">▾</span>
            </button>
          </div>
        </div>
      </section>

      {/* Score & Verdict */}
      {run.status === 'completed' && (
        <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-indigo-500 bg-indigo-50">
                <span className="text-lg font-semibold text-indigo-700">{run.score}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {verdictIcon} {verdict}
                </p>
                <p className="text-xs text-gray-600">
                  {passing} of {totalScenarios} scenarios passing • {regressions} regression
                  {regressions === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            {/* Placeholder for sparkline / trend */}
            <div className="flex flex-col items-end gap-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                Trend vs last 5 runs
              </p>
              <div className="h-10 w-40 rounded-md bg-gray-50" />
            </div>
          </div>

          {/* Key signals */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-gray-600">
            <span>
              <span className="font-medium text-gray-900">Scenario coverage:</span> {totalScenarios} test cases
            </span>
            <span>•</span>
            <span>
              <span className="font-medium text-gray-900">Guardrail passes:</span>{' '}
              {run.guardrailPassCount ?? 0} / {totalScenarios}
            </span>
            <span>•</span>
            <span>
              <span className="font-medium text-gray-900">Regressions:</span> {regressions}
            </span>
            {run.safetyScore && (
              <>
                <span>•</span>
                <span>
                  <span className="font-medium text-gray-900">Safety score:</span> {run.safetyScore}/100
                </span>
              </>
            )}
          </div>
        </section>
      )}

      {/* Scenarios list */}
      {run.status === 'completed' && scenarios.length > 0 && (
        <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-semibold text-gray-900">Scenarios & outcomes</h2>
              <p className="text-[11px] text-gray-500">
                Drill into specific test cases to see where the agent passed, failed, or needs review.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] text-gray-700">
                <option>All outcomes</option>
                <option>Pass only</option>
                <option>Needs review</option>
                <option>Fail only</option>
              </select>
            </div>
          </div>

          <ul className="space-y-2 text-xs">
            {scenarios.map((scenario, idx) => (
              <ScenarioRow key={idx} {...scenario} />
            ))}
          </ul>
        </section>
      )}

      {/* Guardrails & Log */}
      {run.status === 'completed' && (
        <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold text-gray-900">Guardrails & run log</h2>
              <p className="text-[11px] text-gray-500">
                See which guardrails fired and how the run progressed over time.
              </p>
            </div>
            {onViewInLogs && (
              <button
                onClick={onViewInLogs}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
              >
                View in Logs
              </button>
            )}
          </div>

          {guardrailSummary && guardrailSummary.length > 0 && (
            <div className="mb-3 grid gap-2 text-[11px] text-gray-700 md:grid-cols-3">
              {guardrailSummary.map((summary, idx) => (
                <div key={idx} className="rounded-md bg-gray-50 px-3 py-2">
                  <p className="font-semibold text-gray-900">{summary.category}</p>
                  <p>
                    {summary.passing} / {summary.total} passing
                    {summary.escalations !== undefined && summary.escalations > 0 && (
                      <> • {summary.escalations} escalation{summary.escalations === 1 ? '' : 's'}</>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}

          {runLog && runLog.length > 0 && (
            <ol className="space-y-1 text-[11px] text-gray-600">
              {runLog.map((entry, idx) => (
                <li key={idx}>
                  {entry.timestamp} – {entry.message}
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}

export function EvalsPageClient({ basePath = '/ai-assistants/evals' }: EvalsPageClientProps) {
  const router = useRouter();
  const searchParams = useClientSearchParams();
  
  // Initialize state from URL params
  const [scopeFilter, setScopeFilter] = React.useState<EvalScopeFilter>(
    (searchParams.get('scope') as EvalScopeFilter) || 'all'
  );
  const [targetIdFilter, setTargetIdFilter] = React.useState<string | null>(
    searchParams.get('targetId') || null
  );
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [selectedRun, setSelectedRun] = React.useState<EvalRun | null>(null);

  // Sync state from URL params when they change
  React.useEffect(() => {
    const urlScope = searchParams.get('scope') as EvalScopeFilter | null;
    const urlTargetId = searchParams.get('targetId');
    
    if (urlScope && ['all', 'global', 'agent', 'person'].includes(urlScope)) {
      setScopeFilter(urlScope);
    }
    if (urlTargetId) {
      setTargetIdFilter(urlTargetId);
    }
  }, [searchParams]);

  // Update URL when scope or targetId change
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (scopeFilter !== 'all') {
      params.set('scope', scopeFilter);
    }
    if (targetIdFilter) {
      params.set('targetId', targetIdFilter);
    }
    const newUrl = params.toString() 
      ? `${basePath}?${params.toString()}` 
      : basePath;
    router.replace(newUrl, { scroll: false });
  }, [scopeFilter, targetIdFilter, router, basePath]);

  // Filter runs based on scope, targetId, search, and status
  const filteredRuns = React.useMemo(() => {
    return MOCK_EVAL_RUNS.filter((run) => {
      // Scope filter
      if (scopeFilter !== 'all' && run.scope !== scopeFilter) return false;
      
      // Target ID filter
      if (targetIdFilter && run.targetId !== targetIdFilter) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !run.name.toLowerCase().includes(query) &&
          !run.suite.toLowerCase().includes(query) &&
          !run.targetName.toLowerCase().includes(query) &&
          !run.createdBy.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      
      // Status filter
      if (statusFilter !== 'all' && run.status !== statusFilter) return false;
      
      return true;
    });
  }, [scopeFilter, targetIdFilter, searchQuery, statusFilter]);

  // Auto-select first run when filters change
  React.useEffect(() => {
    if (filteredRuns.length > 0 && (!selectedRun || !filteredRuns.find(r => r.id === selectedRun.id))) {
      setSelectedRun(filteredRuns[0]);
    } else if (filteredRuns.length === 0) {
      setSelectedRun(null);
    }
  }, [filteredRuns, selectedRun]);

  const getStatusColor = (status: EvalRun['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'running':
        return 'bg-blue-100 text-blue-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
    }
  };

  const getScoreGrade = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    return 'D';
  };

  const logsBasePath = basePath.includes('/admin') ? '/admin/logs' : '/ai-assistants/logs';

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Evals</h1>
            <p className="text-sm text-gray-600">
              Create and review evaluation runs to measure how assistants and agents perform against your scenarios.
            </p>
          </div>
          <Button size="sm" className="text-sm" onClick={() => router.push(`${basePath}/new`)}>
            <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4 mr-2" />
            New eval run
          </Button>
        </div>
      </header>

      {/* Filter Toolbar */}
      <section className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <FontAwesomeIcon
              icon="fa-solid fa-magnifying-glass"
              className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              placeholder="Search eval runs…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-8 py-2 text-sm text-gray-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-200"
            />
          </div>

          {/* Scope filter */}
          <div className="min-w-[140px]">
            <select
              value={scopeFilter}
              onChange={(e) => {
                setScopeFilter(e.target.value as EvalScopeFilter);
                // Clear targetId when switching scopes
                if (e.target.value === 'all' || e.target.value === 'global') {
                  setTargetIdFilter(null);
                }
              }}
              className={cn(
                'h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm',
                'focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'
              )}
            >
              <option value="all">All scopes</option>
              <option value="global">Global</option>
              <option value="agent">Agent</option>
              <option value="person">Person</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={cn(
                'h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm',
                'focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'
              )}
            >
              <option value="all">All statuses</option>
              <option value="completed">Completed</option>
              <option value="running">Running</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main content - 2 column layout */}
      <div className="grid gap-4 md:grid-cols-[1fr,480px]">
        {/* Left column - Recent eval runs */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Recent eval runs {filteredRuns.length !== MOCK_EVAL_RUNS.length && `(${filteredRuns.length})`}
            </h2>
          </div>

          {filteredRuns.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">No eval runs match your filters.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRuns.map((run) => (
                <div
                  key={run.id}
                  className={cn(
                    'rounded-lg border p-3 transition-colors',
                    selectedRun?.id === run.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedRun(run)}
                      className="flex-1 text-left cursor-pointer"
                    >
                      <div className="flex w-full items-center justify-between gap-2 mb-1">
                        <p className="truncate text-sm font-medium text-gray-900">{run.name}</p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <ScopeChip scope={run.scope} />
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                              getStatusColor(run.status)
                            )}
                          >
                            {run.status === 'running' && (
                              <FontAwesomeIcon icon="fa-solid fa-spinner" className="h-3 w-3 mr-1 animate-spin" />
                            )}
                            {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <p className="truncate text-[11px] text-gray-500">
                        {run.scope === 'global'
                          ? `Global • Suite: ${run.suite}`
                          : `${run.scope === 'agent' ? 'Agent' : 'Person'}: ${run.targetName} • Suite: ${run.suite}`}
                      </p>
                      {run.status === 'completed' && (
                        <p className="text-xs font-semibold text-gray-900 mt-1">
                          {run.score}/{run.maxScore} ({getScoreGrade(run.score, run.maxScore)})
                        </p>
                      )}
                      <div className="mt-1.5 text-[10px] text-gray-500">
                        Run by {run.createdBy} • {new Date(run.runDate).toLocaleDateString()}
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`${basePath}/${run.id}`);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right column - Eval run detail or Suites */}
        <div className="space-y-4">
          {selectedRun ? (
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm max-h-[calc(100vh-12rem)] overflow-y-auto">
              <EvalRunDetail
                run={selectedRun}
                basePath={basePath}
                guardrailSummary={
                  selectedRun.status === 'completed'
                    ? [
                        {
                          category: 'Fairness & DEI',
                          passing: 15,
                          total: 15,
                        },
                        {
                          category: 'Safety',
                          passing: 11,
                          total: 12,
                          escalations: 1,
                        },
                        {
                          category: 'Privacy & PII',
                          passing: 9,
                          total: 9,
                        },
                      ]
                    : undefined
                }
                runLog={
                  selectedRun.status === 'completed'
                    ? [
                        {
                          timestamp: '10:32:14',
                          message: 'Run started (suite v2.3, Admissions agent v4)',
                        },
                        {
                          timestamp: '10:32:15',
                          message: 'Scenario #08 failed (mental health escalation guardrail)',
                        },
                        {
                          timestamp: '10:32:19',
                          message: 'Human escalation rule triggered',
                        },
                        {
                          timestamp: '10:32:25',
                          message: 'Run completed',
                        },
                      ]
                    : undefined
                }
                onViewInLogs={() => {
                  if (selectedRun.scope === 'agent' && selectedRun.targetId) {
                    router.push(`${logsBasePath}?scope=agent&agentId=${selectedRun.targetId}`);
                  } else if (selectedRun.scope === 'person' && selectedRun.targetId) {
                    router.push(`${logsBasePath}?scope=person&personId=${selectedRun.targetId}`);
                  } else {
                    router.push(logsBasePath);
                  }
                }}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Eval suites & scenarios</h2>
                <p className="text-xs text-gray-600 mt-1">
                  Group related scenarios into suites to run consistent evals as you change prompts, agents, or guardrails.
                </p>
              </div>

              <div className="space-y-2">
                {MOCK_SUITES.map((suite) => (
                  <div
                    key={suite.id}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900">{suite.name}</p>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          {suite.testCaseCount} test cases
                        </p>
                        {suite.lastRunDate && (
                          <p className="text-[10px] text-gray-500 mt-1">
                            Last run: {new Date(suite.lastRunDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs h-7 mt-2">
                      View
                    </Button>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" className="w-full text-xs">
                <FontAwesomeIcon icon="fa-solid fa-plus" className="h-3 w-3 mr-2" />
                New suite
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Metrics & trends placeholder */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Metrics & trends</h2>
        <p className="text-xs text-gray-600 mt-1">
          Future home for score trends over time by product, role, or agent.
        </p>
        <div className="mt-4 flex items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-xs text-gray-400">Metrics visualization coming soon</p>
        </div>
      </div>
    </div>
  );
}





