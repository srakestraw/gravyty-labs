'use client';

import { useWorkspace } from '../../../_components/use-workspace';
import { AgentOpsQueuePageClient } from '@/components/shared/ai-platform/AgentOpsQueuePageClient';
import { getWorkspaceDefaults } from '../../../lib/workspaces';
import { useSearchParams } from 'next/navigation';
import { getSegmentIdFromSearchParams } from '@/components/shared/ai-platform/segments/segment-context';
import { getSegmentById } from '@/components/shared/ai-platform/segments/mock-data';

export default function StudentLifecycleQueuePage() {
  const { workspaceId, workspaceLabel, peopleLabel } = useWorkspace();
  const defaults = getWorkspaceDefaults(workspaceId);
  const searchParams = useSearchParams();
  
  // Get segment from URL
  const segmentId = getSegmentIdFromSearchParams(Object.fromEntries(searchParams.entries()));
  const activeSegment = segmentId ? getSegmentById(segmentId) : undefined;

  const context = {
    appId: 'student-lifecycle',
    mode: 'workspace' as const,
    workspaceId,
    peopleLabel,
    activeSegmentId: segmentId,
    activeSegment,
    defaults: {
      queueView: defaults.defaultQueueView,
      recommendedAgents: defaults.recommendedAgents,
      recommendedSegments: defaults.recommendedSegments,
      segmentTemplates: defaults.segmentTemplates,
      defaultSegmentId: defaults.defaultSegmentId,
    },
  };

  return (
    <main className="space-y-6 p-6">
      <AgentOpsQueuePageClient context={context} />
    </main>
  );
}



