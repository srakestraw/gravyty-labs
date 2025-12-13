"use client";

import { AgentForm } from "@/app/(shell)/ai-assistants/agents/_components/agent-form";
import type { AiPlatformPageContext } from '@/components/shared/ai-platform/types';
import { getAiPlatformBasePath } from '@/components/shared/ai-platform/types';

interface AgentDetailPageClientProps {
  agentId: string;
  context?: AiPlatformPageContext;
}

export function AgentDetailPageClient({ agentId, context }: AgentDetailPageClientProps) {
  const basePath = getAiPlatformBasePath(context);
  // Simple mapping for now - in a real app, this would fetch from an API
  const isTranscriptHelper = agentId === "agent-transcript-helper";

  const agentName = isTranscriptHelper ? "Transcript Helper Agent" : `Agent ${agentId}`;
  const purpose = isTranscriptHelper
    ? "Identifies applicants with missing transcripts and triggers reminder workflows."
    : "Agent purpose description";
  const status = isTranscriptHelper ? "Active" : "Active";
  const lastRun = isTranscriptHelper ? "12 minutes ago" : "Never";
  const nextRun = isTranscriptHelper ? "Tomorrow at 8:00 AM" : "Not scheduled";

  return (
    <AgentForm
      mode="edit"
      agentId={agentId}
      initialData={{
        name: agentName,
        purpose,
        role: "Admissions",
        status,
        lastRun,
        nextRun,
      }}
      basePath={basePath}
    />
  );
}

