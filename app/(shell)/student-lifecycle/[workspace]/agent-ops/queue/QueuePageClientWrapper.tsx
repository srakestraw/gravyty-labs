'use client';

import { AgentOpsQueuePageClient } from '@/components/shared/ai-platform/AgentOpsQueuePageClient';
import { useSearchParams } from 'next/navigation';
import { getSegmentIdFromSearchParams } from '@/components/shared/ai-platform/segments/segment-context';
import { getSegmentById } from '@/components/shared/ai-platform/segments/mock-data';
import type { AiPlatformPageContext } from '@/components/shared/ai-platform/types';

interface QueuePageClientWrapperProps {
  context: AiPlatformPageContext;
}

export function QueuePageClientWrapper({ context }: QueuePageClientWrapperProps) {
  const searchParams = useSearchParams();
  
  // Get segment from URL
  const segmentId = getSegmentIdFromSearchParams(Object.fromEntries(searchParams.entries()));
  const activeSegment = segmentId ? getSegmentById(segmentId) : undefined;

  const enhancedContext = {
    ...context,
    activeSegmentId: segmentId,
    activeSegment,
  };

  return <AgentOpsQueuePageClient context={enhancedContext} />;
}





