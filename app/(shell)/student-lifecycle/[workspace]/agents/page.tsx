import { AgentsListPageClient } from '@/components/shared/ai-platform/AgentsListPageClient';
import { getWorkspaceConfig, WORKSPACES } from '../../lib/workspaces';

export const dynamic = 'force-static';

// Required for static export with dynamic routes
export async function generateStaticParams() {
  return WORKSPACES.map((w) => ({
    workspace: w.id,
  }));
}

interface PageProps {
  params: { workspace: string };
}

export default function StudentLifecycleAgentsPage({ params }: PageProps) {
  const workspaceConfig = getWorkspaceConfig(params.workspace);

  const context = {
    appId: 'student-lifecycle',
    mode: 'workspace' as const,
    workspaceId: params.workspace,
    peopleLabel: workspaceConfig.peopleLabel,
  };

  return (
    <main className="space-y-6 p-6">
      <AgentsListPageClient context={context} />
    </main>
  );
}

