'use client';

import { useWorkspace } from '../../../_components/use-workspace';
import { AgentNewPageClient } from '@/components/shared/ai-platform/AgentNewPageClient';

export default function StudentLifecycleAgentNewPage() {
  const { workspaceId, workspaceLabel, peopleLabel } = useWorkspace();

  const context = {
    appId: 'student-lifecycle',
    mode: 'workspace' as const,
    workspaceId,
    peopleLabel,
  };

  return (
    <main className="space-y-6 p-6">
      <AgentNewPageClient context={context} />
    </main>
  );
}

