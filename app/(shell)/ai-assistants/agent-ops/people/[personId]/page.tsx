import { getPersonById, MOCK_PEOPLE } from '@/lib/agent-ops/people-mock';
import { PersonDetailClient } from './PersonDetailClient';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import Link from 'next/link';

interface PersonDetailPageProps {
  params: { personId: string };
}

// Required for static export with dynamic routes
export function generateStaticParams() {
  return MOCK_PEOPLE.map((person) => ({
    personId: person.id,
  }));
}

export default function PersonDetailPage({ params }: PersonDetailPageProps) {
  const person = getPersonById(params.personId);

  if (!person) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FontAwesomeIcon icon="fa-solid fa-user-slash" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Person Not Found</h2>
          <p className="text-sm text-gray-600 mb-4">The person you're looking for doesn't exist.</p>
          <Link href="/ai-assistants/agent-ops/people">
            <Button variant="outline">Back to People</Button>
          </Link>
        </div>
      </div>
    );
  }

  return <PersonDetailClient person={person} />;
}

