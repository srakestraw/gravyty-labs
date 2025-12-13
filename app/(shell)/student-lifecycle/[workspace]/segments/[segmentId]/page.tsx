'use client';

import { useWorkspace } from '../../../_components/use-workspace';
import { SegmentDetailPageClient } from '@/components/shared/ai-platform/segments/SegmentDetailPageClient';
import { getWorkspaceDefaults } from '../../../lib/workspaces';

export default function StudentLifecycleSegmentDetailPage({
  params,
}: {
  params: { workspace: string; segmentId: string };
}) {
  const { workspaceId, workspaceLabel, peopleLabel } = useWorkspace();
  const defaults = getWorkspaceDefaults(workspaceId);

  const context = {
    appId: 'student-lifecycle',
    mode: 'workspace' as const,
    workspaceId,
    peopleLabel,
    defaults: {
      recommendedAgents: defaults.recommendedAgents,
      recommendedSegments: defaults.recommendedSegments,
      segmentTemplates: defaults.segmentTemplates,
      defaultSegmentId: defaults.defaultSegmentId,
    },
  };

  return (
    <main className="space-y-6 p-6">
      <SegmentDetailPageClient segmentId={params.segmentId} context={context} />
    </main>
  );
}

