import { InstructorDetailClient } from './InstructorDetailClient';

// Required for static export with dynamic routes
export async function generateStaticParams() {
  // Return empty array since instructor IDs are dynamic and not known at build time
  // This allows the route to be statically generated but pages will be created on-demand
  return [];
}

export const dynamic = 'force-static';
export const dynamicParams = false;

interface PageProps {
  params: {
    id: string;
  };
}

export default function InstructorViewPage({ params }: PageProps) {
  return <InstructorDetailClient instructorId={params.id} />;
}
