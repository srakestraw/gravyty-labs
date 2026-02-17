"use client";

import { AgentDetailPageClient } from "@/components/shared/ai-platform/AgentDetailPageClient";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  const context = {
    appId: 'advancement',
    mode: 'workspace' as const,
    workspaceId: 'pipeline',
  };

  return (
    <main className="space-y-6 p-6">
      <AgentDetailPageClient agentId={params.id} context={context} />
    </main>
  );
}
