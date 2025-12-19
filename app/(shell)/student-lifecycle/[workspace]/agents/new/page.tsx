import { AgentNewPageClient } from '@/components/shared/ai-platform/AgentNewPageClient';
import { getWorkspaceConfig, WORKSPACES } from '@/lib/student-lifecycle/workspaces';

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

export default function StudentLifecycleAgentNewPage({ params }: PageProps) {
  const workspaceConfig = getWorkspaceConfig(params.workspace);

  const context = {
    appId: 'student-lifecycle',
    mode: 'workspace' as const,
    workspaceId: params.workspace,
    peopleLabel: workspaceConfig.peopleLabel,
  };

  return (
    <main className="space-y-6 p-6">
      <AgentNewPageClient context={context} />
    </main>
  );
}

