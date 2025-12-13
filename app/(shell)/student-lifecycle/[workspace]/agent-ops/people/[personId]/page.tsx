import { AgentOpsPersonDetailPageClient } from '@/components/shared/ai-platform/AgentOpsPersonDetailPageClient';
import { getPersonById, MOCK_PEOPLE } from '@/lib/agent-ops/people-mock';
import { getWorkspaceConfig, WORKSPACES } from '../../../../lib/workspaces';

export const dynamic = 'force-static';

// Required for static export with dynamic routes
// Return placeholder to satisfy static export requirement
// Actual routes will be handled client-side
export async function generateStaticParams() {
  const workspaces = WORKSPACES.map((w) => w.id);
  const personIds = MOCK_PEOPLE.map((p) => p.id);
  
  // Generate all combinations of workspace and personId
  const params: { workspace: string; personId: string }[] = [];
  for (const workspace of workspaces) {
    for (const personId of personIds) {
      params.push({ workspace, personId });
    }
  }
  
  return params;
}

interface PageProps {
  params: { workspace: string; personId: string };
}

export default function StudentLifecyclePersonDetailPage({ params }: PageProps) {
  const workspaceConfig = getWorkspaceConfig(params.workspace);
  
  const context = {
    appId: 'student-lifecycle',
    mode: 'workspace' as const,
    workspaceId: params.workspace,
    peopleLabel: workspaceConfig.peopleLabel,
  };

  const person = getPersonById(params.personId) ?? null;

  return (
    <main className="space-y-6 p-6">
      <AgentOpsPersonDetailPageClient person={person} context={context} />
    </main>
  );
}



