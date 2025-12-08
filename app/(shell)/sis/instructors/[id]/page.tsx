import { InstructorDetailClient } from './InstructorDetailClient';

export const dynamic = 'force-static';

// Required for static export with dynamic routes
export async function generateStaticParams() {
  // Return empty array for static export - routes will be generated at runtime
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
