'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type EvalMeasurementType =
  | 'accuracy'
  | 'safety'
  | 'guardrail_compliance'
  | 'fairness'
  | 'workflow'
  | 'custom';

type Workspace = 'Admissions' | 'Registrar' | 'Student Success' | 'Career Services' | 'Alumni Engagement' | 'Advancement' | 'Cross-workspace';

type ScenarioSource = 'template' | 'manual' | 'ai';

interface Scenario {
  id: string;
  userMessage: string;
  expectedBehavior: string;
  category?: string;
}

interface EvalConfig {
  name: string;
  measurementType: EvalMeasurementType | null;
  workspace: Workspace | null;
  targets: string[];
  scenarioSource: ScenarioSource | null;
  selectedTemplate?: string;
  scenarios: Scenario[];
  scoringMethod: 'pass_fail' | 'rubric' | 'custom' | null;
  rubricFocus: string[];
  minScore: number;
  runFrequency: 'once' | 'on_change' | 'scheduled' | null;
  scheduleType?: 'weekly' | 'daily' | 'monthly';
  scheduleDay?: string;
  notifications: string[];
  highlightOnAgentPage: boolean;
}

const WORKSPACES: Workspace[] = [
  'Admissions',
  'Registrar',
  'Student Success',
  'Career Services',
  'Alumni Engagement',
  'Advancement',
  'Cross-workspace',
];

const MOCK_ASSISTANTS = [
  'Admissions Assistant – Application Status',
  'Stalled Applicant Agent',
  'Melt Prevention Agent',
  'Student Success Assistant – First-Year Cohort',
  'Donor Recovery Agent',
];

const MOCK_TEMPLATES = [
  { id: 'template-1', name: 'Admissions – Stalled Applicants', scenarioCount: 10 },
  { id: 'template-2', name: 'Admissions – Melt Prevention', scenarioCount: 8 },
  { id: 'template-3', name: 'Donor Recovery – LYBUNT', scenarioCount: 12 },
];

const RUBRIC_OPTIONS = [
  'Accuracy of information',
  'Completeness',
  'Tone & empathy',
  'Policy alignment',
  'Safety & escalation behavior',
  'Fairness / non-discrimination',
];

export default function CreateEvalPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [config, setConfig] = React.useState<EvalConfig>({
    name: '',
    measurementType: null,
    workspace: null,
    targets: [],
    scenarioSource: null,
    scenarios: [],
    scoringMethod: null,
    rubricFocus: [],
    minScore: 85,
    runFrequency: null,
    notifications: [],
    highlightOnAgentPage: true,
  });
  const [aiPrompt, setAiPrompt] = React.useState('');
  const [generatingScenarios, setGeneratingScenarios] = React.useState(false);

  const updateConfig = (updates: Partial<EvalConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const addScenario = () => {
    const newScenario: Scenario = {
      id: `scenario-${Date.now()}`,
      userMessage: '',
      expectedBehavior: '',
    };
    updateConfig({ scenarios: [...config.scenarios, newScenario] });
  };

  const updateScenario = (id: string, updates: Partial<Scenario>) => {
    updateConfig({
      scenarios: config.scenarios.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    });
  };

  const removeScenario = (id: string) => {
    updateConfig({ scenarios: config.scenarios.filter((s) => s.id !== id) });
  };

  const toggleTarget = (target: string) => {
    if (config.targets.includes(target)) {
      updateConfig({ targets: config.targets.filter((t) => t !== target) });
    } else {
      updateConfig({ targets: [...config.targets, target] });
    }
  };

  const toggleRubricFocus = (focus: string) => {
    if (config.rubricFocus.includes(focus)) {
      updateConfig({ rubricFocus: config.rubricFocus.filter((f) => f !== focus) });
    } else {
      updateConfig({ rubricFocus: [...config.rubricFocus, focus] });
    }
  };

  const handleGenerateScenarios = async () => {
    setGeneratingScenarios(true);
    // TODO: Replace with real AI generation API
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const generated: Scenario[] = [
      {
        id: `scenario-${Date.now()}-1`,
        userMessage: 'I haven\'t logged in for 10 days and I\'m missing my transcript.',
        expectedBehavior: 'Detect stalled status, check timeline, provide clear next steps without hallucinated dates.',
      },
      {
        id: `scenario-${Date.now()}-2`,
        userMessage: 'I submitted my application but haven\'t received any confirmation.',
        expectedBehavior: 'Verify submission status, provide confirmation details, offer to check system.',
      },
      {
        id: `scenario-${Date.now()}-3`,
        userMessage: 'I need to know if my recommendation letters were received.',
        expectedBehavior: 'Check recommendation letter status, provide specific information, offer next steps if missing.',
      },
    ];
    
    updateConfig({ scenarios: generated });
    setGeneratingScenarios(false);
  };

  const canProceedToNext = () => {
    switch (step) {
      case 1:
        return config.name && config.measurementType && config.workspace && config.targets.length > 0;
      case 2:
        return config.scenarioSource && (
          (config.scenarioSource === 'template' && config.selectedTemplate) ||
          (config.scenarioSource === 'manual' && config.scenarios.length > 0) ||
          (config.scenarioSource === 'ai' && config.scenarios.length > 0)
        );
      case 3:
        return config.scoringMethod && (config.scoringMethod !== 'rubric' || config.rubricFocus.length > 0);
      case 4:
        return config.runFrequency !== null;
      default:
        return false;
    }
  };

  const handleCreate = () => {
    // TODO: Replace with real API call
    console.log('Creating eval:', config);
    router.push('/ai-assistants/evals');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-gray-900">Create Eval</h1>
        <p className="text-sm text-gray-600">
          Set up a repeatable test to measure how an assistant or agent is performing.
        </p>
      </header>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                  step >= s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                )}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className={cn(
                    'h-0.5 w-12',
                    step > s ? 'bg-indigo-600' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
        {/* STEP 1 - Basics */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Step 1 — Basics</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Eval name
                  </label>
                  <Input
                    value={config.name}
                    onChange={(e) => updateConfig({ name: e.target.value })}
                    placeholder="Admissions – Stalled Applicants Safety Check"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What do you want to measure?
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'accuracy', label: 'Accuracy & correctness' },
                      { value: 'safety', label: 'Safety & escalation' },
                      { value: 'guardrail_compliance', label: 'Guardrail compliance (quiet hours, DNE, etc.)' },
                      { value: 'fairness', label: 'Fairness & DEI' },
                      { value: 'workflow', label: 'Workflow / multi-step behavior' },
                      { value: 'custom', label: 'Custom' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="measurementType"
                          value={option.value}
                          checked={config.measurementType === option.value}
                          onChange={() => updateConfig({ measurementType: option.value as EvalMeasurementType })}
                          className="h-4 w-4 text-indigo-600"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Which workspace is this for?
                  </label>
                  <select
                    value={config.workspace || ''}
                    onChange={(e) => updateConfig({ workspace: e.target.value as Workspace })}
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                  >
                    <option value="">Select workspace</option>
                    {WORKSPACES.map((ws) => (
                      <option key={ws} value={ws}>
                        {ws}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Which assistants or agents should this eval target?
                  </label>
                  <div className="rounded-md border border-gray-200 p-3 space-y-2 max-h-48 overflow-y-auto">
                    {MOCK_ASSISTANTS.map((assistant) => (
                      <label key={assistant} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.targets.includes(assistant)}
                          onChange={() => toggleTarget(assistant)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                        />
                        <span className="text-sm text-gray-700">{assistant}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 - Scenarios */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Step 2 — Scenarios</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How do you want to add test scenarios?
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'template', label: 'Start from a template' },
                      { value: 'manual', label: 'Write my own' },
                      { value: 'ai', label: 'Use AI to generate scenarios' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="scenarioSource"
                          value={option.value}
                          checked={config.scenarioSource === option.value}
                          onChange={() => updateConfig({ scenarioSource: option.value as ScenarioSource })}
                          className="h-4 w-4 text-indigo-600"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Template selection */}
                {config.scenarioSource === 'template' && (
                  <div className="space-y-2">
                    {MOCK_TEMPLATES.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => updateConfig({ selectedTemplate: template.id })}
                        className={cn(
                          'rounded-lg border p-3 cursor-pointer transition-colors',
                          config.selectedTemplate === template.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        )}
                      >
                        <p className="text-sm font-medium text-gray-900">{template.name}</p>
                        <p className="text-xs text-gray-600">{template.scenarioCount} scenarios</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Manual scenario entry */}
                {config.scenarioSource === 'manual' && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Scenario</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">User message / situation</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">What should the assistant/agent do?</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-20"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {config.scenarios.map((scenario, index) => (
                            <tr key={scenario.id}>
                              <td className="px-3 py-2 text-xs text-gray-600">{index + 1}</td>
                              <td className="px-3 py-2">
                                <Input
                                  value={scenario.userMessage}
                                  onChange={(e) => updateScenario(scenario.id, { userMessage: e.target.value })}
                                  placeholder="User message or situation"
                                  className="w-full text-xs"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  value={scenario.expectedBehavior}
                                  onChange={(e) => updateScenario(scenario.id, { expectedBehavior: e.target.value })}
                                  placeholder="Expected behavior"
                                  className="w-full text-xs"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <button
                                  type="button"
                                  onClick={() => removeScenario(scenario.id)}
                                  className="text-xs text-red-600 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addScenario}>
                      <FontAwesomeIcon icon="fa-solid fa-plus" className="h-3 w-3 mr-2" />
                      Add scenario
                    </Button>
                  </div>
                )}

                {/* AI generation */}
                {config.scenarioSource === 'ai' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Describe what you'd like to test
                      </label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Stalled applicants who haven't logged in for 10+ days and are missing documents."
                        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                        rows={3}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleGenerateScenarios}
                      disabled={!aiPrompt || generatingScenarios}
                    >
                      {generatingScenarios ? (
                        <>
                          <FontAwesomeIcon icon="fa-solid fa-spinner" className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          Generate scenarios
                        </>
                      )}
                    </Button>
                    {config.scenarios.length > 0 && (
                      <div className="space-y-2">
                        {config.scenarios.map((scenario, index) => (
                          <div key={scenario.id} className="rounded-lg border border-gray-200 p-3 space-y-1">
                            <p className="text-xs font-medium text-gray-900">Scenario {index + 1}</p>
                            <p className="text-xs text-gray-700">{scenario.userMessage}</p>
                            <p className="text-xs text-gray-600">{scenario.expectedBehavior}</p>
                            <button
                              type="button"
                              onClick={() => removeScenario(scenario.id)}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 - Scoring */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Step 3 — Scoring & Thresholds</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How should this eval score responses?
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'pass_fail', label: 'Simple pass / fail' },
                      { value: 'rubric', label: '0–100 score with rubric (recommended)' },
                      { value: 'custom', label: 'Custom scoring (advanced)' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="scoringMethod"
                          value={option.value}
                          checked={config.scoringMethod === option.value}
                          onChange={() => updateConfig({ scoringMethod: option.value as any })}
                          className="h-4 w-4 text-indigo-600"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {config.scoringMethod === 'rubric' && (
                  <div className="space-y-4 pl-6 border-l-2 border-indigo-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What matters most for this eval?
                      </label>
                      <div className="space-y-2">
                        {RUBRIC_OPTIONS.map((option) => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={config.rubricFocus.includes(option)}
                              onChange={() => toggleRubricFocus(option)}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum acceptable score to pass
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={config.minScore}
                          onChange={(e) => updateConfig({ minScore: Number(e.target.value) })}
                          className="w-20"
                        />
                        <span className="text-sm text-gray-600">/ 100</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        If the average score drops below this threshold, we'll flag this assistant/agent as 'At Risk' in the Evals dashboard.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 - Run & Notifications */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Step 4 — Run & Notifications</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    When should this eval run?
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'once', label: 'Run once now' },
                      { value: 'on_change', label: 'Every time this assistant/agent is changed' },
                      { value: 'scheduled', label: 'On a schedule' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="runFrequency"
                          value={option.value}
                          checked={config.runFrequency === option.value}
                          onChange={() => updateConfig({ runFrequency: option.value as any })}
                          className="h-4 w-4 text-indigo-600"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {config.runFrequency === 'scheduled' && (
                    <div className="mt-3 pl-6 space-y-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={config.scheduleType || 'weekly'}
                          onChange={(e) => updateConfig({ scheduleType: e.target.value as any })}
                          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="daily">Daily</option>
                          <option value="monthly">Monthly</option>
                        </select>
                        {config.scheduleType === 'weekly' && (
                          <>
                            <span className="text-sm text-gray-600">Day:</span>
                            <select
                              value={config.scheduleDay || 'monday'}
                              onChange={(e) => updateConfig({ scheduleDay: e.target.value })}
                              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900"
                            >
                              <option value="monday">Monday</option>
                              <option value="tuesday">Tuesday</option>
                              <option value="wednesday">Wednesday</option>
                              <option value="thursday">Thursday</option>
                              <option value="friday">Friday</option>
                              <option value="saturday">Saturday</option>
                              <option value="sunday">Sunday</option>
                            </select>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Who should be notified about results?
                  </label>
                  <div className="rounded-md border border-gray-200 p-3 space-y-2">
                    {['You (Owner)', 'Product / AI Lead', 'Relevant team channel'].map((recipient) => (
                      <label key={recipient} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.notifications.includes(recipient)}
                          onChange={() => {
                            if (config.notifications.includes(recipient)) {
                              updateConfig({ notifications: config.notifications.filter((n) => n !== recipient) });
                            } else {
                              updateConfig({ notifications: [...config.notifications, recipient] });
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                        />
                        <span className="text-sm text-gray-700">{recipient}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.highlightOnAgentPage}
                      onChange={(e) => updateConfig({ highlightOnAgentPage: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                    />
                    <span className="text-sm text-gray-700">Highlight failed evals on the agent detail page</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => step > 1 ? setStep(step - 1) : router.back()}
        >
          {step > 1 ? 'Back' : 'Cancel'}
        </Button>
        <div className="flex items-center gap-2">
          {step < 4 && (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceedToNext()}
            >
              Next <FontAwesomeIcon icon="fa-solid fa-chevron-right" className="h-3 w-3 ml-1" />
            </Button>
          )}
          {step === 4 && (
            <Button onClick={handleCreate}>
              Create & Run Eval
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}




