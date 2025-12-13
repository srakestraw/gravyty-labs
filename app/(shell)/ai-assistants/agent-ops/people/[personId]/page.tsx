import { getPersonById, MOCK_PEOPLE } from '@/lib/agent-ops/people-mock';
import { AgentOpsPersonDetailPageClient } from '@/components/shared/ai-platform/AgentOpsPersonDetailPageClient';

interface PersonDetailPageProps {
  params: { personId: string };
}

// Required for static export with dynamic routes
export async function generateStaticParams() {
  return MOCK_PEOPLE.map((person) => ({
    personId: person.id,
  }));
}

export default function PersonDetailPage({ params }: PersonDetailPageProps) {
  const person = getPersonById(params.personId) ?? null;
  return <AgentOpsPersonDetailPageClient person={person} />;
}

