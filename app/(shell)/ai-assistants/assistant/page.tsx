'use client';

import { AssistantPageClient } from '@/components/shared/ai-platform/AssistantPageClient';

export default function AiAssistantPage() {
  const context = {
    mode: 'global' as const,
  };

  return (
    <main className="space-y-6 p-6">
      <AssistantPageClient context={context} />
    </main>
  );
}
