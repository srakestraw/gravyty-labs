'use client';

import { Suspense } from 'react';
import { CommandCenterPageClient } from '@/components/shared/ai-platform/CommandCenterPageClient';

function AdvancementContent() {
  const context = {
    appId: 'advancement',
    workspaceId: 'advancement',
    mode: 'workspace' as const,
  };

  return <CommandCenterPageClient context={context} />;
}

export default function AdvancementPage() {
  return (
    <main className="space-y-6 p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <AdvancementContent />
      </Suspense>
    </main>
  );
}



