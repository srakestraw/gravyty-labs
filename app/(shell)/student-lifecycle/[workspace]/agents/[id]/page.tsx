'use client';

import { useWorkspace } from '../../../_components/use-workspace';
import { AgentDetailPageClient } from '@/components/shared/ai-platform/AgentDetailPageClient';

export default function StudentLifecycleAgentDetailPage({ params }: { params: { id: string } }) {
  const { workspaceId, workspaceLabel, peopleLabel } = useWorkspace();

  const context = {
    appId: 'student-lifecycle',
    mode: 'workspace' as const,
    workspaceId,
    peopleLabel,
  };

  return (
    <main className="space-y-6 p-6">
      <AgentDetailPageClient agentId={params.id} context={context} />
    </main>
  );
}

