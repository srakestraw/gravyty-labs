"use client";

import type { AiPlatformPageContext } from '@/components/shared/ai-platform/types';
import { AgentsPageClient } from '@/components/shared/agents/AgentsPageClient';

export function AgentsListPageClient({ context }: { context?: AiPlatformPageContext }) {
  // Reuse the existing AgentsPageClient but pass context
  // Since AgentsPageClient now accepts context, we can pass it directly
  return <AgentsPageClient context={context} />;
}

