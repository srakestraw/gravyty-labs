'use client';

import { Suspense } from 'react';
import { AssistantPageClient } from '@/components/shared/ai-platform/AssistantPageClient';

function AssistantContent() {
  const context = {
    mode: 'global' as const,
  };

  return <AssistantPageClient context={context} />;
}

export default function AiAssistantPage() {
  return (
    <main className="space-y-6 p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <AssistantContent />
      </Suspense>
    </main>
  );
}
