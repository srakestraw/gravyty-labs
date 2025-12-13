'use client';

import { useWorkspace } from '../../../_components/use-workspace';
import { AgentOpsPeoplePageClient } from '@/components/shared/ai-platform/AgentOpsPeoplePageClient';
import { getWorkspaceDefaults } from '../../../lib/workspaces';

export default function StudentLifecyclePeoplePage() {
  const { workspaceId, workspaceLabel, peopleLabel } = useWorkspace();
  const defaults = getWorkspaceDefaults(workspaceId);

  const context = {
    appId: 'student-lifecycle',
    mode: 'workspace' as const,
    workspaceId,
    peopleLabel,
    defaults: {
      peopleFilters: defaults.defaultPeopleFilters,
      recommendedAgents: defaults.recommendedAgents,
    },
  };

  return (
    <main className="space-y-6 p-6">
      <AgentOpsPeoplePageClient context={context} />
    </main>
  );
}



