'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { dataClient } from '@/lib/data';
import { ContactGate } from '@/components/program-match/ContactGate';
import { Quiz } from '@/components/program-match/Quiz';
import { MatchResults } from '@/components/program-match/MatchResults';
import { ReadinessAssessment } from '@/components/program-match/ReadinessAssessment';
import { ReadinessResults } from '@/components/program-match/ReadinessResults';
import type {
  ProgramMatchConfig,
  ProgramMatchProgress,
  ProgramMatchOutcome,
  ProgramMatchReadiness,
} from '@/lib/program-match/types';
import { trackGateViewed, trackResultsViewed, trackResumeLinkOpened } from '@/lib/program-match/events';
import { MOCK_READINESS_QUESTIONS } from '@/lib/program-match/mock-data';

export default function ProgramMatchEmbedPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<ProgramMatchConfig | null>(null);
  const [progress, setProgress] = useState<ProgramMatchProgress | null>(null);
  const [outcome, setOutcome] = useState<ProgramMatchOutcome | null>(null);
  const [readiness, setReadiness] = useState<ProgramMatchReadiness | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [step, setStep] = useState<'loading' | 'gate' | 'quiz' | 'results' | 'readiness' | 'readiness_results'>('loading');

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const institutionId = searchParams.get('institutionId') || 'inst_123';
        const quizId = searchParams.get('quizId') || 'quiz_grad_match_v1';
        const quizVersion = searchParams.get('quizVersion') || 'v1';

        const loadedConfig = await dataClient.getProgramMatchConfig(
          { workspace: institutionId, app: 'admissions' },
          quizId,
          quizVersion
        );

        if (!loadedConfig) {
          setError('Configuration not found');
          setLoading(false);
          return;
        }

        setConfig(loadedConfig);

        // Check for resume token
        const token = searchParams.get('token');
        const leadIdParam = searchParams.get('leadId');

        if (token && leadIdParam) {
          // Resume flow
          trackResumeLinkOpened({
            lead_id: leadIdParam,
            token,
          });

          const resumeData = await dataClient.getProgramMatchResume(
            { workspace: institutionId, app: 'admissions' },
            leadIdParam,
            token
          );

          if (resumeData) {
            setProgress(resumeData.progress);
            setOutcome(resumeData.outcome);
            setLeadId(leadIdParam);

            if (resumeData.outcome) {
              setStep('results');
              trackResultsViewed({
                lead_id: leadIdParam,
                quiz_id: quizId,
                version_id: quizVersion,
              });
            } else if (resumeData.progress) {
              if (resumeData.progress.current_step === 'readiness') {
                const programId = (resumeData.progress as any).program_id;
                if (programId) setSelectedProgramId(programId);
                setStep('readiness');
              } else if (resumeData.progress.current_step === 'quiz') {
                setStep('quiz');
              } else {
                setStep('gate');
              }
            } else {
              setStep('gate');
            }
          } else {
            setError('Invalid or expired resume link');
          }
        } else {
          // New flow - start at gate
          setStep('gate');
          trackGateViewed({ quiz_id: quizId, version_id: quizVersion });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [searchParams]);

  const handleGateSubmit = async (data: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    intended_start_term?: string;
    modality_preference?: string;
    email_consent?: boolean;
    sms_consent?: boolean;
  }) => {
    if (!config) return;

    try {
      const lead = await dataClient.createProgramMatchLead(
        { workspace: 'admissions', app: 'admissions' },
        {
          quiz_id: config.quiz_id,
          version_id: config.version_id || 'v1',
          ...data,
        }
      );

      setLeadId(lead.lead_id);
      setStep('quiz');
    } catch (err) {
      throw err;
    }
  };

  const handleQuizComplete = async (responses: Record<string, string | string[]>) => {
    if (!leadId || !config) return;

    try {
      const outcomeResult = await dataClient.scoreProgramMatch(
        { workspace: 'admissions', app: 'admissions' },
        leadId,
        responses
      );
      setOutcome(outcomeResult);
      setStep('results');
      trackResultsViewed({
        lead_id: leadId,
        quiz_id: config.quiz_id,
        version_id: config.version_id,
      });
    } catch (err) {
      console.error('Failed to score quiz:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return null;
  }

  // Get quiz questions (in production, this would come from config/API)
  const { MOCK_QUIZ } = require('@/lib/program-match/mock-data');
  const questions = MOCK_QUIZ.questions;

  if (step === 'gate') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <ContactGate
          config={config.lead_capture_config}
          quizId={config.quiz_id}
          versionId={config.version_id}
          onSubmit={handleGateSubmit}
        />
      </div>
    );
  }

  if (step === 'quiz' && leadId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Quiz
          questions={questions}
          initialProgress={progress || undefined}
          leadId={leadId}
          quizId={config.quiz_id}
          versionId={config.version_id}
          onAnswer={async () => {}}
          onSaveProgress={async (progressData) => {
            await dataClient.saveProgramMatchProgress(
              { workspace: 'admissions', app: 'admissions' },
              leadId,
              progressData
            );
            setProgress({
              lead_id: leadId,
              ...progressData,
              updated_at: new Date().toISOString(),
            });
          }}
          onComplete={handleQuizComplete}
        />
      </div>
    );
  }

  if (step === 'results' && outcome) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <MatchResults
          outcome={outcome}
          programs={config.programs}
          onCheckReadiness={async (programId) => {
            if (!leadId) return;
            await dataClient.startReadinessAssessment(
              { workspace: 'admissions', app: 'admissions' },
              leadId,
              programId
            );
            setSelectedProgramId(programId);
            setStep('readiness');
          }}
          onPrimaryCTA={(programId) => {
            // TODO: Navigate to program page
            console.log('Primary CTA for program:', programId);
          }}
          onFeedback={(helpful) => {
            // Feedback tracked in component
          }}
          primaryCTALabel="Learn More"
          showReadinessOption={true}
        />
      </div>
    );
  }

  if (step === 'readiness' && selectedProgramId && config && leadId) {
    const program = config.programs.find((p) => p.program_id === selectedProgramId);
    const questions = MOCK_READINESS_QUESTIONS[selectedProgramId] || [];

    if (questions.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div className="text-center text-gray-600">
            Readiness assessment not available for this program.
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <ReadinessAssessment
          questions={questions}
          programName={program?.name || 'this program'}
          initialProgress={progress || undefined}
          leadId={leadId}
          programId={selectedProgramId}
          quizId={config.quiz_id}
          versionId={config.version_id}
          onAnswer={async () => {}}
          onSaveProgress={async (progressData) => {
            await dataClient.saveProgramMatchProgress(
              { workspace: 'admissions', app: 'admissions' },
              leadId,
              progressData
            );
            setProgress({
              lead_id: leadId,
              ...progressData,
              updated_at: new Date().toISOString(),
            });
          }}
          onComplete={async (responses) => {
            if (!leadId || !selectedProgramId) return;
            const readinessResult = await dataClient.completeReadinessAssessment(
              { workspace: 'admissions', app: 'admissions' },
              leadId,
              selectedProgramId,
              responses
            );
            setReadiness(readinessResult);
            setStep('readiness_results');
          }}
        />
      </div>
    );
  }

  if (step === 'readiness_results' && readiness && config) {
    const program = config.programs.find((p) => p.program_id === readiness.program_id);

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <ReadinessResults
          readiness={readiness}
          programName={program?.name || 'this program'}
          onPrimaryCTA={() => {
            // TODO: Navigate to next action
          }}
          primaryCTALabel={readiness.prep_guidance?.[0]?.next_action_cta || 'Get Started'}
        />
      </div>
    );
  }

  return null;
}

