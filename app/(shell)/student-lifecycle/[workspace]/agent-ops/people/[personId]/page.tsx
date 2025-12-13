'use client';

import { useWorkspace } from '../../../../_components/use-workspace';
import { AgentOpsPersonDetailPageClient } from '@/components/shared/ai-platform/AgentOpsPersonDetailPageClient';
import { getPersonById } from '@/lib/agent-ops/people-mock';

export default function StudentLifecyclePersonDetailPage({ params }: { params: { personId: string } }) {
  const { workspaceId, workspaceLabel, peopleLabel } = useWorkspace();

  const context = {
    appId: 'student-lifecycle',
    mode: 'workspace' as const,
    workspaceId,
    peopleLabel,
  };

  const person = getPersonById(params.personId) ?? null;

  return (
    <main className="space-y-6 p-6">
      <AgentOpsPersonDetailPageClient person={person} context={context} />
    </main>
  );
}



