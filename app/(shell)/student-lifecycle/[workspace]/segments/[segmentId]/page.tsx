import { SegmentDetailPageClient } from '@/components/shared/ai-platform/segments/SegmentDetailPageClient';
import { getWorkspaceDefaults, WORKSPACES } from '../../../lib/workspaces';
import { MOCK_SEGMENTS } from '@/components/shared/ai-platform/segments/mock-data';

export const dynamic = 'force-static';

// Required for static export with dynamic routes
// Return placeholder to satisfy static export requirement
// Actual routes will be handled client-side
export async function generateStaticParams() {
  const workspaces = WORKSPACES.map((w) => w.id);
  const segmentIds = MOCK_SEGMENTS.map((s) => s.id);
  
  // Generate all combinations of workspace and segmentId
  const params: { workspace: string; segmentId: string }[] = [];
  for (const workspace of workspaces) {
    for (const segmentId of segmentIds) {
      params.push({ workspace, segmentId });
    }
  }
  
  return params;
}

interface PageProps {
  params: { workspace: string; segmentId: string };
}

export default function StudentLifecycleSegmentDetailPage({ params }: PageProps) {
  const defaults = getWorkspaceDefaults(params.workspace);
  const workspaceConfig = WORKSPACES.find((w) => w.id === params.workspace);

  const context = {
    appId: 'student-lifecycle',
    mode: 'workspace' as const,
    workspaceId: params.workspace,
    peopleLabel: workspaceConfig?.peopleLabel || 'People',
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

