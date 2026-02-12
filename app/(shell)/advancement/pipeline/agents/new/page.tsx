"use client";

import { Suspense } from "react";
import { AgentNewPageClient } from "@/components/shared/ai-platform/AgentNewPageClient";

export default function Page() {
  const context = {
    appId: 'advancement',
    mode: 'workspace' as const,
    workspaceId: 'pipeline',
  };

  return (
    <main className="space-y-6 p-6">
      <Suspense fallback={<div className="animate-pulse h-64 bg-muted/50 rounded-lg" />}>
        <AgentNewPageClient context={context} />
      </Suspense>
    </main>
  );
}
