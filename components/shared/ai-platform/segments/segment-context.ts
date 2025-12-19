import type { SegmentDefinition } from './types';
import { getSegmentById } from './mock-data';

type SearchParams = Record<string, string | string[] | undefined>;

export function getSegmentIdFromSearchParams(searchParams: SearchParams): string | undefined {
  const segment = searchParams.segment;
  if (typeof segment === 'string') {
    return segment;
  }
  if (Array.isArray(segment) && segment.length > 0) {
    return segment[0];
  }
  return undefined;
}

export function getSegmentFromSearchParams(searchParams: SearchParams): SegmentDefinition | undefined {
  const segmentId = getSegmentIdFromSearchParams(searchParams);
  if (!segmentId) return undefined;
  return getSegmentById(segmentId);
}






