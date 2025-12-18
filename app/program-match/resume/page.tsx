'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { trackResultsViewed, trackCTAClicked, trackRecommendationFeedback, trackResumeLinkOpened } from '@/lib/program-match/events';
import { MOCK_READINESS_QUESTIONS } from '@/lib/program-match/mock-data';

export default function ProgramMatchResumePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
    const token = searchParams.get('token');
    const leadIdParam = searchParams.get('leadId');

    if (!token || !leadIdParam) {
      setError('Invalid resume link. Please request a new link.');
      setLoading(false);
      return;
    }

    const loadResume = async () => {
      try {
        // Track resume link opened
        trackResumeLinkOpened({
          lead_id: leadIdParam,
          token,
        });

        const resumeData = await dataClient.getProgramMatchResume(
          { workspace: 'admissions', app: 'admissions' },
          leadIdParam,
          token
        );

        if (!resumeData) {
          setError('This resume link has expired or is invalid. Please request a new link.');
          setLoading(false);
          return;
        }

        setConfig(resumeData.config);
        setProgress(resumeData.progress);
        setOutcome(resumeData.outcome);
        setLeadId(leadIdParam);

        // Determine current step
        if (resumeData.outcome) {
          setStep('results');
          // Track results viewed on resume
          trackResultsViewed({
            lead_id: leadIdParam,
            quiz_id: resumeData.config.quiz_id,
            version_id: resumeData.config.version_id,
          });
        } else if (resumeData.progress) {
          if (resumeData.progress.current_step === 'readiness') {
            // Extract program ID from progress metadata if available
            const programId = (resumeData.progress as any).program_id;
            if (programId) {
              setSelectedProgramId(programId);
            }
            setStep('readiness');
          } else if (resumeData.progress.current_step === 'quiz') {
            setStep('quiz');
          } else {
            setStep('gate');
          }
        } else {
          setStep('gate');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load resume data');
      } finally {
        setLoading(false);
      }
    };

    loadResume();
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
      const outcome = await dataClient.scoreProgramMatch(
        { workspace: 'admissions', app: 'admissions' },
        leadId,
        responses
      );
      setOutcome(outcome);
      setStep('results');
      
      // Track results viewed
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading your progress...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Resume</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/program-match')}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Start New Match
          </button>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">Configuration not found</div>
      </div>
    );
  }

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

  if (step === 'quiz' && config) {
    // Load quiz questions from config
    // In a real implementation, this would come from the quiz data
    // For now, we'll need to fetch the quiz separately or include questions in config
    const questions = config.quiz_id ? [] : []; // TODO: Load from quiz data

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        {questions.length > 0 ? (
          <Quiz
            questions={questions}
            initialProgress={progress || undefined}
            leadId={leadId || undefined}
            quizId={config.quiz_id}
            versionId={config.version_id}
            onAnswer={async () => {}}
            onSaveProgress={async (progressData) => {
              if (!leadId) return;
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
        ) : (
          <div className="text-center text-gray-600">
            Loading quiz questions...
          </div>
        )}
      </div>
    );
  }

  if (step === 'results' && outcome && config) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <MatchResults
          outcome={outcome}
          programs={config.programs}
          onCheckReadiness={async (programId) => {
            if (!leadId) return;
            
            // Start readiness assessment
            await dataClient.startReadinessAssessment(
              { workspace: 'admissions', app: 'admissions' },
              leadId,
              programId
            );
            
            setSelectedProgramId(programId);
            setStep('readiness');
          }}
          onPrimaryCTA={(programId) => {
            if (leadId) {
              trackCTAClicked({
                lead_id: leadId,
                cta_type: 'primary',
                program_id: programId,
                quiz_id: config.quiz_id,
                version_id: config.version_id,
              });
            }
            // TODO: Navigate to program page or application
            console.log('Primary CTA clicked for program:', programId);
          }}
          onFeedback={(helpful) => {
            if (leadId) {
              trackRecommendationFeedback({
                lead_id: leadId,
                helpful,
                quiz_id: config.quiz_id,
                version_id: config.version_id,
              });
            }
          }}
          primaryCTALabel="Learn More"
          showReadinessOption={true}
        />
      </div>
    );
  }

  if (step === 'readiness' && selectedProgramId && config) {
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
          leadId={leadId || undefined}
          programId={selectedProgramId}
          quizId={config.quiz_id}
          versionId={config.version_id}
          onAnswer={async () => {}}
          onSaveProgress={async (progressData) => {
            if (!leadId) return;
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
            
            try {
              const readinessResult = await dataClient.completeReadinessAssessment(
                { workspace: 'admissions', app: 'admissions' },
                leadId,
                selectedProgramId,
                responses
              );
              setReadiness(readinessResult);
              setStep('readiness_results');
            } catch (err) {
              console.error('Failed to complete readiness assessment:', err);
            }
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
            if (leadId) {
              trackCTAClicked({
                lead_id: leadId,
                cta_type: 'readiness_cta',
                program_id: readiness.program_id,
                quiz_id: config.quiz_id,
                version_id: config.version_id,
              });
            }
            // TODO: Navigate to next action
            console.log('Readiness CTA clicked');
          }}
          primaryCTALabel={readiness.prep_guidance?.[0]?.next_action_cta || 'Get Started'}
        />
      </div>
    );
  }

  return null;
}

