'use client';

import { CommandCenterPageClient } from '@/components/shared/ai-platform/CommandCenterPageClient';

function AdvancementAIContent() {
  const context = {
    appId: 'advancement',
    workspaceId: 'advancement',
    mode: 'workspace' as const,
  };

  return <CommandCenterPageClient context={context} />;
}

export default function AdvancementCommandCenterPage() {
  return (
    <main className="space-y-6 p-6">
      <AdvancementAIContent />
    </main>
  );
}

