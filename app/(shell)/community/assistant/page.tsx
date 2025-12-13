'use client';

import { AssistantPageClient } from '@/components/shared/ai-platform/AssistantPageClient';

export default function CommunityAssistantPage() {
  const context = {
    appId: 'alumni-engagement',
    workspaceId: 'alumni-engagement',
    mode: 'workspace' as const,
  };

  return (
    <main className="space-y-6 p-6">
      <AssistantPageClient context={context} />
    </main>
  );
}

