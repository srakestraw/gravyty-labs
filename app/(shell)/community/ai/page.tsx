'use client';

import { CommandCenterPageClient } from '@/components/shared/ai-platform/CommandCenterPageClient';

function CommunityAIContent() {
  const context = {
    appId: 'alumni-engagement',
    workspaceId: 'alumni-engagement',
    mode: 'workspace' as const,
  };

  return <CommandCenterPageClient context={context} />;
}

export default function CommunityCommandCenterPage() {
  return (
    <main className="space-y-6 p-6">
      <CommunityAIContent />
    </main>
  );
}

