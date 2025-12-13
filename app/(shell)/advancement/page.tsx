'use client';

import { CommandCenterPageClient } from '@/components/shared/ai-platform/CommandCenterPageClient';

export default function AdvancementPage() {
  const context = {
    appId: 'advancement',
    workspaceId: 'advancement',
    mode: 'workspace' as const,
  };

  return (
    <main className="space-y-6 p-6">
      <CommandCenterPageClient context={context} />
    </main>
  );
}



