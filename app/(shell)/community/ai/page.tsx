'use client';

import { Suspense } from 'react';
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
      <Suspense fallback={<div>Loading...</div>}>
        <CommunityAIContent />
      </Suspense>
    </main>
  );
}

