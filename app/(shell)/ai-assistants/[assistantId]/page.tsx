import { mockAssistants } from '../lib/data';
import { AssistantDetailClient } from './AssistantDetailClient';

export const dynamic = 'force-static';

// Required for static export with dynamic routes
export async function generateStaticParams() {
  return mockAssistants.map((assistant) => ({
    assistantId: assistant.id,
  }));
}

interface PageProps {
  params: {
    assistantId: string;
  };
}

export default function AssistantOverviewPage({ params }: PageProps) {
  return <AssistantDetailClient assistantId={params.assistantId} />;
}
