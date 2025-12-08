import { InstructorDetailClient } from './InstructorDetailClient';

export const dynamic = 'force-static';

// Required for static export with dynamic routes
// Return placeholder to satisfy static export requirement
// Actual routes will be handled client-side
export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function InstructorViewPage({ params }: PageProps) {
  return <InstructorDetailClient instructorId={params.id} />;
}
