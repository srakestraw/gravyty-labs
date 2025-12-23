'use client';

import { MOCK_SEGMENTS } from '@/lib/segments/mock-segments';
import type { WorkspaceContext } from '@/lib/contacts';

/**
 * SegmentPicker - Shared component for selecting segments
 * 
 * This component is intended to be embedded in:
 * - Agent creation flow (scope selection)
 * - AI Assistant flows
 * - Campaign builder
 */
interface SegmentPickerProps {
  value?: string; // segment id
  onChange?: (id: string) => void;
  workspace?: WorkspaceContext;
  className?: string;
}

export function SegmentPicker({
  value,
  onChange,
  workspace,
  className,
}: SegmentPickerProps) {
  // Filter segments by workspace if provided
  // For now, we'll show all segments since mock data doesn't have workspace filtering
  const segments = MOCK_SEGMENTS;

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Segment
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Select a segment...</option>
        {segments.map((segment) => (
          <option key={segment.id} value={segment.id}>
            {segment.name}
          </option>
        ))}
      </select>
      {value && segments.find((s) => s.id === value)?.description && (
        <p className="mt-1 text-xs text-gray-500">
          {segments.find((s) => s.id === value)?.description}
        </p>
      )}
    </div>
  );
}







