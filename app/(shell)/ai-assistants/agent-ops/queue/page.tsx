'use client';

import { Suspense } from 'react';
import { AgentOpsQueuePageClient } from '@/components/shared/ai-platform/AgentOpsQueuePageClient';

export default function QueuePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AgentOpsQueuePageClient />
    </Suspense>
  );
}

