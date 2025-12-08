import { AgentForm } from "../_components/agent-form";

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
