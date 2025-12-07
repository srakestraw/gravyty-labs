'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  safetyScore?: number;
  factualityScore?: number;
  guardrailPassCount?: number;
  guardrailFailCount?: number;
  testCases?: TestCase[];
}

interface TestCase {
  id: string;
  scenarioName: string;
  outcome: 'pass' | 'fail';
  score: number;
  prompt?: string;
  response?: string;
  expected?: string;
  notes?: string;
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
    safetyScore: 92,
    factualityScore: 85,
    guardrailPassCount: 45,
    guardrailFailCount: 2,
    testCases: [
      {
        id: 'tc-1',
        scenarioName: 'Stalled applicant reminder',
        outcome: 'pass',
        score: 95,
        prompt: 'Student has not submitted transcript for 2 weeks',
        response: 'Sent reminder with clear next steps',
        expected: 'Reminder sent with actionable guidance',
      },
      {
        id: 'tc-2',
        scenarioName: 'Financial aid question',
        outcome: 'fail',
        score: 60,
        prompt: 'Student asks about FAFSA deadline',
        response: 'Generic response about financial aid',
        expected: 'Specific FAFSA deadline and steps',
        notes: 'Missing specific deadline information',
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

export default function EvalsPage() {
  const router = useRouter();
  const [selectedRun, setSelectedRun] = React.useState<EvalRun | null>(null);
  const [activeTab, setActiveTab] = React.useState<'scenarios' | 'guardrails' | 'failures'>('scenarios');

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

  const filteredTestCases = React.useMemo(() => {
    if (!selectedRun?.testCases) return [];
    if (activeTab === 'failures') {
      return selectedRun.testCases.filter((tc) => tc.outcome === 'fail');
    }
    return selectedRun.testCases;
  }, [selectedRun, activeTab]);

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
          <Button size="sm" className="text-sm" onClick={() => router.push('/ai-assistants/evals/new')}>
            <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4 mr-2" />
            New eval run
          </Button>
        </div>
      </header>

      {/* Main content - 2 column layout */}
      <div className="grid gap-4 md:grid-cols-[1fr,320px]">
        {/* Left column - Recent eval runs */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent eval runs</h2>
          </div>

          <div className="space-y-2">
            {MOCK_EVAL_RUNS.map((run) => (
              <div
                key={run.id}
                className={cn(
                  'rounded-lg border p-3 transition-colors',
                  selectedRun?.id === run.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setSelectedRun(run)}
                    className="flex-1 text-left cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{run.name}</p>
                        <p className="text-[11px] text-gray-600 mt-0.5">{run.suite}</p>
                        <p className="text-[11px] text-gray-500 mt-1">Target: {run.target}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
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
                        {run.status === 'completed' && (
                          <span className="text-xs font-semibold text-gray-900">
                            {run.score}/{run.maxScore} ({getScoreGrade(run.score, run.maxScore)})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-500">
                      Run by {run.createdBy} • {new Date(run.runDate).toLocaleDateString()}
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/ai-assistants/evals/${run.id}`);
                    }}
                  >
                    Edit
                  </Button>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{run.name}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">{run.suite}</p>
                    <p className="text-[11px] text-gray-500 mt-1">Target: {run.target}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
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
                    {run.status === 'completed' && (
                      <span className="text-xs font-semibold text-gray-900">
                        {run.score}/{run.maxScore} ({getScoreGrade(run.score, run.maxScore)})
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-gray-500">
                  Run by {run.createdBy} • {new Date(run.runDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {/* Eval run detail panel */}
          {selectedRun && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{selectedRun.name}</h3>
                <p className="text-xs text-gray-600 mt-1">{selectedRun.suite}</p>
                <div className="mt-2 flex items-center gap-4 text-[11px] text-gray-600">
                  <span>Target: {selectedRun.target}</span>
                  <span>•</span>
                  <span>Created by {selectedRun.createdBy}</span>
                  <span>•</span>
                  <span>{new Date(selectedRun.runDate).toLocaleDateString()}</span>
                </div>
              </div>

              {selectedRun.status === 'completed' && (
                <>
                  {/* Aggregate scores */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-md border border-gray-100 bg-gray-50 p-2">
                      <p className="text-[10px] text-gray-500">Overall score</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedRun.score}/{selectedRun.maxScore}
                      </p>
                    </div>
                    {selectedRun.safetyScore !== undefined && (
                      <div className="rounded-md border border-gray-100 bg-gray-50 p-2">
                        <p className="text-[10px] text-gray-500">Safety score</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedRun.safetyScore}/100</p>
                      </div>
                    )}
                    {selectedRun.factualityScore !== undefined && (
                      <div className="rounded-md border border-gray-100 bg-gray-50 p-2">
                        <p className="text-[10px] text-gray-500">Factuality score</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedRun.factualityScore}/100</p>
                      </div>
                    )}
                    {selectedRun.guardrailPassCount !== undefined && (
                      <div className="rounded-md border border-gray-100 bg-gray-50 p-2">
                        <p className="text-[10px] text-gray-500">Guardrails</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedRun.guardrailPassCount} pass, {selectedRun.guardrailFailCount} fail
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Tabs */}
                  {selectedRun.testCases && selectedRun.testCases.length > 0 && (
                    <>
                      <div className="flex gap-1 border-b border-gray-200">
                        <button
                          type="button"
                          onClick={() => setActiveTab('scenarios')}
                          className={cn(
                            'px-3 py-1.5 text-[11px] font-medium transition-colors',
                            activeTab === 'scenarios'
                              ? 'text-indigo-600 border-b-2 border-indigo-600'
                              : 'text-gray-600 hover:text-gray-900'
                          )}
                        >
                          Scenarios ({selectedRun.testCases.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('guardrails')}
                          className={cn(
                            'px-3 py-1.5 text-[11px] font-medium transition-colors',
                            activeTab === 'guardrails'
                              ? 'text-indigo-600 border-b-2 border-indigo-600'
                              : 'text-gray-600 hover:text-gray-900'
                          )}
                        >
                          Guardrails
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('failures')}
                          className={cn(
                            'px-3 py-1.5 text-[11px] font-medium transition-colors',
                            activeTab === 'failures'
                              ? 'text-indigo-600 border-b-2 border-indigo-600'
                              : 'text-gray-600 hover:text-gray-900'
                          )}
                        >
                          Failures only ({selectedRun.testCases.filter((tc) => tc.outcome === 'fail').length})
                        </button>
                      </div>

                      {/* Test cases list */}
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredTestCases.map((testCase) => (
                          <div
                            key={testCase.id}
                            className="rounded-md border border-gray-100 bg-white p-2 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-gray-900">{testCase.scenarioName}</p>
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                                    testCase.outcome === 'pass'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  )}
                                >
                                  {testCase.outcome === 'pass' ? 'Pass' : 'Fail'}
                                </span>
                                <span className="text-[11px] text-gray-600">Score: {testCase.score}</span>
                              </div>
                            </div>
                            {testCase.prompt && (
                              <div className="text-[11px] space-y-1">
                                <p className="font-medium text-gray-700">Prompt:</p>
                                <p className="text-gray-600">{testCase.prompt}</p>
                              </div>
                            )}
                            {testCase.response && (
                              <div className="text-[11px] space-y-1">
                                <p className="font-medium text-gray-700">Response:</p>
                                <p className="text-gray-600">{testCase.response}</p>
                              </div>
                            )}
                            {testCase.expected && (
                              <div className="text-[11px] space-y-1">
                                <p className="font-medium text-gray-700">Expected:</p>
                                <p className="text-gray-600">{testCase.expected}</p>
                              </div>
                            )}
                            {testCase.notes && (
                              <div className="text-[11px] space-y-1">
                                <p className="font-medium text-gray-700">Notes:</p>
                                <p className="text-gray-600">{testCase.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right column - Eval suites */}
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

