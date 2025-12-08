import { SectionDetailClient } from './SectionDetailClient';

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

export default function SectionDetailPage({ params }: PageProps) {
  return <SectionDetailClient sectionId={params.id} />;
}
