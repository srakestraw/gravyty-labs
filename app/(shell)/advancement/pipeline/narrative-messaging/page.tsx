import { NarrativeMessagingClient } from '@/components/shared/narrative-messaging/NarrativeMessagingClient';

export default function AdvancementPipelineNarrativeMessagingPage() {
  const scope = {
    workspaceLabel: 'Advancement & Giving Intelligence',
    subWorkspaceLabel: 'Pipeline Intelligence',
    defaultVoice: 'Gift Officer',
  };

  const narrativeContext = {
    workspace: 'advancement_giving_intelligence' as const,
    sub_workspace: 'pipeline_intelligence',
  };

  return (
    <main className="space-y-6 p-6">
      <NarrativeMessagingClient scope={scope} narrativeContext={narrativeContext} />
    </main>
  );
}
