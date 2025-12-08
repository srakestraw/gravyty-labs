import { InstructorDetailClient } from './InstructorDetailClient';

// Required for static export with dynamic routes
export function generateStaticParams() {
  return Promise.resolve([]);
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function InstructorViewPage({ params }: PageProps) {
  return <InstructorDetailClient instructorId={params.id} />;
}
