'use client';

import { CommandCenterPageClient } from '@/components/shared/ai-platform/CommandCenterPageClient';
import { useSearchParams } from 'next/navigation';
import { getSegmentIdFromSearchParams } from '@/components/shared/ai-platform/segments/segment-context';
import { getSegmentById } from '@/components/shared/ai-platform/segments/mock-data';
import type { AiPlatformPageContext } from '@/components/shared/ai-platform/types';

export default function PipelinePage() {
  const searchParams = useSearchParams();
  
  // Get segment from URL
  const segmentId = getSegmentIdFromSearchParams(Object.fromEntries(searchParams.entries()));
  const activeSegment = segmentId ? getSegmentById(segmentId) : undefined;

  const context: AiPlatformPageContext = {
    appId: 'advancement',
    workspaceId: 'advancement',
    mode: 'workspace' as const,
    activeSegmentId: segmentId,
    activeSegment,
    defaults: {
      recommendedAgents: ['agent-high-intent-signal', 'agent-proposal-builder'],
    },
  };

  return (
    <main className="space-y-6 p-6">
      <CommandCenterPageClient context={context} />
    </main>
  );
}

