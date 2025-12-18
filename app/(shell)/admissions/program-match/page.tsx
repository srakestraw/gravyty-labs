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
  ] = await Promise.all([
    dataClient.getProgramMatchHubSummary(ctx),
    dataClient.getProgramMatchChecklist(ctx),
    dataClient.getProgramMatchLibrariesSummary(ctx),
    dataClient.getProgramMatchProgramsSummary(ctx),
    dataClient.getProgramMatchCandidatesSummary(ctx),
    dataClient.getProgramMatchAnalyticsSummary(ctx),
    dataClient.getProgramMatchDraftConfig(ctx),
    dataClient.listVoiceToneProfiles(ctx),
  ]);

  return (
    <ProgramMatchHubClient
      hubSummary={hubSummary}
      checklist={checklist}
      librariesSummary={librariesSummary}
      programsSummary={programsSummary}
      candidatesSummary={candidatesSummary}
      analyticsSummary={analyticsSummary}
      draftConfig={draftConfig}
      voiceToneProfiles={voiceToneProfiles}
    />
  );
}
