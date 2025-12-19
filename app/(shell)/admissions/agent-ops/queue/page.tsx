'use client';

import { AgentOpsQueuePageClient } from '@/components/shared/ai-platform/AgentOpsQueuePageClient';

function QueueContent() {
  const context = {
    appId: 'admissions',
    mode: 'workspace' as const,
    workspaceId: 'admissions',
  };

  return <AgentOpsQueuePageClient context={context} />;
}

export default function AdmissionsQueuePage() {
  return <QueueContent />;
}




