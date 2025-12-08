import { InstructorDetailClient } from './InstructorDetailClient';

// Required for static export with dynamic routes
export const dynamicParams = false;

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
