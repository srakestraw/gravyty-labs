"use client";

import { AgentDetailPageClient } from "@/components/shared/ai-platform/AgentDetailPageClient";

export const dynamic = 'force-static';

// Required for static export with dynamic routes
export async function generateStaticParams() {
  // Return known agent IDs for static generation
  return [
    { id: 'agent-transcript-helper' },
    { id: 'agent-registration-requirements' },
    { id: 'agent-high-intent-prospect' },
    { id: 'agent-donor-warmup' },
    { id: 'agent-international-visa' },
  ];
}

interface AgentPageProps {
  params: { id: string };
}

export default function AgentEditPage({ params }: AgentPageProps) {
  const { id } = params;
  return <AgentDetailPageClient agentId={id} />;
}
