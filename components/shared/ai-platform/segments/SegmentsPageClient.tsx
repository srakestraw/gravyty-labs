'use client';

import Link from 'next/link';
import type { AiPlatformPageContext } from '@/components/shared/ai-platform/types';
import { getAiPlatformBasePath } from '@/components/shared/ai-platform/types';
import { MOCK_SEGMENTS, getSegmentsByWorkspace, getSegmentById } from './mock-data';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

export function SegmentsPageClient({ context }: { context?: AiPlatformPageContext }) {
  const basePath = getAiPlatformBasePath(context);
  
  // Get recommended segments from context defaults
  const recommendedSegmentIds = context?.defaults?.recommendedSegments || [];
  const recommendedSegments = recommendedSegmentIds
    .map((id) => getSegmentById(id))
    .filter((seg): seg is NonNullable<typeof seg> => seg !== undefined);

  // Get all segments, filtered by workspace if applicable
  const allSegments = getSegmentsByWorkspace(
    context?.workspaceId,
    context?.appId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Segments</h1>
        {context?.mode === 'workspace' && context?.workspaceId && (
          <p className="mt-1 text-sm text-gray-500 capitalize">{context.workspaceId.replace('-', ' ')}</p>
        )}
      </div>

      {/* Recommended Segments Section */}
      {recommendedSegments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon="fa-solid fa-star" className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">Recommended</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedSegments.map((segment) => (
              <Link
                key={segment.id}
                href={`${basePath}/segments/${segment.id}`}
                className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary">
                      {segment.title}
                    </h3>
                    {segment.description && (
                      <p className="mt-1 text-sm text-gray-500">{segment.description}</p>
                    )}
                  </div>
                  <FontAwesomeIcon
                    icon="fa-solid fa-star"
                    className="h-4 w-4 text-yellow-500 flex-shrink-0 ml-2"
                  />
                </div>
                {segment.tags && segment.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {segment.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Segments Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">All Segments</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allSegments.map((segment) => {
            const isRecommended = recommendedSegmentIds.includes(segment.id);
            return (
              <Link
                key={segment.id}
                href={`${basePath}/segments/${segment.id}`}
                className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary">
                        {segment.title}
                      </h3>
                      {isRecommended && (
                        <FontAwesomeIcon
                          icon="fa-solid fa-star"
                          className="h-4 w-4 text-yellow-500"
                        />
                      )}
                    </div>
                    {segment.description && (
                      <p className="mt-1 text-sm text-gray-500">{segment.description}</p>
                    )}
                  </div>
                </div>
                {segment.tags && segment.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {segment.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

