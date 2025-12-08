import { InstructorDetailClient } from './InstructorDetailClient';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return [];
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function InstructorViewPage({ params }: PageProps) {
  return <InstructorDetailClient instructorId={params.id} />;
}
