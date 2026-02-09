import { getWorkspaceConfig, WORKSPACES } from '@/lib/student-lifecycle/workspaces';
import { NarrativeMessagingClient } from '@/components/shared/narrative-messaging/NarrativeMessagingClient';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return WORKSPACES.map((w) => ({ workspace: w.id }));
}

function subWorkspaceFromSlug(slug: string): string {
  return slug.replace(/-/g, '_');
}

export default function StudentLifecycleNarrativeMessagingPage({
  params,
}: {
  params: { workspace: string };
}) {
  const config = getWorkspaceConfig(params.workspace);
  const subWorkspace = subWorkspaceFromSlug(params.workspace);

  const scope = {
    workspaceLabel: 'Student Lifecycle AI',
    subWorkspaceLabel: config.label,
    defaultVoice: config.label === 'Bursar' ? 'Bursar' : config.label === 'Financial Aid' ? 'Financial Aid Counselor' : 'Advisor',
  };

  const narrativeContext = {
    workspace: 'student_lifecycle_ai' as const,
    sub_workspace: subWorkspace,
  };

  return (
    <main className="space-y-6 p-6">
      <NarrativeMessagingClient scope={scope} narrativeContext={narrativeContext} />
    </main>
  );
}
