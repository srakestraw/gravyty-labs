import { SegmentDetailPageClient } from '@/components/shared/ai-platform/segments/SegmentDetailPageClient';

// Required for static export with dynamic routes
export async function generateStaticParams() {
  // Return empty array for dynamic segments - they'll be generated on demand
  return [];
}

export default function AiAssistantsSegmentDetailPage({
  params,
}: {
  params: { segmentId: string };
}) {
  return (
    <main className="space-y-6 p-6">
      <SegmentDetailPageClient segmentId={params.segmentId} />
    </main>
  );
}

