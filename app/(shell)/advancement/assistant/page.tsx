'use client';

import { AssistantPageClient } from '@/components/shared/ai-platform/AssistantPageClient';

function AssistantContent() {
  const context = {
    appId: 'advancement',
    workspaceId: 'advancement',
    mode: 'workspace' as const,
  };

  return (
    <main className="space-y-6 p-6">
      <AssistantPageClient context={context} />
    </main>
  );
}

export default function AdvancementAssistantPage() {
  return <AssistantContent />;
}

