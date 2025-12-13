import { SegmentDetailPageClient } from '@/components/shared/ai-platform/segments/SegmentDetailPageClient';

export const dynamic = 'force-static';

// Required for static export with dynamic routes
// Return placeholder to satisfy static export requirement
// Actual routes will be handled client-side
export async function generateStaticParams() {
  return [{ segmentId: 'placeholder' }];
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

