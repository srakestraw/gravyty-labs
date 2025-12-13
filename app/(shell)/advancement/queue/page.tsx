'use client';

import { Suspense } from 'react';
import { AgentOpsQueuePageClient } from '@/components/shared/ai-platform/AgentOpsQueuePageClient';

function QueueContent() {
  const context = {
    appId: 'advancement',
    mode: 'workspace' as const,
    workspaceId: 'advancement',
  };

  return <AgentOpsQueuePageClient context={context} />;
}

export default function QueuePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QueueContent />
    </Suspense>
  );
}

