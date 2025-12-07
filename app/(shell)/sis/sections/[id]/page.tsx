import { SectionDetailClient } from './SectionDetailClient';

export const dynamic = 'force-static';

// Required for static export with dynamic routes
export function generateStaticParams() {
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
