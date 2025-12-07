import { AgentForm } from "../_components/agent-form";

export const dynamic = 'force-static';

// Required for static export with dynamic routes
export function generateStaticParams() {
  // Return empty array - this route will be handled dynamically in dev
  return [];
}

interface AgentPageProps {
  params: { id: string };
}

export default function AgentEditPage({ params }: AgentPageProps) {
  const { id } = params;

  // Simple mapping for now - in a real app, this would fetch from an API
  const isTranscriptHelper = id === "agent-transcript-helper";

  const agentName = isTranscriptHelper ? "Transcript Helper Agent" : `Agent ${id}`;
  const purpose = isTranscriptHelper
    ? "Identifies applicants with missing transcripts and triggers reminder workflows."
    : "Agent purpose description";
  const status = isTranscriptHelper ? "Active" : "Active";
  const lastRun = isTranscriptHelper ? "12 minutes ago" : "Never";
  const nextRun = isTranscriptHelper ? "Tomorrow at 8:00 AM" : "Not scheduled";

  return (
    <AgentForm
      mode="edit"
      agentId={id}
      initialData={{
        name: agentName,
        purpose,
        role: "Admissions",
        status,
        lastRun,
        nextRun,
      }}
    />
  );
}
