'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import type { QuizQuestion, ProgramMatchProgress } from '@/lib/program-match/types';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { trackQuizStarted, trackQuestionAnswered, trackProgressSaved, trackQuizCompleted } from '@/lib/program-match/events';

interface QuizProps {
  questions: QuizQuestion[];
  initialProgress?: ProgramMatchProgress;
  leadId?: string;
  quizId?: string;
  versionId?: string;
  onAnswer: (questionId: string, answer: string | string[]) => void;
  onSaveProgress: (progress: {
    responses_partial: Record<string, string | string[]>;
    current_step: 'gate' | 'quiz' | 'results' | 'readiness';
    current_question_index?: number;
  }) => Promise<void>;
  onComplete: (responses: Record<string, string | string[]>) => Promise<void>;
}

export function Quiz({
  questions,
  initialProgress,
  leadId,
  quizId,
  versionId,
  onAnswer,
  onSaveProgress,
  onComplete,
}: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(initialProgress?.current_question_index || 0);
  const [responses, setResponses] = useState<Record<string, string | string[]>>(
    initialProgress?.responses_partial || {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasTrackedStart, setHasTrackedStart] = useState(false);

  // Track quiz started on mount
  useEffect(() => {
    if (leadId && !hasTrackedStart && questions.length > 0) {
      trackQuizStarted({ lead_id: leadId, quiz_id: quizId, version_id: versionId });
      setHasTrackedStart(true);
    }
  }, [leadId, hasTrackedStart, questions.length, quizId, versionId]);

  // Debounced save function
  const debouncedSave = useDebounce(
    useCallback(async (progress: {
      responses_partial: Record<string, string | string[]>;
      current_step: 'gate' | 'quiz' | 'results' | 'readiness';
      current_question_index?: number;
    }) => {
      setIsSaving(true);
      setSaveError(null);
      try {
        await onSaveProgress(progress);
        if (leadId) {
          trackProgressSaved({
            lead_id: leadId,
            questions_answered: Object.keys(progress.responses_partial).length,
            quiz_id: quizId,
            version_id: versionId,
          });
        }
      } catch (err) {
        setSaveError('Failed to save progress. Please check your connection.');
        console.error('Save progress error:', err);
      } finally {
        setIsSaving(false);
      }
    }, [onSaveProgress, leadId, quizId, versionId]),
    1000
  );

  // Auto-save on response change
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      debouncedSave({
        responses_partial: responses,
        current_step: 'quiz',
        current_question_index: currentIndex,
      });
    }
  }, [responses, currentIndex, debouncedSave]);

  // Save on visibility change / unload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && Object.keys(responses).length > 0) {
        onSaveProgress({
          responses_partial: responses,
          current_step: 'quiz',
          current_question_index: currentIndex,
        }).catch(console.error);
      }
    };

    const handleBeforeUnload = () => {
      if (Object.keys(responses).length > 0) {
        // Use sendBeacon for best-effort save on unload
        navigator.sendBeacon?.(
          '/api/program-match/progress',
          JSON.stringify({
            responses_partial: responses,
            current_step: 'quiz',
            current_question_index: currentIndex,
          })
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [responses, currentIndex, onSaveProgress]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
    onAnswer(questionId, answer);
    
    // Track question answered
    if (leadId) {
      trackQuestionAnswered({
        lead_id: leadId,
        question_id: questionId,
        quiz_id: quizId,
        version_id: versionId,
      });
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    // Final save before completion
    await onSaveProgress({
      responses_partial: responses,
      current_step: 'quiz',
      current_question_index: currentIndex,
    });
    
    // Track completion
    if (leadId) {
      trackQuizCompleted({
        lead_id: leadId,
        quiz_id: quizId,
        version_id: versionId,
      });
    }
    
    await onComplete(responses);
  };

  const canProceed = () => {
    if (!currentQuestion.required) return true;
    const answer = responses[currentQuestion.question_id];
    if (currentQuestion.type === 'multi_select') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return answer !== undefined && answer !== '';
  };

  if (!currentQuestion) {
    return <div>No questions available</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Save status */}
      {isSaving && (
        <div className="mb-4 text-sm text-gray-500">Saving progress...</div>
      )}
      {saveError && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
          {saveError}
        </div>
      )}

      {/* Question */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {currentQuestion.text}
        </h2>

        {currentQuestion.type === 'single_select' && currentQuestion.options && (
          <div className="space-y-2">
            {currentQuestion.options.map((option) => (
              <button
                key={option.option_id}
                onClick={() => handleAnswer(currentQuestion.question_id, option.option_id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  responses[currentQuestion.question_id] === option.option_id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'multi_select' && currentQuestion.options && (
          <div className="space-y-2">
            {currentQuestion.options.map((option) => {
              const selected = Array.isArray(responses[currentQuestion.question_id])
                ? (responses[currentQuestion.question_id] as string[]).includes(option.option_id)
                : false;
              return (
                <button
                  key={option.option_id}
                  onClick={() => {
                    const current = Array.isArray(responses[currentQuestion.question_id])
                      ? (responses[currentQuestion.question_id] as string[])
                      : [];
                    const newValue = selected
                      ? current.filter((id) => id !== option.option_id)
                      : [...current, option.option_id];
                    handleAnswer(currentQuestion.question_id, newValue);
                  }}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selected
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
        )}

        {currentQuestion.type === 'slider' && (
          <div className="space-y-4">
            <input
              type="range"
              min="0"
              max="100"
              value={
                typeof responses[currentQuestion.question_id] === 'string'
                  ? parseInt(responses[currentQuestion.question_id] as string) || 50
                  : 50
              }
              onChange={(e) =>
                handleAnswer(currentQuestion.question_id, e.target.value)
              }
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Not confident</span>
              <span>Very confident</span>
            </div>
            <div className="text-center text-lg font-semibold">
              {typeof responses[currentQuestion.question_id] === 'string'
                ? parseInt(responses[currentQuestion.question_id] as string) || 50
                : 50}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="outline"
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {isLastQuestion ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

