'use client';

import { QueuePageClient } from '@/components/shared/queue/QueuePageClient';
import type { AiPlatformPageContext } from '@/components/shared/ai-platform/types';
import { getAiPlatformBasePath } from '@/components/shared/ai-platform/types';

export function AgentOpsQueuePageClient({ context }: { context?: AiPlatformPageContext }) {
  const basePath = getAiPlatformBasePath(context);
  const defaultFilters = context?.mode === 'workspace' ? context?.defaults?.queueView : undefined;
  return (
    <QueuePageClient
      basePath={basePath}
      defaultFilters={defaultFilters}
      activeSegmentId={context?.activeSegmentId}
      activeSegment={context?.activeSegment}
      workspaceId={context?.workspaceId}
    />
  );
}



