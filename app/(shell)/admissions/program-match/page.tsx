import { Suspense } from 'react';
import { dataClient } from '@/lib/data';
import { ProgramMatchHubClient } from './ProgramMatchHubClient';

export default async function ProgramMatchPage() {
  const ctx = {
    workspace: 'admissions',
    app: 'student-lifecycle',
  };

  const [
    hubSummary,
    checklist,
    librariesSummary,
    programsSummary,
    candidatesSummary,
    analyticsSummary,
    draftConfig,
    voiceToneProfiles,
    traits,
    skills,
    programs,
    outcomes,
    quizzes,
    publishedSnapshots,
    previewLinks,
  ] = await Promise.all([
    dataClient.getProgramMatchHubSummary(ctx),
    dataClient.getProgramMatchChecklist(ctx),
    dataClient.getProgramMatchLibrariesSummary(ctx),
    dataClient.getProgramMatchProgramsSummary(ctx),
    dataClient.getProgramMatchCandidatesSummary(ctx),
    dataClient.getProgramMatchAnalyticsSummary(ctx),
    dataClient.getProgramMatchDraftConfig(ctx),
    dataClient.listVoiceToneProfiles(ctx),
    dataClient.listProgramMatchTraits(ctx),
    dataClient.listProgramMatchSkills(ctx),
    dataClient.listProgramMatchPrograms(ctx),
    dataClient.listProgramMatchOutcomes(ctx),
    dataClient.listProgramMatchQuizzes(ctx),
    dataClient.listProgramMatchPublishedSnapshots(ctx),
    dataClient.listProgramMatchPreviewLinks(ctx),
  ]);

  // Get the first quiz's draft (temporary until Quiz Library UI is implemented)
  const firstQuiz = quizzes.length > 0 ? quizzes[0] : null;
  const quizDraft = firstQuiz
    ? await dataClient.getProgramMatchQuizDraftByQuizId(ctx, firstQuiz.id)
    : null;

  return (
    <Suspense fallback={<div className="p-6 animate-pulse">Loading Program Match...</div>}>
    <ProgramMatchHubClient
      hubSummary={hubSummary}
      checklist={checklist}
      librariesSummary={librariesSummary}
      programsSummary={programsSummary}
      candidatesSummary={candidatesSummary}
      analyticsSummary={analyticsSummary}
      draftConfig={draftConfig}
      voiceToneProfiles={voiceToneProfiles}
      traits={traits}
      skills={skills}
      programs={programs}
      outcomes={outcomes}
      quizDraft={quizDraft}
      quizzes={quizzes}
      publishedSnapshots={publishedSnapshots}
      previewLinks={previewLinks}
    />
    </Suspense>
  );
}
