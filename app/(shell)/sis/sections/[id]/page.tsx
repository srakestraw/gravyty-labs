import { SectionDetailClient } from './SectionDetailClient';

export const dynamic = 'force-static';
export const dynamicParams = false;

// Required for static export with dynamic routes
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
