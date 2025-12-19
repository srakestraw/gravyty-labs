'use client';

import { useState } from 'react';
import { dataClient } from '@/lib/data';
import type { ProgramMatchWidgetConfig, ProgramMatchRFI, ProgramMatchQuizQuestion, ProgramMatchExplanationsResult } from '@/lib/data/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface ProgramMatchWidgetClientProps {
  widgetConfig: ProgramMatchWidgetConfig;
}

type Step = 'gate' | 'quiz' | 'results';

export function ProgramMatchWidgetClient({ widgetConfig }: ProgramMatchWidgetClientProps) {
  const [step, setStep] = useState<Step>('gate');
  const [rfiId, setRfiId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<{ topProgramIds: string[]; confidenceLabel: 'high' | 'medium' | 'low'; reasons: string[] } | null>(null);
  const [explanations, setExplanations] = useState<ProgramMatchExplanationsResult | null>(null);

  // Gate form state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [emailOptIn, setEmailOptIn] = useState(false);

  const questions = widgetConfig.quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };
      const rfi = await dataClient.createProgramMatchRFI(ctx, {
        publishedSnapshotId: widgetConfig.publishedSnapshotId,
        quizId: widgetConfig.quiz.quizId,
        quizVersionId: widgetConfig.quiz.id,
        contact: {
          email: email.trim(),
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          phone: phone.trim() || undefined,
        },
      });
      setRfiId(rfi.id);
      setStep('quiz');
    } catch (error) {
      console.error('Failed to create RFI:', error);
      alert('Failed to start quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    if (question.type === 'single_select') {
      setAnswers({ ...answers, [questionId]: [optionId] });
    } else {
      const current = answers[questionId] || [];
      const newAnswers = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      setAnswers({ ...answers, [questionId]: newAnswers });
    }
  };

  const handleNextQuestion = async () => {
    if (!rfiId) return;

    // Update progress
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };
      await dataClient.updateProgramMatchRFIProgress(ctx, {
        rfiId,
        lastQuestionIndex: currentQuestionIndex,
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate results using provider scoring
      try {
        const ctx = {
          workspace: 'admissions',
          app: 'student-lifecycle',
        };

        // Convert answers to payload format
        const answerPayloads: Array<{ questionId: string; selectedOptionIds: string[]; skipped?: boolean }> = questions.map(q => ({
          questionId: q.id,
          selectedOptionIds: answers[q.id] || [],
          skipped: !answers[q.id] || answers[q.id].length === 0,
        }));

        // Score responses
        const scoreResult = await dataClient.scoreProgramMatchResponses(ctx, {
          publishedSnapshotId: widgetConfig.publishedSnapshotId,
          answers: answerPayloads,
        });

        // Generate explanations
        let explanationsResult;
        try {
          explanationsResult = await dataClient.generateProgramMatchExplanations(ctx, {
            publishedSnapshotId: widgetConfig.publishedSnapshotId,
            toneProfileId: widgetConfig.voiceToneProfileId,
            scoreResult,
            includeOutcomes: widgetConfig.outcomesEnabled,
          });
        } catch (error) {
          console.error('Failed to generate explanations, using fallback:', error);
          // Fallback will be handled by generateProgramMatchExplanations
          explanationsResult = await dataClient.generateProgramMatchExplanations(ctx, {
            publishedSnapshotId: widgetConfig.publishedSnapshotId,
            toneProfileId: widgetConfig.voiceToneProfileId,
            scoreResult,
            includeOutcomes: widgetConfig.outcomesEnabled,
          });
        }

        // Attach explanations to RFI
        await dataClient.attachProgramMatchExplanationsToRFI(ctx, {
          rfiId,
          explanations: explanationsResult,
        });

        // Store explanations for rendering
        setExplanations(explanationsResult);

        // Complete RFI with results
        const calculatedResults = {
          topProgramIds: scoreResult.topProgramIds,
          confidenceLabel: scoreResult.confidenceLabel,
          reasons: explanationsResult.explanations[0]?.bullets || ['This program matches your interests and goals'],
        };
        setResults(calculatedResults);
        await dataClient.completeProgramMatchRFI(ctx, {
          rfiId,
          results: calculatedResults,
        });
        setStep('results');
      } catch (error) {
        console.error('Failed to complete RFI:', error);
        alert('Failed to complete quiz. Please try again.');
      }
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestion?.isOptional) {
      handleNextQuestion();
    }
  };

  // calculateResults is no longer used - scoring is done via provider

  if (step === 'gate') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{widgetConfig.gate.headline}</h1>
          <p className="text-gray-600 mb-6">{widgetConfig.gate.helperText}</p>
          <form onSubmit={handleGateSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
              />
            </div>
            {widgetConfig.gate.requiredFields.firstName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>
            )}
            {widgetConfig.gate.requiredFields.lastName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            )}
            {widgetConfig.gate.requiredFields.phone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            )}
            {widgetConfig.gate.consent?.emailOptIn && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="emailOptIn"
                  checked={emailOptIn}
                  onChange={(e) => setEmailOptIn(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="emailOptIn" className="text-sm text-gray-700">
                  I'd like to receive updates via email
                </label>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Starting...' : 'Start Quiz'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'quiz') {
    if (!currentQuestion) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading question...</p>
        </div>
      );
    }

    const selectedOptionIds = answers[currentQuestion.id] || [];
    const canProceed = currentQuestion.type === 'single_select' 
      ? selectedOptionIds.length === 1
      : selectedOptionIds.length > 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              {currentQuestion.isOptional && (
                <button
                  onClick={handleSkipQuestion}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Skip
                </button>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">{currentQuestion.prompt}</h2>
          {currentQuestion.helperText && (
            <p className="text-sm text-gray-600 mb-6">{currentQuestion.helperText}</p>
          )}

          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOptionIds.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">{option.label}</span>
                    {isSelected && (
                      <FontAwesomeIcon icon="fa-solid fa-check-circle" className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            {currentQuestionIndex > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                className="flex-1"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={handleNextQuestion}
              disabled={!canProceed && !currentQuestion.isOptional}
              className="flex-1"
            >
              {currentQuestionIndex === questions.length - 1 ? 'See Results' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'results' && results) {
    const topProgram = widgetConfig.programs.find(p => p.id === results.topProgramIds[0]);
    const runnerUp = widgetConfig.programs.find(p => p.id === results.topProgramIds[1]);
    const topExplanation = explanations?.explanations.find(e => e.programId === results.topProgramIds[0]);
    const runnerUpExplanation = explanations?.explanations.find(e => e.programId === results.topProgramIds[1]);

    const confidenceLabels = {
      high: 'High confidence match',
      medium: 'Good match',
      low: 'Starting point',
    };

    const confidenceColors = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800',
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <FontAwesomeIcon icon="fa-solid fa-check-circle" className="h-16 w-16 text-green-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Program Matches</h1>
            <p className="text-gray-600">Based on your answers, here are programs that might be a great fit for you.</p>
          </div>

          {topProgram && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-900">Top Match</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${confidenceColors[results.confidenceLabel]}`}>
                  {confidenceLabels[results.confidenceLabel]}
                </span>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{topProgram.name}</h3>
                {topExplanation && (
                  <p className="text-sm text-gray-700 mb-3 font-medium">{topExplanation.headline}</p>
                )}
                <ul className="space-y-2 mb-4">
                  {(topExplanation?.bullets || results.reasons).map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <FontAwesomeIcon icon="fa-solid fa-check" className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full">
                  {topExplanation?.nextStepCtaLabel || 'Request Information'}
                </Button>
                {topExplanation?.nextStepCtaHelper && (
                  <p className="text-xs text-gray-500 text-center mt-2">{topExplanation.nextStepCtaHelper}</p>
                )}
              </div>
            </div>
          )}

          {runnerUp && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Also Consider</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{runnerUp.name}</h3>
                {runnerUpExplanation && (
                  <p className="text-xs text-gray-600 mb-2">{runnerUpExplanation.headline}</p>
                )}
                <Button variant="outline" className="w-full">
                  Learn More
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

