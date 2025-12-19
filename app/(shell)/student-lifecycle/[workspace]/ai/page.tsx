import { Suspense } from 'react';
import { getWorkspaceDefaults, WORKSPACES } from '@/lib/student-lifecycle/workspaces';
import { AIPageClientWrapper } from './AIPageClientWrapper';

export const dynamic = 'force-static';

// Required for static export with dynamic routes
export async function generateStaticParams() {
  return WORKSPACES.map((w) => ({
    workspace: w.id,
  }));
}

interface PageProps {
  params: { workspace: string };
}

export default function StudentLifecycleCommandCenterPage({ params }: PageProps) {
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
      <Suspense fallback={<div>Loading...</div>}>
        <AIPageClientWrapper context={context} />
      </Suspense>
    </main>
  );
}



