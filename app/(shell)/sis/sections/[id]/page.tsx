export async function generateStaticParams() {
  return [];
}

import { SectionDetailClient } from './SectionDetailClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default function SectionDetailPage({ params }: PageProps) {
  return <SectionDetailClient sectionId={params.id} />;
}
