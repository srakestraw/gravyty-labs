'use client';

import Link from 'next/link';
import type { AiPlatformPageContext } from '@/components/shared/ai-platform/types';
import { getAiPlatformBasePath } from '@/components/shared/ai-platform/types';
import { getSegmentById } from './mock-data';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface SegmentDetailPageClientProps {
  segmentId: string;
  context?: AiPlatformPageContext;
}

export function SegmentDetailPageClient({ segmentId, context }: SegmentDetailPageClientProps) {
  const basePath = getAiPlatformBasePath(context);
  const segment = getSegmentById(segmentId);

  if (!segment) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href={`${basePath}/segments`}
            className="text-sm text-primary hover:underline"
          >
            ← Back to Segments
          </Link>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h1 className="text-xl font-semibold text-gray-900">Segment Not Found</h1>
          <p className="mt-2 text-sm text-gray-500">
            The segment with ID "{segmentId}" could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link
          href={`${basePath}/segments`}
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <FontAwesomeIcon icon="fa-solid fa-arrow-left" className="h-4 w-4" />
          Back to Segments
        </Link>
      </div>

      {/* Segment Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{segment.title}</h1>
            {segment.description && (
              <p className="mt-2 text-base text-gray-600">{segment.description}</p>
            )}
          </div>
        </div>

        {/* Tags */}
        {segment.tags && segment.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {segment.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`${basePath}/agent-ops/queue?segment=${segmentId}`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            <FontAwesomeIcon icon="fa-solid fa-list" className="h-4 w-4" />
            Use in Queue
          </Link>
          <Link
            href={`${basePath}/assistant?segment=${segmentId}`}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FontAwesomeIcon icon="fa-solid fa-comments" className="h-4 w-4" />
            Use in Assistant
          </Link>
        </div>
      </div>

      {/* Insights Placeholder */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Insights</h2>
        <div className="space-y-4">
          <div className="rounded-md bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Total Count</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">--</p>
              </div>
              <FontAwesomeIcon icon="fa-solid fa-users" className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="rounded-md bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Last Updated</p>
                <p className="mt-1 text-sm text-gray-600">--</p>
              </div>
              <FontAwesomeIcon icon="fa-solid fa-clock" className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





