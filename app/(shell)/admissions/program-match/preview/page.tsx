'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContactGate } from '@/components/program-match/ContactGate';
import { Quiz } from '@/components/program-match/Quiz';
import { MatchResults } from '@/components/program-match/MatchResults';
import { dataClient } from '@/lib/data';
import { getMockProgramMatchConfig } from '@/lib/program-match/mock-data';
import { MOCK_QUIZ } from '@/lib/program-match/mock-data';
import type { ProgramMatchOutcome } from '@/lib/program-match/types';

export default function ProgramMatchPreviewPage() {
  const [previewMode, setPreviewMode] = useState<'gate' | 'quiz' | 'results' | 'readiness'>('gate');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [version, setVersion] = useState<'draft' | 'published'>('published');
  const [mockOutcome, setMockOutcome] = useState<ProgramMatchOutcome | null>(null);

  const config = getMockProgramMatchConfig('inst_123', 'quiz_grad_match_v1', 'v1');

  const handleGateSubmit = async () => {
    setPreviewMode('quiz');
  };

  const handleQuizComplete = async () => {
    // Generate mock outcome for preview
    const outcome: ProgramMatchOutcome = {
      lead_id: 'preview_lead',
      ranked_programs: [
        {
          program_id: 'mba',
          confidence_band: 'strong',
          reasons: [
            'Your leadership orientation aligns well with our MBA program',
            'Your collaborative work style matches our program culture',
            'Your applied focus fits our practical curriculum',
          ],
        },
        {
          program_id: 'ms_data_science',
          confidence_band: 'good',
          reasons: [
            'Your quantitative skills are a good fit',
            'Your research orientation aligns with our program',
          ],
        },
      ],
      global_confidence: 'high',
      generated_by: 'baseline',
      created_at: new Date().toISOString(),
    };
    setMockOutcome(outcome);
    setPreviewMode('results');
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Preview Program Match
            </h1>
            <p className="text-gray-600">
              Preview the candidate experience before deploying
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex gap-2 border rounded-lg p-1">
              <Button
                variant={deviceView === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDeviceView('desktop')}
              >
                <FontAwesomeIcon icon="fa-solid fa-desktop" className="h-4 w-4" />
              </Button>
              <Button
                variant={deviceView === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDeviceView('mobile')}
              >
                <FontAwesomeIcon icon="fa-solid fa-mobile-screen" className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 border rounded-lg p-1">
              <Button
                variant={version === 'draft' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVersion('draft')}
              >
                Draft
              </Button>
              <Button
                variant={version === 'published' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVersion('published')}
              >
                Published
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <FontAwesomeIcon icon="fa-solid fa-share" className="h-4 w-4 mr-2" />
              Share Preview
            </Button>
          </div>
        </div>

        {/* Preview Tabs */}
        <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as any)}>
          <TabsList>
            <TabsTrigger value="gate">Gate</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="readiness">Readiness</TabsTrigger>
          </TabsList>

          <div className="mt-6 border rounded-lg bg-gray-50 p-6">
            <div className={`mx-auto ${deviceView === 'mobile' ? 'max-w-sm' : 'max-w-4xl'}`}>
              <TabsContent value="gate" className="mt-0">
                <ContactGate
                  config={config.lead_capture_config}
                  quizId={config.quiz_id}
                  versionId={config.version_id}
                  onSubmit={handleGateSubmit}
                />
              </TabsContent>

              <TabsContent value="quiz" className="mt-0">
                <Quiz
                  questions={MOCK_QUIZ.questions}
                  leadId="preview_lead"
                  quizId={config.quiz_id}
                  versionId={config.version_id}
                  onAnswer={async () => {}}
                  onSaveProgress={async () => {}}
                  onComplete={handleQuizComplete}
                />
              </TabsContent>

              <TabsContent value="results" className="mt-0">
                {mockOutcome ? (
                  <MatchResults
                    outcome={mockOutcome}
                    programs={config.programs}
                    onCheckReadiness={() => setPreviewMode('readiness')}
                    onPrimaryCTA={() => {}}
                    onFeedback={() => {}}
                  />
                ) : (
                  <div className="text-center text-gray-500 p-12">
                    Complete the quiz to see results preview
                  </div>
                )}
              </TabsContent>

              <TabsContent value="readiness" className="mt-0">
                <div className="text-center text-gray-500 p-12">
                  Readiness assessment preview (coming soon)
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>

        {/* Safe Mode Notice */}
        <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon="fa-solid fa-shield" className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Safe Mode Active</h3>
              <p className="text-sm text-blue-800">
                Preview mode is active. No real emails will be sent and no leads will be created.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
