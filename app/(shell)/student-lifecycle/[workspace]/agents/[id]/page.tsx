import { AgentDetailPageClient } from '@/components/shared/ai-platform/AgentDetailPageClient';
import { getWorkspaceConfig, WORKSPACES } from '@/lib/student-lifecycle/workspaces';

export const dynamic = 'force-static';

// Required for static export with dynamic routes
export async function generateStaticParams() {
  const workspaces = WORKSPACES.map((w) => w.id);
  const agentIds = [
    'agent-transcript-helper',
    'agent-registration-requirements',
    'agent-high-intent-prospect',
    'agent-donor-warmup',
    'agent-international-visa',
    'agent-flow-missing-transcript',
    'agent-flow-registration-hold',
  ];
  
  // Generate all combinations of workspace and agent id
  const params: { workspace: string; id: string }[] = [];
  for (const workspace of workspaces) {
    for (const id of agentIds) {
      params.push({ workspace, id });
    }
  }
  
  return params;
}

interface PageProps {
  params: { workspace: string; id: string };
}

export default function StudentLifecycleAgentDetailPage({ params }: PageProps) {
  const workspaceConfig = getWorkspaceConfig(params.workspace);

  const context = {
    appId: 'student-lifecycle',
    mode: 'workspace' as const,
    workspaceId: params.workspace,
    peopleLabel: workspaceConfig.peopleLabel,
  };

  return (
    <main className="space-y-6 p-6">
      <AgentDetailPageClient agentId={params.id} context={context} />
    </main>
  );
}

