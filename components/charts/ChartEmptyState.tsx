'use client';

interface ChartEmptyStateProps {
  message?: string;
}

/**
 * Empty state component for charts.
 */
export function ChartEmptyState({ message = 'No data available yet.' }: ChartEmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-48 text-center">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}






