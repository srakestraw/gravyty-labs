'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';
import { MOCK_SEGMENTS, getSegmentById } from './mock-data';

interface SegmentPickerProps {
  segmentId?: string;
  recommendedIds?: string[];
  onChange: (nextSegmentId?: string) => void;
}

export function SegmentPicker({ segmentId, recommendedIds = [], onChange }: SegmentPickerProps) {
  const currentSegment = segmentId ? getSegmentById(segmentId) : undefined;

  // Get recommended segments
  const recommendedSegments = recommendedIds
    .map((id) => getSegmentById(id))
    .filter((seg): seg is NonNullable<typeof seg> => seg !== undefined);

  // Get all other segments (excluding recommended ones)
  const otherSegments = MOCK_SEGMENTS.filter(
    (seg) => !recommendedIds.includes(seg.id)
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default" className="gap-2 text-sm px-3 py-1.5">
          <FontAwesomeIcon icon="fa-solid fa-filter" className="h-4 w-4" />
          <span>{currentSegment ? currentSegment.title : 'Select segment'}</span>
          <FontAwesomeIcon icon="fa-solid fa-chevron-down" className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 max-h-96 overflow-y-auto">
        <DropdownMenuLabel>Segment</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Recommended segments */}
        {recommendedSegments.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-gray-500">
              Recommended
            </DropdownMenuLabel>
            {recommendedSegments.map((seg) => (
              <DropdownMenuItem
                key={seg.id}
                onClick={() => onChange(seg.id)}
                className={cn(segmentId === seg.id && 'bg-gray-100')}
              >
                <FontAwesomeIcon
                  icon="fa-solid fa-star"
                  className="h-3 w-3 mr-2 text-yellow-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{seg.title}</div>
                  {seg.description && (
                    <div className="text-xs text-gray-500 truncate">{seg.description}</div>
                  )}
                </div>
                {segmentId === seg.id && (
                  <FontAwesomeIcon
                    icon="fa-solid fa-circle-check"
                    className="h-4 w-4 ml-2 text-primary"
                  />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {/* All segments */}
        <DropdownMenuLabel className="text-xs text-gray-500">
          All Segments
        </DropdownMenuLabel>
        {otherSegments.map((seg) => (
          <DropdownMenuItem
            key={seg.id}
            onClick={() => onChange(seg.id)}
            className={cn(segmentId === seg.id && 'bg-gray-100')}
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium">{seg.title}</div>
              {seg.description && (
                <div className="text-xs text-gray-500 truncate">{seg.description}</div>
              )}
            </div>
            {segmentId === seg.id && (
              <FontAwesomeIcon
                icon="fa-solid fa-circle-check"
                className="h-4 w-4 ml-2 text-primary"
              />
            )}
          </DropdownMenuItem>
        ))}

        {segmentId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onChange(undefined)} className="text-gray-500">
              Clear segment
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}



