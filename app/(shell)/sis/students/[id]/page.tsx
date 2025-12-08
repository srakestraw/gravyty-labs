import StudentDetailClient from './StudentDetailClient';

// Required for static export with dynamic routes
export const dynamicParams = false;

// Return empty array since student IDs are dynamic and not known at build time
export const generateStaticParams = async (): Promise<Array<{ id: string }>> => {
  return [];
};

interface PageProps {
  params: {
    id: string;
  };
}

export default function StudentDetailPage({ params }: PageProps) {
  return <StudentDetailClient studentId={params.id} />;
}
