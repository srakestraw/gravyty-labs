import StudentDetailClient from './StudentDetailClient';

export const dynamic = 'force-static';

export async function generateStaticParams() {
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
