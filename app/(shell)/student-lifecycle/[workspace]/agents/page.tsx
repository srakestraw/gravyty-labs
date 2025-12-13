'use client';

import { useWorkspace } from '../../_components/use-workspace';
import { AgentsListPageClient } from '@/components/shared/ai-platform/AgentsListPageClient';

export default function StudentLifecycleAgentsPage() {
  const { workspaceId, workspaceLabel, peopleLabel } = useWorkspace();

  const context = {
    appId: 'student-lifecycle',
    mode: 'workspace' as const,
    workspaceId,
    peopleLabel,
  };

  return (
    <main className="space-y-6 p-6">
      <AgentsListPageClient context={context} />
    </main>
  );
}

