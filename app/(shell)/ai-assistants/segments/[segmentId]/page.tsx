'use client';

import { SegmentDetailPageClient } from '@/components/shared/ai-platform/segments/SegmentDetailPageClient';

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

