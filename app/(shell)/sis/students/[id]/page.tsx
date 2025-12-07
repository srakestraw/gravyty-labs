import StudentDetailClient from './StudentDetailClient';

export const dynamic = 'force-static';

// Required for static export with dynamic routes
// Return empty array since student IDs are dynamic and not known at build time
export function generateStaticParams() {
  return [];
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function StudentDetailPage({ params }: PageProps) {
  return <StudentDetailClient studentId={params.id} />;
}
