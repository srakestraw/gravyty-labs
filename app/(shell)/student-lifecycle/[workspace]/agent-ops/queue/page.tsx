import { AgentOpsQueuePageClient } from '@/components/shared/ai-platform/AgentOpsQueuePageClient';
import { getWorkspaceDefaults, WORKSPACES } from '../../../lib/workspaces';
import { QueuePageClientWrapper } from './QueuePageClientWrapper';

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

export default function StudentLifecycleQueuePage({ params }: PageProps) {
  const defaults = getWorkspaceDefaults(params.workspace);
  const workspaceConfig = WORKSPACES.find((w) => w.id === params.workspace);
  
  const context = {
    appId: 'student-lifecycle',
    mode: 'workspace' as const,
    workspaceId: params.workspace,
    peopleLabel: workspaceConfig?.peopleLabel || 'People',
    defaults: {
      queueView: defaults.defaultQueueView,
      recommendedAgents: defaults.recommendedAgents,
      recommendedSegments: defaults.recommendedSegments,
      segmentTemplates: defaults.segmentTemplates,
      defaultSegmentId: defaults.defaultSegmentId,
    },
  };

  return (
    <main className="space-y-6 p-6">
      <QueuePageClientWrapper context={context} />
    </main>
  );
}



