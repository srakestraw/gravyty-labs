'use client';

import { AgentOpsQueuePageClient } from '@/components/shared/ai-platform/AgentOpsQueuePageClient';

export default function QueuePage() {
  const context = {
    appId: 'advancement',
    mode: 'workspace' as const,
    workspaceId: 'advancement',
  };

  return <AgentOpsQueuePageClient context={context} />;
}

