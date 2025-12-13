"use client";

import { AgentsPageClient } from "@/components/shared/agents/AgentsPageClient";

export default function Page() {
  const context = {
    appId: 'advancement',
    mode: 'workspace' as const,
    workspaceId: 'advancement',
  };
  
  return <AgentsPageClient context={context} />;
}

