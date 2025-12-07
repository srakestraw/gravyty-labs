import StudentDetailClient from './StudentDetailClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default function StudentDetailPage({ params }: PageProps) {
  return <StudentDetailClient studentId={params.id} />;
}
