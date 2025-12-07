export async function generateStaticParams() {
  return [];
}

import { InstructorDetailClient } from './InstructorDetailClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default function InstructorViewPage({ params }: PageProps) {
  return <InstructorDetailClient instructorId={params.id} />;
}
